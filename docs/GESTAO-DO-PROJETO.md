# Gestão do Trabalho e do Ciclo de Vida — Projeto Uninerd

## 1. Contexto e objetivo

O Projeto Uninerd organiza a disponibilidade de médicos e o agendamento de consultas por pacientes em uma aplicação mobile/web integrada a uma API REST e a um banco MySQL. O objetivo de gestão é entregar o fluxo principal de forma incremental, validando regras de negócio, segurança e usabilidade a cada versão.

## 2. Análise pelo Framework Cynefin

### Domínio escolhido: Complexo

O projeto foi classificado predominantemente no domínio **Complexo**. Embora algumas tarefas técnicas sejam conhecidas, o comportamento adequado do produto não poderia ser definido integralmente no início. Requisitos importantes surgiram e foram refinados a partir da observação das telas e do feedback de uso, como:

- substituir atalhos separados por um único fluxo de novo agendamento;
- ocultar dias sem horários futuros;
- preservar o horário atual durante a edição;
- atualizar a disponibilidade quando médico ou outro paciente altera a agenda;
- separar a escolha do médico dos detalhes do agendamento;
- exibir informações profissionais sem revelar dados sensíveis;
- ajustar tema, barra de status e rolagem para diferentes dispositivos.

Nesse domínio, a relação entre causa e efeito torna-se clara principalmente depois da experimentação. Por isso, aplica-se o ciclo **experimentar → perceber → responder**: construir uma pequena melhoria, testá-la, observar o resultado e adaptar o backlog.

### Abordagem escolhida: Ágil com Scrum

Scrum é adequado porque permite:

- organizar requisitos variáveis em um Product Backlog priorizado;
- entregar incrementos utilizáveis ao final de ciclos curtos;
- obter feedback frequente do cliente/persona;
- reordenar itens sem interromper toda a execução;
- tornar impedimentos e progresso visíveis no Jira;
- validar cada incremento com critérios de aceite e testes.

O desenvolvimento utiliza sprints curtas e incrementais. Práticas preditivas continuam presentes onde são úteis, como modelagem do banco, contratos da API, segurança e critérios obrigatórios da rubrica.

## 3. Papéis e responsabilidades

| Papel | Responsabilidades |
| --- | --- |
| Product Owner | Representar o cliente, esclarecer necessidades, priorizar o backlog e aceitar ou rejeitar entregas. |
| Scrum Master | Facilitar o fluxo, acompanhar impedimentos e manter o processo visível. |
| Desenvolvimento | Implementar mobile, API, banco, integrações e documentação técnica. |
| Qualidade/Testes | Elaborar cenários, executar validações e registrar defeitos. |
| Cliente/Usuário avaliador | Validar usabilidade e aderência das entregas às necessidades de paciente e médico. |

Se uma pessoa acumular papéis, essa acumulação deve ser registrada no Jira e na apresentação, sem eliminar as responsabilidades descritas.

## 4. Eventos e artefatos

### Eventos

- **Planejamento da sprint:** selecionar itens prioritários e definir o objetivo da entrega.
- **Acompanhamento:** atualizar diariamente responsável, status e impedimentos no Jira.
- **Revisão:** demonstrar o incremento funcionando na web e no Android.
- **Retrospectiva:** registrar o que funcionou, problemas e ações para a próxima sprint.

### Artefatos

- Product Backlog: lista priorizada de épicos, histórias, tarefas e bugs.
- Sprint Backlog: itens selecionados para a sprint atual.
- Incremento: versão integrada e validada do sistema.
- Definition of Ready: condição mínima para um item entrar na sprint.
- Definition of Done: condição mínima para um item ser concluído.

## 5. Definition of Ready

Um item está pronto para desenvolvimento quando:

- possui descrição compreensível;
- identifica ator e benefício esperado;
- possui critérios de aceite verificáveis;
- dependências conhecidas estão registradas;
- prioridade foi definida pelo Product Owner;
- é pequeno o suficiente para uma sprint ou foi dividido.

## 6. Definition of Done

Um item pode receber status **Concluído** quando:

- implementação está integrada entre as camadas necessárias;
- regras críticas são validadas pela API;
- estados de carregamento, vazio e erro foram tratados quando aplicáveis;
- análise de tipos e lint terminam sem erro;
- testes relevantes foram executados e aprovados;
- documentação afetada foi atualizada;
- critérios de aceite foram demonstrados na web e/ou Android;
- nenhuma informação sensível é indevidamente exposta.

## 7. Product Backlog priorizado

| Ordem | ID | Épico | Item | Tipo | Prioridade | Papel sugerido |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | US-01 | Autenticação | Cadastrar paciente | Story | Highest | Desenvolvimento |
| 2 | US-02 | Autenticação | Cadastrar médico | Story | Highest | Desenvolvimento |
| 3 | US-03 | Autenticação | Autenticar e persistir sessão segura | Story | Highest | Desenvolvimento |
| 4 | US-04 | Segurança | Proteger rotas com JWT e autorização | Story | Highest | Desenvolvimento |
| 5 | US-05 | Agenda médica | Configurar horários de atendimento | Story | Highest | Desenvolvimento |
| 6 | US-06 | Agenda médica | Visualizar quadro diário do médico | Story | High | Desenvolvimento |
| 7 | US-07 | Agendamentos | Consultar horários vagos | Story | Highest | Desenvolvimento |
| 8 | US-08 | Agendamentos | Criar agendamento sem conflito | Story | Highest | Desenvolvimento |
| 9 | US-09 | Agendamentos | Visualizar agendamentos do paciente | Story | High | Desenvolvimento |
| 10 | US-10 | Agendamentos | Editar agendamento próprio | Story | High | Desenvolvimento |
| 11 | US-11 | Agendamentos | Cancelar agendamento | Story | High | Desenvolvimento |
| 12 | US-12 | Agendamentos | Atualizar horários disponíveis | Story | High | Desenvolvimento |
| 13 | US-13 | Perfil | Editar foto e biografia | Story | Medium | Desenvolvimento |
| 14 | US-14 | Perfil | Consultar perfil profissional seguro | Story | High | Desenvolvimento |
| 15 | US-15 | Interface | Alternar tema claro e escuro | Story | Medium | Desenvolvimento |
| 16 | US-16 | Interface | Adaptar rolagem e responsividade | Story | Medium | Desenvolvimento |
| 17 | TS-01 | Qualidade | Automatizar testes da API | Task | High | Qualidade/Testes |
| 18 | TS-02 | Qualidade | Automatizar testes de interação mobile | Task | High | Qualidade/Testes |
| 19 | TS-03 | Documentação | Criar requisitos e diagramas UML | Task | Medium | Desenvolvimento |
| 20 | BG-01 | Correções | Corrigir formato de data no agendamento | Bug | Highest | Desenvolvimento |
| 21 | BG-02 | Correções | Corrigir persistência dos horários médicos | Bug | Highest | Desenvolvimento |
| 22 | BG-03 | Correções | Corrigir conexão da web e do Android com a API | Bug | Highest | Desenvolvimento |

## 8. User Stories e critérios de aceite

### US-01 — Cadastrar paciente

**Como** paciente, **quero** criar uma conta, **para** poder utilizar o agendamento.

- Campos obrigatórios devem ser validados.
- CPF e e-mail não podem ser reutilizados.
- A senha deve ser armazenada somente como hash.
- O usuário criado deve possuir perfil de paciente.

### US-02 — Cadastrar médico

**Como** médico, **quero** criar uma conta profissional, **para** disponibilizar meus atendimentos.

- CRM, UF e especialidade são obrigatórios.
- A especialidade deve existir no banco.
- O usuário criado deve possuir perfil médico.

### US-03 — Autenticar e persistir sessão

**Como** usuário, **quero** entrar com segurança, **para** acessar minhas funcionalidades sem autenticar a cada tela.

- Credenciais inválidas devem ser rejeitadas.
- A API deve retornar JWT para credenciais válidas.
- O mobile deve persistir a sessão em armazenamento seguro.
- Logout ou token inválido deve remover a sessão.

### US-05 — Configurar horários médicos

**Como** médico, **quero** selecionar quando atendo, **para** evitar consultas fora da minha disponibilidade.

- Apenas médicos autenticados podem alterar a própria agenda.
- Somente horários selecionados devem permanecer após atualizar a tela.
- Horários desmarcados não podem ser oferecidos a pacientes.
- O salvamento deve ser transacional.

### US-07 — Consultar horários vagos

**Como** paciente, **quero** ver apenas horários disponíveis, **para** escolher uma opção válida.

- Dias sem horários futuros não devem aparecer.
- Horários não configurados ou ocupados não devem aparecer.
- A lista deve ser obtida novamente ao tocar em “Atualizar horários”.

### US-08 — Criar agendamento

**Como** paciente, **quero** confirmar um horário, **para** reservar minha consulta.

- O paciente deve selecionar médico, dia, horário e tipo.
- O ID do paciente deve ser obtido do JWT.
- A API deve verificar novamente agenda, data futura e conflitos.
- Se outro paciente ocupar o horário primeiro, a segunda tentativa deve receber conflito.

### US-10 — Editar agendamento

**Como** paciente, **quero** editar minha consulta, **para** alterar médico, data ou horário.

- Somente o proprietário pode editar.
- O próprio horário atual deve ser apresentado como selecionável.
- Um novo conflito deve impedir a alteração.

### US-14 — Consultar perfil profissional

**Como** paciente, **quero** verificar informações profissionais, **para** escolher um médico com confiança.

- Podem ser exibidos foto, nome, especialidade, CRM/UF, biografia e local de atendimento.
- CPF, senha, token e e-mail pessoal não podem ser exibidos.
- O perfil deve aparecer após a seleção do médico.

## 9. Planejamento de sprints e versões

| Sprint | Objetivo | Principais itens | Versão/Incremento |
| --- | --- | --- | --- |
| Sprint 1 | Criar fundação e acesso | Arquitetura, banco, cadastro, login e JWT | v0.1 — Acesso autenticado |
| Sprint 2 | Entregar agenda básica | CRUD de agendamentos, listagens e regras iniciais | v0.2 — Agendamento funcional |
| Sprint 3 | Integrar disponibilidade médica | Configuração de horários, agenda diária e conflitos | v0.3 — Agenda integrada |
| Sprint 4 | Melhorar experiência | Perfil, temas, responsividade e fluxo em etapas | v0.4 — Experiência refinada |
| Sprint 5 | Validar e documentar | Segurança, testes, requisitos, diagramas e README | v1.0 — Entrega acadêmica |

## 10. Fluxo no Jira

```text
Backlog -> A Fazer -> Em Andamento -> Em Revisão/Teste -> Concluído
```

- **Backlog:** item identificado, ainda não selecionado.
- **A Fazer:** item selecionado para a sprint.
- **Em Andamento:** trabalho iniciado e responsável definido.
- **Em Revisão/Teste:** implementação pronta, aguardando validação.
- **Concluído:** critérios de aceite e Definition of Done atendidos.

Bugs bloqueadores recebem prioridade máxima e podem interromper a ordem planejada da sprint.

## 11. Conexão com as personas/clientes

A persona principal do projeto é **Ivonete**, uma persona fictícia composta a partir de dificuldades, comportamentos e necessidades observados em um conjunto de pessoas reais. Ela representa uma paciente de 71 anos com experiência digital básica e dificuldade para encontrar médicos em informações espalhadas, sem reproduzir os dados de uma pessoa específica. Para Ivonete, o Uninerd funciona como uma evolução do antigo caderno telefônico: reúne profissionais, informações confiáveis e horários disponíveis em um único ambiente. A descrição completa, a origem da persona, sua jornada e os critérios de aceite estão em [PERSONA-IVONETE.md](PERSONA-IVONETE.md).

| Necessidade da persona | Resposta implementada | Evidência esperada |
| --- | --- | --- |
| Ivonete quer encontrar médicos sem consultar vários contatos | Profissionais reunidos no fluxo de novo agendamento | Tela de seleção do médico |
| Ivonete quer confiar no profissional | Perfil com CRM, especialidade, foto e biografia | Tela do perfil profissional |
| Ivonete não quer escolher horário inválido | Apenas dias futuros e horários vagos | Tela de disponibilidade |
| Ivonete precisa recordar seus compromissos | Agendamentos apresentados diretamente no início | Tela inicial da paciente |
| Ivonete precisa administrar a consulta | Visualização, edição, cancelamento e histórico | Tela inicial, edição e histórico |
| Médico quer controlar quando atende | Configuração persistente de horários | Tela “Meus horários” |
| Médico quer organizar o dia | Quadro com horários livres e ocupados | Agenda diária |
| Ambos precisam proteger dados | JWT, autorização, sessão segura e perfil público restrito | Testes e respostas 401/403 |

A proposta conecta-se diretamente à persona principal porque substitui informações fragmentadas por uma jornada centralizada, previsível e legível. Ao mesmo tempo, reduz o trabalho manual do médico, oferece transparência de disponibilidade e protege informações que não são necessárias ao atendimento.

## 12. Evidências para a apresentação

- Quadro do Jira com as colunas do fluxo.
- Backlog contendo épicos, stories, tasks e bugs.
- Issue aberta mostrando descrição, critérios de aceite, prioridade e responsável.
- Sprint com itens em diferentes status.
- Histórico de movimentação ou atualizações das issues.
- Tela de Releases/Versions com os incrementos planejados.
- Demonstração do sistema relacionada a uma User Story concluída.

As capturas devem usar dados reais do projeto e ocultar e-mails, tokens ou outras informações pessoais das contas Jira.
