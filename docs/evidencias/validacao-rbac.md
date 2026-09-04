# Evidência — controle RBAC

Execução realizada em 02/09/2026 contra a API real do Uninerd.

| Role | Ação tentada | Resultado |
| --- | --- | --- |
| Paciente | Consultar lista administrativa de médicos | HTTP 403 — bloqueado |
| Médico | Consultar lista administrativa de pacientes | HTTP 403 — bloqueado |
| Paciente | Criar especialidade | HTTP 403 — bloqueado |
| Médico | Criar agendamento como paciente | HTTP 403 — bloqueado |
| Administrador | Consultar lista administrativa de médicos | HTTP 200 — autorizado |

As respostas negadas apresentaram a mensagem `Seu perfil não possui permissão para esta ação.`. Os testes utilizaram JWTs válidos com roles diferentes; tokens e senhas não foram registrados na imagem.

Captura: `rbac-bloqueios-por-role.png`.
