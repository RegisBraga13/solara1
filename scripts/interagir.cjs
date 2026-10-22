// Rodada 2: abre menus, diálogos e abas sem salvar nada. Fecha cada diálogo com Escape.
const path = require("path");
const fs = require("fs");
const { chromium } = require("C:/Users/Regis/Downloads/especialidades/frontend/node_modules/playwright-core");

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const BASE = "https://solara.doctor";

// Cada passo: rota, ações de clique (texto exato ou regex) e nome da captura. Nada de salvar, enviar ou excluir.
const PASSOS = [
  { rota: "/app", cliques: [{ role: "button", nome: /Iniciar consulta/ }], nome: "home_menu_iniciar" },
  { rota: "/app", cliques: [{ role: "button", nome: "Notificações" }], nome: "home_notificacoes" },
  { rota: "/app", cliques: [{ role: "button", nome: "FR" }], nome: "home_menu_usuario" },
  { rota: "/app/agenda", cliques: [{ texto: "Dia", exato: true }], nome: "agenda_dia" },
  { rota: "/app/agenda", cliques: [{ texto: "Mês", exato: true }], nome: "agenda_mes" },
  { rota: "/app/agenda", cliques: [{ texto: "Lista", exato: true }], nome: "agenda_lista" },
  { rota: "/app/agenda", cliques: [{ role: "button", nome: /^\+?\s*Nova$/ }], nome: "agenda_nova_dialogo" },
  { rota: "/app/agenda", cliques: [{ role: "button", nome: /Nova consulta/, primeiro: true }], nome: "agenda_nova_consulta" },
  { rota: "/app/pacientes", cliques: [{ role: "button", nome: /Novo paciente/ }], nome: "pacientes_novo" },
  { rota: "/app/modelos", cliques: [{ texto: /^Anamnese\s*PADRÃO/ }], nome: "modelo_anamnese_padrao" },
  { rota: "/app/modelos", cliques: [{ texto: /^Evolução \(SOAP\)/ }], nome: "modelo_evolucao_soap" },
  { rota: "/app/modelos", cliques: [{ texto: /^Evolução — Clínica Médica/ }], nome: "modelo_evolucao_cm" },
  { rota: "/app/modelos", cliques: [{ role: "button", nome: "Editar modelo" }], nome: "modelo_editar" },
  { rota: "/app/modelos", cliques: [{ css: "aside button:has(svg), button[aria-label*='ovo']", primeiro: true }], nome: "modelo_novo" },
  { rota: "/app/consulta/nova", cliques: [{ texto: /^Evolução/, primeiro: true }], nome: "nova_consulta_evolucao" },
  { rota: "/app/ajustes", cliques: [{ role: "combobox", primeiro: true }], nome: "ajustes_crm_uf" },
];

const PROIBIDO = /salvar|enviar|excluir|remover|apagar|assinar|pagar|assinatura|sair|logout|iniciar grava/i;

async function descrever(page) {
  return page.evaluate(() => {
    const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const txt = (el) => (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 120);
    const raiz = document.querySelector("[role=dialog],[role=menu],[role=listbox],[data-radix-popper-content-wrapper]") || document.body;
    return {
      emCamada: raiz !== document.body,
      texto: (raiz.innerText || "").replace(/\n{3,}/g, "\n\n").slice(0, 4000),
      botoes: [...new Set([...raiz.querySelectorAll("button,[role=menuitem],[role=option],[role=tab],a")].filter(vis).map(txt).filter(Boolean))],
      campos: [...raiz.querySelectorAll("input,select,textarea,[contenteditable=true]")].filter(vis).map((e) => ({
        tag: e.tagName.toLowerCase(), type: e.type || null,
        label: (e.labels && e.labels[0] && e.labels[0].innerText.trim()) || e.getAttribute("aria-label") || e.placeholder || null,
        opcoes: e.tagName === "SELECT" ? [...e.options].map((o) => o.text).slice(0, 40) : undefined,
      })),
    };
  });
}

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9333");
  const page = await browser.contexts()[0].newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  const saida = [];
  let i = 0;
  for (const p of PASSOS) {
    i++;
    const reg = { passo: p.nome, ok: true };
    try {
      await page.goto(BASE + p.rota, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1200);
      for (const c of p.cliques) {
        let alvo;
        if (c.role) alvo = page.getByRole(c.role, { name: c.nome });
        else if (c.css) alvo = page.locator(c.css);
        else alvo = page.getByText(c.texto, { exact: !!c.exato });
        alvo = alvo.first();
        const rotulo = ((await alvo.innerText().catch(() => "")) || "").trim();
        if (PROIBIDO.test(rotulo) && !/^Iniciar consulta/.test(rotulo)) throw new Error("bloqueado por segurança: " + rotulo);
        await alvo.click({ timeout: 5000 });
        await page.waitForTimeout(1200);
      }
      reg.url = page.url();
      Object.assign(reg, await descrever(page));
      await page.screenshot({ path: path.join(OUT, String(i).padStart(2, "0") + "_" + p.nome + ".png"), fullPage: true });
    } catch (e) {
      reg.ok = false;
      reg.erro = String(e.message || e).slice(0, 200);
    }
    await page.keyboard.press("Escape").catch(() => {});
    saida.push(reg);
    console.log((reg.ok ? "ok   " : "FALHA") + " " + p.nome + (reg.erro ? " — " + reg.erro : ""));
  }
  fs.writeFileSync(path.join(OUT, "interacoes.json"), JSON.stringify(saida, null, 2));
  await page.close();
  await browser.close().catch(() => {});
})().catch((e) => { console.error(e); process.exit(1); });
