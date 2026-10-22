### 0.4 Observado no app logado (2026-10-22)

Conta de teste vazia (plano de teste, especialidade Clínica Médica). Tudo nesta seção é **[O]**.

#### Navegação

Barra superior fixa (não há barra lateral global):

- logotipo;
- abas **Consultas** (`/app`), **Agenda**, **Pacientes**, **Modelos** e **Ajustes**;
- botão âmbar "+ Nova consulta";
- sino de notificações;
- avatar com iniciais.

Títulos de página em serifa (Instrument Serif), com a palavra de destaque em itálico âmbar: "Bom dia, *Dr. Francisco*", "Nova *consulta*", "Novo *paciente*", "Editar *modelo*".

#### Rotas observadas

| Rota | Tela |
|---|---|
| `/app` | Consultas (início) |
| `/app/agenda` | Agenda |
| `/app/pacientes` | Pacientes em mestre-detalhe (lista à esquerda, ficha ao centro, resumo clínico à direita) |
| `/app/modelos` | Modelos em mestre-detalhe |
| `/app/ajustes` | Ajustes (só perfil) |
| `/app/consulta/nova` (aceita `?patient_id=`) | Configurar a consulta |
| `/app/consulta/gravando?id={uuid}` | Gravação (pede o microfone: "Nada é gravado até você começar") |
| `/app/consulta/{uuid}` | Consulta (documento) |

#### Consultas (`/app`)

- Saudação com data e frase de contexto ("nenhuma consulta agendada hoje" ou "Você tem 1 consulta agendada hoje").
- 4 cartões de indicador: **Hoje** ("próxima às 11:25"), **Esta semana**, **Tempo economizado** ("em documentação"), **Duração média** ("por consulta").
- Faixa "Pronta para a próxima consulta?" com botão escuro **Iniciar consulta ▾**, cujo menu oferece **Presencial** e **Teleconsulta**. Texto: "O áudio é apagado imediatamente após a transcrição."
- "Consultas recentes":
  - busca "Buscar por paciente…";
  - filtros em pílula com contagem: Todas, Primeira consulta, Evolução;
  - tabela com colunas Paciente, Queixa, Documento e Data;
  - status por linha (ex.: "Em gravação");
  - estado vazio "Você ainda não gravou nenhuma consulta".

#### Nova consulta (`/app/consulta/nova`)

- Subtítulo: "Comece a gravar agora. Você atribui o paciente depois, direto na tela do documento." **O paciente é opcional para começar.**
- Cartão **Paciente**:
  - nome;
  - idade (número);
  - sexo (Feminino, Masculino, Outro);
  - caixa "Salvar como novo paciente", marcada por padrão: "A ficha é criada junto com a consulta".
- Cartão **Tipo de documento**:
  - **Primeira consulta**: "HPMA, revisão de sistemas, antecedentes, hipótese diagnóstica e conduta";
  - **Evolução**: "SOAP".
- Coluna **Resumo**: paciente, idade/sexo, documento, "Duração estimada 30–60 min" e selo "NOVO CADASTRO".
- Aviso verde: "Áudio não é armazenado."
- Botão "Iniciar gravação →" leva a `/app/consulta/gravando?id=`.

#### Agenda (`/app/agenda`)

- Coluna esquerda:
  - "Agenda · Dr(a). Nome";
  - botão Nova consulta;
  - minicalendário;
  - filtros com contagem e cor:
    - **Tipo:** Primeira consulta (âmbar), Retorno (verde-água), Teleconsulta (roxo), Procedimento (vermelho), Bloqueio/Pausa (cinza), Reunião interna (preto);
    - **Status:** Confirmada, Pendente, Realizada, No-show;
  - resumo "Esta semana".
- Área principal:
  - título do mês e intervalo ("18 – 24 Out");
  - botões Hoje e setas;
  - visões **Dia, Semana, Mês e Lista**;
  - grade das 07:00 às 19:00 com linha da hora atual;
  - botão "+ Nova".
- Diálogo **Nova consulta** (agendamento):

  | Campo | Valores |
  |---|---|
  | Tipo | Os 6 acima, em cartões |
  | Paciente | Obrigatório, com busca |
  | Data e Horário | Padrão: agora |
  | Duração | 20 min, 40 min, 1 h, 1 h 30, 2 h |
  | Local | Consultório 1, Consultório 2, Sala de procedimentos, Sala de reuniões, Online (teleconsulta) |
  | Status | Confirmada, Pendente, Realizada, No-show |
  | Observações | Texto livre |

  Botões: Cancelar e Criar consulta (desabilitado até escolher o paciente).

#### Pacientes (`/app/pacientes`)

- **Lista:**
  - total e ativos;
  - "+ Novo paciente";
  - busca "Nome ou CPF…";
  - ordenação: Mais recentes, Nome (A-Z), Nº de consultas.
- **Novo paciente** (gaveta lateral em 3 passos: Cadastro, Contato, Clínico; indicador "Rascunho local"):
  - nome completo (obrigatório);
  - **idade (obrigatória)**;
  - sexo;
  - nascimento (opcional);
  - CPF;
  - convênio: Particular, Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro, NotreDame Intermédica, Hapvida, SUS;
  - cor do avatar: 7 opções.
- **Ficha:**
  - cabeçalho com avatar, nome, idade, sexo e convênio;
  - selo "LGPD · dados criptografados";
  - botões Editar, **Gerar laudo** e Nova consulta;
  - cartões de sinais vitais com a data da última medida: **PA** (mmHg), **FC** (bpm, "em repouso"), **SpO₂** (%, "em ar ambiente"), **Peso** (kg, com IMC);
  - cartão **Visitas** ("desde 2026");
  - abas **Timeline**, **Documentos**, **Laudos** e **Medicações**;
  - coluna direita: Contato, Alergias, Condições e Medicações ("Nenhuma registrada").

#### Modelos (`/app/modelos`)

- **Lista agrupada por categoria**, com busca e botão "+". Cada modelo tem um selo:
  - **PADRÃO**: modelo da plataforma, só leitura, com Duplicar e Ver detalhes;
  - **EM USO**: modelo do médico definido como padrão da categoria. Ações: Remover como padrão, Duplicar, Editar modelo.

  A conta nova já vem com "Anamnese — Clínica Médica" e "Evolução — Clínica Médica" criados a partir da especialidade do cadastro.
- **Categorias:** Anamnese, Evolução, Atestados, Receitas, Laudos, Solicitações, Encaminhamentos, Outros.
- **Pré-visualização do corpo do modelo**, com variáveis: `@paciente.nome`, `@paciente.cpf`, `@medico.nome`, `@medico.crm`, `@data.hoje` e, nos exemplos de atestado, `@dias` e `@cid`. O exemplo do novo modelo é um atestado em Markdown com essas variáveis.
- **Editor de modelo** (gaveta larga em duas colunas):
  - coluna esquerda:
    - nome (obrigatório);
    - categoria;
    - **"Instruções ao modelo (opcional)"**: o prompt de sistema enviado ao Claude, num editor com negrito, itálico, lista, linha e "Inserir variável". Em branco, usa o prompt padrão da categoria;
    - **"Configuração avançada" → "Formato da pergunta (opcional)"**: modelo da mensagem do usuário, com os marcadores `{patient_context}` e `{transcript}`;
  - coluna direita, **"Prévia ao vivo · Não salva"**:
    - botão Gerar prévia, que vira "Regenerar";
    - transcrição de exemplo fixa (dor lombar);
    - resultado em streaming via `POST /api/templates/preview`;
  - rodapé: Excluir modelo, Cancelar, Salvar alterações.
- **Como o prompt padrão de Clínica Médica funciona** (resumo, sem copiar o texto):
  - redação em 3ª pessoa, só com dados da transcrição e do contexto do paciente;
  - informação ausente vira "Não referido na consulta.";
  - medicamentos e doses preservados literalmente;
  - hipóteses com justificativa e sem diagnóstico definitivo; CID-10 só quando explícito;
  - saída **em Markdown** com 12 seções H2 fixas: Identificação, Queixa Principal, História da Doença Atual, Medicações em Uso, Antecedentes Pessoais, Antecedentes Familiares, Hábitos e Estilo de Vida, Alergias, Revisão de Sistemas, Exame Físico, Hipótese Diagnóstica, Conduta;
  - um bloco de ênfases por especialidade.
- **Saída observada na prévia:** Markdown com as 12 seções. Seções sem dado saem como "Não referido na consulta."; o exame físico traz só o que foi dito ("Lasègue à direita positivo a 60 graus").

#### Ajustes (`/app/ajustes`)

Só o cartão **Perfil**: nome completo, e-mail (somente leitura), CRM (UF + número) e especialidade (texto), com o botão "Salvar alterações". Não há plano, cobrança, equipe, assinatura digital, retenção, exportação nem segurança.

#### O que isso muda no projeto [R]

1. **Contrato de saída:** o original gera Markdown livre com cabeçalhos fixos. O projeto novo mantém a saída **estruturada** (seção 4.5, com `PRESENT/INFERRED/MISSING` e evidência), porque texto livre não serve de contrato para efeitos automáticos (sugestões para a ficha, CID, receita). O documento renderizado ao médico pode ter as mesmas 12 seções.
2. **Modelos = prompt + formato + corpo com variáveis.** A definição do modelo (tabela `template_versions`) passa a ter:
   - `systemInstructions` (texto do médico, opcional);
   - `userPromptFormat` (com `{patient_context}` e `{transcript}`, opcional);
   - `body` (Markdown com `@variáveis`, para documentos sem IA como o atestado);
   - `sections` (para validação).

   As instruções do médico entram **dentro** de um prompt de sistema fixo da plataforma, que mantém as regras de segurança (não inventar, evidência, formato). O médico nunca as remove.
3. **Paciente opcional no início da gravação:** `encounters.patient_id` aceita nulo até o paciente ser atribuído na tela do documento. A assinatura e o envio exigem o paciente.
4. **Idade sem data de nascimento:** `patients.birth_date` aceita nulo e existe `age_years_at_registration`. A idade exibida vem do nascimento quando houver.
5. **Sinais vitais incluem SpO₂;** ficha com abas Timeline, Documentos, Laudos e Medicações, e "Gerar laudo" a partir da ficha.
6. **Agenda:** os 6 tipos, os locais e as durações acima entram como dados configuráveis por organização.
