# Pendências finais de evidência

Atualização: 03/09/2026.

## Concluído

- suíte E2E Cypress executada no Chrome: 3 cenários aprovados e nenhuma falha;
- testes completos da API: 32 aprovados;
- testes completos do mobile: 36 aprovados;
- build da API e typecheck mobile aprovados;
- API acessível no Android por encaminhamento USB das portas 3000 e 8081;
- execução real em Samsung SM-A556E com Expo Go SDK 54;
- cinco evidências Android reais capturadas e verificadas;
- fluxo integrado comprovado: o horário reservado pelo paciente aparece ocupado para o médico;
- tema escuro validado com conteúdo contrastante e barra de status legível.

## Evidências Android concluídas

As capturas reais estão em `docs/evidencias`:

1. `android-login.png`;
2. `android-inicio-paciente.png`;
3. `android-novo-agendamento.png`;
4. `android-agenda-medico.png`;
5. `android-tema-escuro.png`.

Foram utilizadas contas locais de demonstração, sem CPF, senha, JWT ou dados pessoais reais expostos nas imagens.

## Única pendência externa: registros reais do Jira

Não existe integração Jira conectada nesta sessão. Sem acesso autorizado a um site Jira do usuário, não é possível criar issues, sprint, versões ou capturas reais com segurança.

Após conectar uma integração Atlassian/Jira, ainda será necessário criar e capturar:

- quadro com o fluxo de trabalho;
- backlog com épicos, stories, tasks e bugs;
- issue com critérios de aceite, prioridade e responsável;
- sprint com itens em diferentes status;
- histórico de movimentação;
- Releases/Versions;
- vínculo entre uma User Story concluída e sua funcionalidade no sistema.
