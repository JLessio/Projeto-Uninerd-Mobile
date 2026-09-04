# Evidências visuais — Projeto Uninerd

Esta pasta reúne evidências reais de execução usadas para comprovar usabilidade, funcionalidade e compatibilidade.

## Web

- `web-login.png`: tela inicial de acesso em desktop.
- `web-viewport-estreita.png`: tela em viewport web estreita, sem cortes ou transbordamento.
- `perfil web com foto.png`: perfil após selecionar e enviar uma imagem pela interface web.
- `Perfil de Paciente com foto.jpeg`: perfil real de paciente com foto.
- `arquivos-upload-nomes-unicos.png`: nomes únicos gerados pelo Multer.
- `rbac-bloqueios-por-role.png`: bloqueios `403` por role e autorização `200` do administrador.
- `web-admin-pacientes.png` e `web-admin-medicos.png`: abas administrativas.
- `web-admin-editar-confirmacao-1.png` e `web-admin-editar-confirmacao-2.png`: confirmação dupla de edição.
- `web-admin-excluir-confirmacao-1.png` e `web-admin-excluir-confirmacao-2.png`: confirmação dupla de exclusão.

## Android — capturas reais concluídas

- `android-login.png`: tela de acesso no aparelho físico.
- `android-inicio-paciente.png`: consulta reservada com médica, data e horário.
- `android-novo-agendamento.png`: perfil profissional e horários vagos.
- `android-agenda-medico.png`: quadro diário com o horário reservado marcado como ocupado.
- `android-tema-escuro.png`: perfil em tema escuro, com contraste e barra de status legível.

## Roteiro de validação

| ID | Plataforma | Ação | Resultado |
| --- | --- | --- | --- |
| EV01 | Web | Abrir a aplicação | Aprovado: acesso sem corte e rolagem quando necessária. |
| EV02 | Android | Entrar como paciente | Aprovado: início apresenta o agendamento. |
| EV03 | Android/Web | Criar agendamento | Aprovado: seleção de dia e horário vago. |
| EV04 | Android/Web | Reservar horário | Aprovado: horário reservado deixa de estar disponível. |
| EV05 | Android | Entrar como médico | Aprovado: agenda diferencia horários vagos e ocupados. |
| EV06 | Android/Web | Atualizar disponibilidade | Aprovado pelos testes automatizados. |
| EV07 | Android/Web | Editar e cancelar consulta | Aprovado pelos testes automatizados. |
| EV08 | Android | Alternar tema | Aprovado: conteúdo e ícones do sistema legíveis. |
| EV09 | API | Acessar rota sem JWT | Aprovado: resposta `401`. |
| EV10 | API | Acessar recurso alheio | Aprovado: resposta `403`. |
| EV11 | Android/Web/API | Enviar foto | Aprovado; consulte `validacao-upload-imagens.md`. |
| EV12 | API | Validar RBAC | Aprovado; consulte `validacao-rbac.md`. |
| EV13 | Web | Navegar como administrador | Aprovado; consulte `validacao-abas-admin.md`. |
| EV14 | Android/Web/API | Editar/excluir como admin | Aprovado; consulte `validacao-dupla-confirmacao-admin.md`. |
| EV15 | Testes | Interagir com telas administrativas | Aprovado; consulte `validacao-testes-interacao-admin.md`. |
| EV16 | Web/API | Executar E2E administrativo | Aprovado no Chrome; consulte `validacao-e2e-web.md`. |

## Registro da execução Android

| Campo | Valor |
| --- | --- |
| Data | 03/09/2026 |
| Ambiente | Aparelho físico com Expo Go 54.0.8 |
| Modelo | Samsung SM-A556E |
| Resolução das capturas | 1080 × 2340 |
| Comunicação | USB com `adb reverse` nas portas 8081 e 3000 |
| Resultado geral | Aprovado nas cinco telas e no fluxo integrado paciente–médico |

As capturas não expõem senha, JWT, CPF, e-mail pessoal ou dados reais de pacientes.
