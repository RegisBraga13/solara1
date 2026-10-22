// Rodada 3: editor de modelo (prompt, config avançada, transcrição de exemplo, prévia que não salva),
// abas do cadastro de paciente e card Evolução da nova consulta. Nada é salvo.
const path = require("path");
const fs = require("fs");
const { chromium } = require("C:/Users/Regis/Downloads/especialidades/frontend/node_modules/playwright-core");

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const BASE = "https://solara.doctor";
const r = {};

function forma(v, prof = 0) {
  if (prof > 6) return "…";
  if (Array.isArray(v)) return v.length ? [forma(v[0], prof + 1)] : [];
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v).slice(0, 60)) o[k] = forma(v[k], prof + 1); return o; }
  return v === null ? "null" : typeof v;
}

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9333");
  const page = await browser.contexts()[0].newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  const shot = (n) => page.screenshot({ path: path.join(OUT, n + ".png"), fullPage: true }).catch(() => {});

  const chamadas = [];
  page.on("request", (req) => {
    const u = new URL(req.url());
    if (!u.host.endsWith("solara.doctor") || !["xhr", "fetch", "eventsource", "websocket"].includes(req.resourceType())) return;
    const h = req.headers();
    chamadas.push({
      metodo: req.method(), caminho: u.pathname, query: [...u.searchParams.keys()], tipo: req.resourceType(),
      nextAction: !!h["next-action"], contentType: h["content-type"] || null,
      corpoTamanho: (req.postData() || "").length,
    });
  });
  page.on("response", async (res) => {
    const u = new URL(res.url());
    if (!u.host.endsWith("solara.doctor") || u.searchParams.has("_rsc")) return;
    if (!["xhr", "fetch", "eventsource"].includes(res.request().resourceType())) return;
    const item = chamadas.find((c) => c.caminho === u.pathname && c.status === undefined);
    if (!item) return;
    item.status = res.status();
    item.respContentType = res.headers()["content-type"] || null;
    try { if ((item.respContentType || "").includes("json")) item.resposta = forma(await res.json()); } catch {}
  });

  // 1) Modelo em uso: editor, texto completo do prompt, configuração avançada, transcrição de exemplo, prévia.
  await page.goto(BASE + "/app/modelos", { waitUntil: "networkidle" }).catch(() => {});
  await page.getByRole("button", { name: "Editar modelo" }).first().click();
  await page.waitForTimeout(1200);
  await page.getByText("Configuração avançada").first().click().catch(() => {});
  await page.getByText("Ver transcrição usada").first().click().catch(() => {});
  await page.waitForTimeout(800);
  r.editor = await page.evaluate(() => ({
    textareas: [...document.querySelectorAll("textarea")].map((t) => ({ placeholder: t.placeholder, valor: t.value })),
    inputs: [...document.querySelectorAll("[role=dialog] input, [role=dialog] select, aside input, aside select")].map((e) => ({
      tipo: e.type, label: (e.labels && e.labels[0] && e.labels[0].innerText.trim()) || e.getAttribute("aria-label") || e.placeholder,
      valor: e.value, opcoes: e.tagName === "SELECT" ? [...e.options].map((o) => o.text) : undefined,
    })),
    texto: (document.querySelector("[role=dialog]") || document.body).innerText.slice(0, 9000),
  }));
  await shot("01_editor_avancado");
  await page.getByRole("button", { name: /Gerar prévia/ }).first().click().catch((e) => (r.erroPrevia = String(e)));
  // espera a prévia terminar (até 90 s)
  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(2000);
    const pronto = await page.evaluate(() => !/Clique em Gerar prévia/.test(document.body.innerText) && !/Gerando/i.test(document.body.innerText));
    if (pronto) break;
  }
  await page.waitForTimeout(1500);
  r.previa = await page.evaluate(() => (document.querySelector("[role=dialog]") || document.body).innerText.slice(0, 9000));
  await shot("02_editor_previa");
  await page.keyboard.press("Escape").catch(() => {});

  // 2) Modelo padrão da Solara (Anamnese): "Ver detalhes"
  await page.goto(BASE + "/app/modelos", { waitUntil: "networkidle" }).catch(() => {});
  await page.locator("button", { hasText: /^Anamnese\s*PADRÃO/ }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Ver detalhes" }).first().click().catch(() => {});
  await page.waitForTimeout(1200);
  await page.getByText("Configuração avançada").first().click().catch(() => {});
  r.padraoAnamnese = await page.evaluate(() => ({
    textareas: [...document.querySelectorAll("textarea")].map((t) => ({ placeholder: t.placeholder, valor: t.value })),
    texto: (document.querySelector("[role=dialog]") || document.body).innerText.slice(0, 6000),
  }));
  await shot("03_padrao_anamnese");
  await page.keyboard.press("Escape").catch(() => {});

  // 3) Cadastro de paciente: abas Contato e Clínico (sem criar)
  await page.goto(BASE + "/app/pacientes", { waitUntil: "networkidle" }).catch(() => {});
  await page.getByRole("button", { name: /Novo paciente/ }).first().click();
  await page.waitForTimeout(800);
  r.paciente = {};
  for (const aba of ["Contato", "Clínico"]) {
    await page.getByText(aba, { exact: true }).first().click().catch(() => {});
    await page.waitForTimeout(800);
    r.paciente[aba] = await page.evaluate(() => [...document.querySelectorAll("input,select,textarea")].filter((e) => e.offsetParent).map((e) => ({
      tipo: e.type, label: (e.closest("label") && e.closest("label").innerText.trim()) || (e.labels && e.labels[0] && e.labels[0].innerText.trim()) || e.placeholder,
      opcoes: e.tagName === "SELECT" ? [...e.options].map((o) => o.text) : undefined,
    })));
    r.paciente[aba + "_texto"] = await page.evaluate(() => document.body.innerText.slice(-2500));
    await shot("04_paciente_" + aba);
  }
  await page.keyboard.press("Escape").catch(() => {});

  // 4) Nova consulta: card Evolução e teleconsulta do menu (só abre, não inicia)
  await page.goto(BASE + "/app/consulta/nova", { waitUntil: "networkidle" }).catch(() => {});
  await page.locator("button", { hasText: /^Evolução/ }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(800);
  r.novaEvolucao = await page.evaluate(() => document.querySelector("aside") ? document.querySelector("aside").innerText : "");
  await shot("05_nova_consulta_evolucao");

  r.chamadas = chamadas;
  fs.writeFileSync(path.join(OUT, "rodada3.json"), JSON.stringify(r, null, 2));
  console.log("ok; chamadas:", chamadas.length, r.erroPrevia || "");
  await page.close();
  await browser.close().catch(() => {});
})().catch((e) => { console.error(e); process.exit(1); });
