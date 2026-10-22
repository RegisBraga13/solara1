# Referência: Solara Health (solara.doctor)

Material coletado em 2026-10-22 para estudar o produto concorrente. Repositório privado, separado do app `especialidades`; **não é código para usar no app**.

| Pasta ou arquivo | Conteúdo |
|---|---|
| `ESPECIFICACAO_TECNICA.md` | Engenharia reversa completa: escopo, arquitetura, banco, API, visual, segurança. A seção 0.4 descreve as telas reais do app |
| `instructions.md` | Roteiro para construir um app equivalente, módulo por módulo |
| `site-publico/` | Página inicial, `/recursos`, `robots.txt` e `sitemap.xml`. Em `assets/`: CSS, JavaScript minificado da página de marketing, manifest e service worker |
| `app/rodada1` | Capturas das 5 áreas do app: Consultas, Agenda, Pacientes, Modelos e Ajustes |
| `app/rodada2` | Menus, diálogos e formulários abertos sem salvar |
| `app/rodada3` | Editor de modelo: prompt padrão, configuração avançada, transcrição de exemplo e prévia gerada |
| `app/rodada4` e `app/rodada5` | Ficha do paciente e tela de microfone da gravação |
| `app/*.json` | O que cada tela tem (títulos, botões, campos, opções) e o formato das chamadas de rede, sem valores |
| `scripts/` | Roteiros Playwright usados na navegação (só leitura) e scripts que atualizaram a especificação |

Cuidados:

- **Material de terceiros** (JavaScript, CSS, textos e o prompt padrão do Solara): manter só neste repositório privado e separado. Não copiar para o app `especialidades` nem publicar.
- **Dados pessoais:** `app/rodada1/05_app_ajustes.png` mostra o nome e o e-mail da conta usada.
- **Uso dos scripts:** eles se conectam a um Chrome aberto com `--remote-debugging-port=9333` e dependem do `playwright-core` (o caminho usado está em `C:/Users/Regis/Downloads/especialidades/frontend/node_modules`).
