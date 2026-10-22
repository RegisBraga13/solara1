import sys

p = sys.argv[1]
t = open(p, encoding="utf-8").read()


def rep(a, b):
    global t
    assert t.count(a) == 1, a[:80]
    t = t.replace(a, b)


rep("""**Não acessado:** `/app`, `/login`, `/signup`, `/onboarding`, `/api/*`, `/pair/*`, `/record/*`, `/m/*`.
Essas rotas exigem login e o `robots.txt` as bloqueia para robôs, por isso tudo que se refere a elas é **inferido**.
""", """- **App logado (`/app`), em 2026-10-22**, com a conta de teste do usuário e autorização dele: navegação só de leitura (telas, menus, diálogos, formulários abertos e fechados sem salvar) e uma prévia de modelo que a própria tela declara não salvar. Detalhes na seção 0.4.

**Não visto:** a tela de gravação em andamento e a do documento gerado (exigem gravar com microfone), além de `/pair/*`, `/record/*`, `/m/*` e `/onboarding`. O que se refere a elas continua **inferido**.
""")

rep("""| **[O]** | Observado diretamente (código, cabeçalho, texto público) |""",
    """| **[O]** | Observado diretamente (código, cabeçalho, texto público ou tela do app logado) |""")

rep("""| Organização: Solara Health Tecnologia Ltda., São Paulo/SP | JSON-LD `Organization` | [O] |
""", """| Organização: Solara Health Tecnologia Ltda., São Paulo/SP | JSON-LD `Organization` | [O] |
| O app é um Next.js full-stack: as telas vêm como React Server Components (`?_rsc=`), sem API REST de dados no navegador | rede do `/app` | [O] |
| Rota de API própria em `/api/*` com streaming: `POST /api/templates/preview` (JSON) responde `text/event-stream` | rede do `/app` | [O] |
| O LLM é o **Claude** (Anthropic): "Defina como o Claude deve redigir a partir da transcrição da consulta" | editor de modelo | [O] |
| GA4, Google Ads (remarketing e conversão) e DoubleClick carregam **dentro do `/app`** | rede do `/app` | [O] |
""")

rep("""| C7 | Copilot "referenciado com UpToDate, BMJ" | Exige licença comercial dessas bases | Usar apenas fontes licenciadas ou abertas (diretrizes de sociedades brasileiras, PCDT do Ministério da Saúde, bulas da ANVISA) |
""", """| C7 | Copilot "referenciado com UpToDate, BMJ" | Exige licença comercial dessas bases | Usar apenas fontes licenciadas ou abertas (diretrizes de sociedades brasileiras, PCDT do Ministério da Saúde, bulas da ANVISA) |
| C8 | Site anuncia Copilot, assinatura ICP-Brasil, receita, atestado, encaminhamento, WhatsApp, insights, plano Clínica | O app observado tem 5 áreas (Consultas, Agenda, Pacientes, Modelos, Ajustes). Nenhuma tela de Copilot, assinatura digital, cobrança, equipe, insights ou envio. Receita, atestado e encaminhamento existem só como **categorias de modelo** | O escopo real do produto hoje é o escriba (anamnese e evolução) + agenda + pacientes + modelos. Os demais módulos são roadmap: construir depois do MVP (ver ordem no `instructions.md`) |
| C9 | "LGPD não é checkbox", "dados criptografados" | Rastreadores de anúncio do Google rodam nas telas com dados de pacientes; a URL da página vai para o Google | **Proibido** qualquer analytics de terceiros ou pixel de anúncio em `/app`, `/pair`, `/record` e `/m` (teste automatizado no M21) |
| C10 | Site: "áudio descartado após gerar o documento". App: "o áudio original é apagado imediatamente após a transcrição" | Duas promessas diferentes | Padrão do projeto: apagar o áudio quando a transcrição final estiver gravada (RN-17), com opção de reter por até 30 dias |
""")

NEW04 = open(sys.argv[2], encoding="utf-8").read()
rep("""
---

## 1. Engenharia reversa de escopo e funcionalidades
""", "\n" + NEW04 + """
---

## 1. Engenharia reversa de escopo e funcionalidades
""")

rep("""| RN-17 | Retenção do áudio configurável: imediata, 7 dias ou 30 dias (padrão: 7 dias após a assinatura do documento ou após a geração, se nunca assinado). Um job de expurgo apaga do S3, verifica que apagou e registra auditoria. O texto da transcrição segue a retenção do prontuário |""",
    """| RN-17 | Retenção do áudio configurável: imediata, 7 dias ou 30 dias. **Padrão: imediata**, isto é, o áudio é apagado quando a transcrição final estiver gravada e confirmada, como no app de referência [O]. Um job de expurgo apaga do S3, verifica que apagou e registra auditoria. O texto da transcrição segue a retenção do prontuário |""")

rep("""  audio_retention text NOT NULL DEFAULT 'P7D'        -- ISO-8601: PT0S, P7D, P30D""",
    """  audio_retention text NOT NULL DEFAULT 'PT0S'       -- ISO-8601: PT0S (padrão, RN-17), P7D, P30D""")

rep("""  birth_date     date NOT NULL,""", """  birth_date     date,                                 -- opcional no app de referência
  age_years_at_registration smallint CHECK (age_years_at_registration BETWEEN 0 AND 130),
  avatar_color   text,""")

rep("""  health_plan    jsonb,                                -- {operadora, carteirinha_enc?}""",
    """  health_plan    jsonb,                                -- {operadora: 'PARTICULAR'|'UNIMED'|...|'SUS', carteirinha_enc?}""")

rep("""  patient_id     uuid NOT NULL REFERENCES patients(id),
  appointment_id uuid REFERENCES appointments(id),
  kind           encounter_kind NOT NULL,""", """  patient_id     uuid REFERENCES patients(id),         -- nulo até atribuir na tela do documento (0.4)
  appointment_id uuid REFERENCES appointments(id),
  kind           encounter_kind NOT NULL,
  modality       text NOT NULL DEFAULT 'PRESENCIAL' CHECK (modality IN ('PRESENCIAL','TELECONSULTA')),""")

rep("""CREATE TYPE document_type         AS ENUM ('ANAMNESE', 'EVOLUCAO', 'RECEITA', 'ATESTADO',
                                           'ENCAMINHAMENTO', 'LAUDO', 'PERSONALIZADO');""",
    """CREATE TYPE document_type         AS ENUM ('ANAMNESE', 'EVOLUCAO', 'RECEITA', 'ATESTADO',
                                           'ENCAMINHAMENTO', 'LAUDO', 'SOLICITACAO', 'PERSONALIZADO');""")

rep("""  definition  jsonb NOT NULL,     -- {sections:[{key,title,format,required,instructions,example}],tone,detailLevel}""",
    """  definition  jsonb NOT NULL,     -- {systemInstructions?, userPromptFormat? ({patient_context},{transcript}),
                                  --  body? (Markdown com @variaveis), sections:[{key,title,required}], tone, detailLevel}""")

rep("""  code          text NOT NULL,                          -- 'BP_SYS','BP_DIA','HR','WEIGHT','HEIGHT','LAB:<loinc>'""",
    """  code          text NOT NULL,                          -- 'BP_SYS','BP_DIA','HR','SPO2','WEIGHT','HEIGHT','LAB:<loinc>'""")

ini = t.index("### 5.2 Estrutura de telas do `/app` [I]")
fim = t.index("### 5.3 Componentes reutilizáveis")
NEW52 = open(sys.argv[3], encoding="utf-8").read()
t = t[:ini] + NEW52 + t[fim:]

rep("""| `ProgressSteps` | — | "1 Configurar · 2 Gravar · 3 Receber documento" [O] |""",
    """| `ProgressSteps` | — | "1 Configurar · 2 Gravar · 3 Receber documento" [O] |
| `StatCard` de indicador | — | Rótulo mono em caixa alta, número grande em serifa, linha de apoio com ícone ("próxima às 11:25") [O] |
| `FilterPills` | — | Pílulas com contagem ("Todas 0", "Primeira consulta 0") [O] |
| `ChoiceCard` | — | Cartão selecionável com ícone, título, descrição e marcação circular âmbar (tipo de documento, tipo de agendamento) [O] |
| `MasterDetail` | — | Lista à esquerda, detalhe ao centro, painel opcional à direita (Pacientes, Modelos) [O] |
| `TemplateEditor` | TipTap | Instruções ao modelo com "Inserir variável", formato da pergunta, prévia ao vivo em streaming com transcrição de exemplo [O] |
| `VariableChip` | — | `@paciente.nome` em fonte mono com fundo âmbar claro (paciente) ou verde-água claro (médico, data) [O] |""")

open(p, "w", encoding="utf-8").write(t)
print("ok", len(t.splitlines()))
