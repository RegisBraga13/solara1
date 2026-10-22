### 5.2 Estrutura de telas do `/app`

As telas marcadas [O] estão descritas em detalhe na seção 0.4. A navegação é por **barra superior**: Consultas, Agenda, Pacientes, Modelos, Ajustes, "+ Nova consulta", notificações e avatar. No celular, as abas viram navegação inferior [R].

| Rota | Tela | Marca |
|---|---|---|
| `/app` | Consultas: saudação, 4 indicadores, "Iniciar consulta ▾" (Presencial/Teleconsulta), consultas recentes com filtros | [O] |
| `/app/consulta/nova` | Paciente opcional (nome, idade, sexo, salvar como novo), tipo de documento, resumo, "Iniciar gravação" | [O] |
| `/app/consulta/gravando?id=` | Permissão do microfone e gravação | [O] parcial |
| `/app/consulta/[id]` | Documento: revisão, atribuição do paciente, edição; assinatura e envio [R] | [I] |
| `/app/agenda` | Filtros por tipo e status, visões Dia/Semana/Mês/Lista, diálogo de agendamento | [O] |
| `/app/pacientes` | Mestre-detalhe: lista, ficha com sinais vitais, abas Timeline/Documentos/Laudos/Medicações, coluna clínica | [O] |
| `/app/modelos` | Mestre-detalhe por categoria; editor com instruções, formato da pergunta e prévia ao vivo | [O] |
| `/app/ajustes` | Perfil (nome, e-mail, CRM/UF, especialidade). No projeto novo também: segurança, retenção do áudio, plano, equipe, exportação e auditoria [R] | [O] + [R] |
| `/app/insights` | Indicadores (não existe no original) | [R] |
| `/pair/[token]` · `/record/[captureToken]` | Celular como microfone (não visto no original) | [I] |
| `/m/[token]` | Acesso do paciente (não visto no original) | [I] |
| `/login` · `/signup` · `/onboarding` | Acesso e configuração inicial | [I] |

