import re
import sys

spec_p, ins_p = sys.argv[1], sys.argv[2]
t = open(spec_p, encoding="utf-8").read()
ins = open(ins_p, encoding="utf-8").read()


def rep(texto, a, b):
    assert texto.count(a) == 1, a[:90]
    return texto.replace(a, b)


# Status real de cada módulo no app observado
status = {
    "M01": "[O] login existe; telas não vistas",
    "M02": "[O] perfil com CRM/UF e especialidade; modelos criados pela especialidade",
    "M03": "Só no site (plano Clínica); ausente no app",
    "M04": "[O] no app (lista, ficha, sinais vitais, abas)",
    "M05": "Só no site (FAQ); não visto no app",
    "M06": "[O] no app (paciente opcional)",
    "M07": "[O] no app (tela de microfone)",
    "M08": "Só no site; não visto no app",
    "M09": "[I] não visto (exige gravação)",
    "M10": "[O] prévia de anamnese; tela do documento não vista",
    "M11": "[O] no app (editor com prompt e prévia)",
    "M12": "Só no site; ausente no app",
    "M13": "Só como categoria de modelo",
    "M14": "Só no site; ausente no app",
    "M15": "[O] no app (sem lembretes visíveis)",
    "M16": "Parcial: 4 indicadores na tela inicial",
    "M17": "Só no site; ausente no app",
    "M18": "Só no site (FAQ); ausente no app",
    "M19": "Selo \"LGPD · dados criptografados\"; auditoria não visível",
    "M20": "[O] sino de notificações",
    "M21": "[O]",
    "M22": "[R]",
}
for m, s in status.items():
    t, n = re.subn(rf"^(\| {m} \|[^|]*\|[^|]*\|) [^|\n]* \|$", rf"\1 {s} |", t, count=1, flags=re.M)
    assert n == 1, m
t = rep(t, "| Código | Módulo | Responsabilidade | Status no original |",
        "| Código | Módulo | Responsabilidade | Status no original (site × app observado) |")

t = rep(t, "2. Seleciona o paciente entre os recentes (1 clique) ou cria um rápido (nome, nascimento, sexo) [O].",
        "2. Opcionalmente informa o paciente: nome, idade e sexo, com \"Salvar como novo paciente\" marcado por padrão. Também pode começar sem paciente e atribuí-lo depois, na tela do documento [O].")

# Consentimento quando o paciente ainda não foi atribuído
t = rep(t, """CREATE TABLE consents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES organizations(id),
  patient_id          uuid NOT NULL REFERENCES patients(id),""", """CREATE TABLE consents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES organizations(id),
  patient_id          uuid REFERENCES patients(id),       -- nulo: consentimento verbal numa consulta ainda sem paciente
  encounter_id        uuid,                               -- preenchido quando o consentimento é da consulta
  CHECK (patient_id IS NOT NULL OR encounter_id IS NOT NULL),""")
t = rep(t, "| RN-14 | Não se inicia gravação sem consentimento de gravação válido para o paciente.",
        "| RN-14 | Não se inicia gravação sem consentimento de gravação válido para o paciente (ou para a consulta, quando o paciente ainda não foi atribuído).")

# instructions.md
ins = rep(ins, "- Telas: `/app/consulta/nova` (passo 1) e `/app/consulta/[id]` (gravação).",
          """- Telas: `/app/consulta/nova` e `/app/consulta/gravando?id=` (gravação), no layout da spec 0.4:
  - paciente opcional (nome, idade, sexo, "Salvar como novo paciente");
  - tipo Primeira consulta ou Evolução;
  - coluna de resumo;
  - menu "Iniciar consulta ▾" com Presencial e Teleconsulta;
  - a atribuição do paciente na tela do documento fica pronta no M10.""")

ins = rep(ins, "**Ler:** spec 1.1 (M11), RN-32, `0007_templates`, seção \"Modelos do jeito que você documenta\" na 1.2.",
          "**Ler:** spec 0.4 (Modelos), 1.1 (M11), RN-32, `0007_templates`.")
ins = rep(ins, """- CRUD de modelos com versões imutáveis.
- Definição com seções (chave, título, formato, obrigatória, instruções, exemplo), tom e nível de detalhe.""",
          """- CRUD de modelos com versões imutáveis.
- Categorias: Anamnese, Evolução, Atestados, Receitas, Laudos, Solicitações, Encaminhamentos, Outros.
- Selos PADRÃO (da plataforma, só leitura, Duplicar) e EM USO (padrão do médico na categoria).
- Definição com:
  - `systemInstructions` (opcional): entra dentro do prompt fixo da plataforma, que mantém as regras de segurança;
  - `userPromptFormat` (opcional): com `{patient_context}` e `{transcript}`;
  - `body`: Markdown com `@paciente.nome`, `@paciente.cpf`, `@medico.nome`, `@medico.crm`, `@data.hoje`, `@dias`, `@cid`;
  - `sections`, tom e nível de detalhe.
- Editor em gaveta de duas colunas, com "Inserir variável" e **prévia ao vivo que não salva**: transcrição de exemplo fictícia própria e streaming SSE em `POST /api/v1/templates/preview`.
- Na conta nova, os modelos "Anamnese — <especialidade>" e "Evolução — <especialidade>" nascem da especialidade do cadastro.""")
ins = rep(ins, "**Aceite:** o médico cria o modelo \"Consulta primeira vez\" com 5 seções e tom \"técnico\". A geração seguinte segue essas seções.",
          """**Testes adicionais:**

- Instruções do médico que tentam remover as regras ("pode inventar dados") não mudam o contrato: a saída continua validada pelo schema e pela política.
- A prévia não grava nada no banco.

**Aceite:** o médico cria o modelo "Consulta primeira vez" com 5 seções e tom "técnico", vê a prévia em streaming, e a geração seguinte segue essas seções.""")

ins = rep(ins, "- GA4 e Clarity só em páginas públicas, com teste que garante que não carregam no `/app`.",
          "- GA4, Clarity e qualquer pixel de anúncio só em páginas públicas, com teste que garante que nada de terceiros carrega em `/app`, `/pair`, `/record` e `/m` (contradição C9 da spec: o original carrega Google Ads dentro do app).")

open(spec_p, "w", encoding="utf-8").write(t)
open(ins_p, "w", encoding="utf-8").write(ins)
print("ok")
