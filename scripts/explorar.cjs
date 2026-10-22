// Navega o app logado (via CDP), somente leitura: capturas, estrutura da tela e formato das chamadas de API.
// Uso: node explorar.cjs <saida> [rota1 rota2 ...]   (sem rotas: descobre links internos a partir de /app)
const path = require("path");
const fs = require("fs");
const { chromium } = require("C:/Users/Regis/Downloads/especialidades/frontend/node_modules/playwright-core");

const OUT = process.argv[2];
const ROTAS = process.argv.slice(3);
const BASE = "https://solara.doctor";
const MAX_PAGINAS = 45;
fs.mkdirSync(OUT, { recursive: true });

// Formato de um JSON sem os valores: só chaves e tipos.
function forma(v, prof = 0) {
  if (prof > 6) return "…";
  if (Array.isArray(v)) return v.length ? [forma(v[0], prof + 1)] : [];
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v).slice(0, 60)) o[k] = forma(v[k], prof + 1);
    return o;
  }
  return v === null ? "null" : typeof v;
}

function nomeArquivo(url) {
  const p = new URL(url).pathname.replace(/\/+$/, "") || "/";
  return p.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "raiz";
}

(async () => {
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9333");
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const api = new Map();
  page.on("response", async (res) => {
    const req = res.request();
    const u = new URL(res.url());
    const tipo = req.resourceType();
    if (!["xhr", "fetch", "websocket", "eventsource"].includes(tipo)) return;
    const chave = `${req.method()} ${u.host}${u.pathname.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "{id}").replace(/\/\d+(?=\/|$)/g, "/{n}")}`;
    const item = api.get(chave) || { chave, status: new Set(), query: new Set(), resposta: null, corpo: null, headers: null };
    item.status.add(res.status());
    for (const k of u.searchParams.keys()) item.query.add(k);
    try {
      const ct = res.headers()["content-type"] || "";
      if (!item.resposta && ct.includes("json")) item.resposta = forma(await res.json());
      if (!item.corpo && req.postData()) {
        try { item.corpo = forma(JSON.parse(req.postData())); } catch { item.corpo = "(não-JSON)"; }
      }
      if (!item.headers) {
        const h = req.headers();
        item.headers = Object.keys(h).filter((k) => !["cookie", "authorization", "user-agent", "referer"].includes(k) && !k.startsWith("sec-"));
      }
    } catch {}
    api.set(chave, item);
  });
  page.on("websocket", (ws) => {
    const u = new URL(ws.url());
    api.set(`WS ${u.host}${u.pathname}`, { chave: `WS ${u.host}${u.pathname}`, status: new Set(["ws"]), query: new Set([...u.searchParams.keys()]) });
  });

  const fila = ROTAS.length ? ROTAS.map((r) => BASE + r) : [BASE + "/app"];
  const vistas = new Set();
  const resumo = [];

  while (fila.length && vistas.size < MAX_PAGINAS) {
    const url = fila.shift();
    const chaveUrl = url.split("#")[0];
    if (vistas.has(chaveUrl)) continue;
    vistas.add(chaveUrl);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      await page.waitForTimeout(3000);
    }
    await page.waitForTimeout(1500);
    const final = page.url();
    const nome = String(vistas.size).padStart(2, "0") + "_" + nomeArquivo(final);
    await page.screenshot({ path: path.join(OUT, nome + ".png"), fullPage: true }).catch(() => {});

    const info = await page.evaluate(() => {
      const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      const txt = (el) => (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 80);
      return {
        titulo: document.title,
        cabecalhos: [...document.querySelectorAll("h1,h2,h3,h4")].filter(vis).map((h) => h.tagName + " " + txt(h)),
        botoes: [...new Set([...document.querySelectorAll("button,[role=button],[role=tab],[role=menuitem]")].filter(vis).map(txt).filter(Boolean))],
        links: [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))],
        campos: [...document.querySelectorAll("input,select,textarea,[contenteditable=true]")].filter(vis).map((e) => ({
          tag: e.tagName.toLowerCase(), type: e.type || null, name: e.name || null,
          label: (e.labels && e.labels[0] && e.labels[0].innerText.trim()) || e.getAttribute("aria-label") || e.placeholder || null,
          required: !!e.required,
        })),
        landmarks: [...document.querySelectorAll("nav,aside,header,main,[role=dialog]")].filter(vis).map((e) => e.tagName.toLowerCase() + (e.getAttribute("aria-label") ? "[" + e.getAttribute("aria-label") + "]" : "")),
      };
    });
    resumo.push({ pedido: url, final, ...info });

    if (!ROTAS.length) {
      for (const href of info.links) {
        if (!href) continue;
        const abs = new URL(href, final).toString().split("#")[0];
        if (abs.startsWith(BASE + "/app") && !/logout|sair|signout|delete|excluir/i.test(abs) && !vistas.has(abs)) fila.push(abs);
      }
    }
  }

  fs.writeFileSync(path.join(OUT, "telas.json"), JSON.stringify(resumo, null, 2));
  const apis = [...api.values()].map((a) => ({ ...a, status: [...a.status], query: [...(a.query || [])] }));
  fs.writeFileSync(path.join(OUT, "api.json"), JSON.stringify(apis, null, 2));
  console.log(`telas: ${resumo.length}  chamadas distintas: ${apis.length}`);
  for (const r of resumo) console.log(r.final);
  await page.close();
  await browser.close().catch(() => {}); // desconecta do CDP sem fechar o Chrome do usuário
})().catch((e) => { console.error(e); process.exit(1); });
