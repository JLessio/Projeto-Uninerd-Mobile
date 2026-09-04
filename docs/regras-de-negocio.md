# Regras de negócio

## RN01 — Autenticação obrigatória

Rotas de médicos e agendamentos exigem JWT válido. Token ausente, inválido ou expirado recebe `401`.

Aplicada em: `authMiddleware` e rotas da API.

## RN02 — Acesso à própria conta

Um usuário somente pode consultar, editar ou excluir o perfil cujo ID corresponde ao JWT. Tentativas sobre outro usuário recebem `403`.

Aplicada em: `UserController`.

## RN03 — Dados únicos e coerentes no cadastro

E-mail e CPF não podem ser reutilizados. Pacientes precisam de CPF válido; médicos precisam de CRM, UF do CRM e especialidade.

Aplicada em: `UserService`, `UserRepository` e restrições únicas do banco quando presentes.

## RN04 — Paciente autenticado agenda para si

Ao criar um agendamento como paciente, o ID é obtido do JWT, não do corpo enviado pelo cliente.

Aplicada em: `MedicalController`.

## RN05 — Médico e paciente precisam existir

Um agendamento somente pode referenciar um usuário de nível `medico` e outro de nível `paciente` existentes.

Aplicada em: `AppointmentService` e `MedicalRepository`.

## RN06 — Agendamento exige data e horário futuros

CREATE e UPDATE aceitam `AAAA-MM-DD HH:mm:ss` ou a variação com `T`, rejeitam datas inexistentes e horários passados.

Aplicada em: `AppointmentService`. O mobile antecipa a validação para melhorar o feedback.

## RN07 — Médico não pode ter conflito de horário

Não podem existir dois agendamentos ativos para o mesmo médico no mesmo instante. Na edição, o próprio registro é ignorado.

Aplicada em: `AppointmentService` e `MedicalRepository`.

## RN08 — Paciente não pode ter conflito de horário

Um paciente não pode manter dois agendamentos ativos no mesmo instante, mesmo com médicos diferentes. Na edição, o próprio registro é ignorado.

Aplicada em: `AppointmentService` e `MedicalRepository`.

## RN09 — Propriedade do agendamento

Pacientes somente acessam seus agendamentos; médicos somente acessam agendamentos em que são o profissional associado. A regra vale para leitura por ID, edição e cancelamento.

Aplicada em: `MedicalController`. A listagem também é filtrada no repositório conforme o usuário autenticado.

## RN10 — Cancelamento autorizado

O cancelamento exige registro existente e permissão do usuário. A exclusão é lógica: o status passa para `CANCELADO`.

Aplicada em: `MedicalController` e `MedicalRepository`.

## RN11 — Especialidade válida

Cadastro e edição de médico exigem uma especialidade existente.

Aplicada em: `MedicalController`, `UserService` e `MedicalRepository`.

## Validações de interface

Campos obrigatórios, formato visual da data e bloqueio de múltiplos envios melhoram a experiência no mobile, mas não substituem as regras críticas validadas pela API.
