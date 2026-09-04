# Especificação do Projeto Uninerd

## 1. Contextualização do problema

O agendamento de consultas médicas frequentemente depende de ligações, mensagens e controles manuais. Esse processo dificulta a consulta de horários livres, permite desencontro de informações e aumenta o risco de dois pacientes tentarem reservar o mesmo horário. O médico também precisa de uma forma simples de definir quando atende e acompanhar sua agenda diária.

O Projeto Uninerd resolve esse problema com uma plataforma de agendamento médico disponível na web e em aplicativo mobile. Pacientes podem identificar profissionais por informações públicas e profissionais, consultar somente horários realmente disponíveis, criar e administrar seus próprios agendamentos. Médicos podem configurar os dias e horários em que atendem e visualizar sua agenda.

A solução utiliza uma API REST como fonte central das regras de negócio e dos dados. Dessa forma, web e mobile consultam a mesma agenda, e uma reserva realizada por um paciente deixa de aparecer como disponível para os demais. Os dados são persistidos em MySQL e as operações protegidas exigem autenticação por JWT.

### 1.1 Objetivo geral

Desenvolver uma plataforma segura e responsiva para organizar a disponibilidade dos médicos e permitir que pacientes realizem agendamentos sem conflito de horário.

### 1.2 Objetivos específicos

- Permitir cadastro e autenticação de pacientes e médicos.
- Apresentar ao paciente informações profissionais verificáveis do médico, sem expor dados pessoais sensíveis.
- Permitir que o médico configure os horários em que deseja atender.
- Exibir ao paciente somente dias e horários futuros, configurados e ainda vagos.
- Impedir conflitos de agenda para médicos e pacientes.
- Permitir consulta, edição e cancelamento de agendamentos conforme o perfil autenticado.
- Manter uma experiência semelhante entre as versões web e mobile.
- Proteger sessão, rotas e dados por autenticação, autorização e validações no servidor.

### 1.3 Usuários envolvidos

- **Paciente:** consulta profissionais, verifica horários, cria, visualiza, edita e cancela seus agendamentos.
- **Médico:** configura sua disponibilidade, visualiza os horários do dia e identifica consultas marcadas.
- **Administrador:** mantém cadastros administrativos de médicos e especialidades pelas operações disponibilizadas na API.

### 1.4 Etapas de realização

1. Levantamento do problema, atores e regras de negócio.
2. Definição da arquitetura web, mobile, API e banco de dados.
3. Modelagem e criação das entidades persistidas.
4. Implementação da autenticação e autorização.
5. Implementação dos cadastros e dos agendamentos.
6. Implementação da configuração de horários médicos.
7. Integração das interfaces web e mobile com a API.
8. Aplicação de validações de segurança, usabilidade e responsividade.
9. Execução de testes unitários, de integração e de interação.
10. Produção dos diagramas e da documentação de entrega.

### 1.5 Evolução do produto

O Uninerd foi desenvolvido de forma incremental. Cada etapa entregou uma versão utilizável e acrescentou regras necessárias ao fluxo completo de atendimento:

| Versão | Evolução entregue | Resultado para o usuário |
| --- | --- | --- |
| 0.1 — Fundação | Estrutura em camadas, banco MySQL, API REST e cadastros de pacientes, médicos e especialidades. | Os dados deixaram de ser apenas locais e passaram a ser persistidos e compartilhados. |
| 0.2 — Acesso seguro | Login, hash de senhas, JWT, autorização por identidade e perfil, CORS e persistência segura da sessão. | Cada usuário passou a acessar somente os recursos permitidos para seu perfil. |
| 0.3 — Agendamento | Consulta de médicos e disponibilidade, criação, visualização, edição e cancelamento de consultas. | O paciente passou a administrar seu atendimento pelo aplicativo. |
| 0.4 — Regras de agenda | Agenda configurável do médico, bloqueio de conflitos, exclusão de horários passados ou ocupados e atualização da disponibilidade. | Os horários exibidos passaram a representar a disponibilidade real e atual. |
| 0.5 — Experiência integrada | Tela inicial específica por perfil, perfil profissional, foto, biografia, tema claro/escuro, rolagem e interface responsiva no Android e na web. | O mesmo fluxo passou a funcionar com consistência nos dispositivos avaliados. |
| 1.0 — Validação e entrega | Testes automatizados, evidências visuais, documentação de requisitos, regras, arquitetura e diagramas. | A solução ficou verificável e preparada para demonstração conforme a rubrica. |

Essa evolução partiu do problema central — a falta de uma agenda compartilhada e confiável — e chegou a uma solução na qual a API é a fonte única das regras. O produto pode evoluir futuramente com notificações, confirmação de presença, teleconsulta e integração com calendários, sem alterar o núcleo de agendamento já entregue.

## 2. Requisitos funcionais

| Código | Requisito funcional |
| --- | --- |
| RF01 | O sistema deve permitir o cadastro de paciente com os dados obrigatórios e CPF válido. |
| RF02 | O sistema deve permitir o cadastro de médico com CRM, UF e especialidade. |
| RF03 | O sistema deve autenticar usuários cadastrados e identificar seu perfil de acesso. |
| RF04 | O usuário deve poder consultar e editar seu próprio perfil, incluindo foto e biografia. |
| RF05 | O médico deve poder selecionar e persistir os dias e horários em que atende. |
| RF06 | O médico deve visualizar sua agenda diária, distinguindo horários livres e ocupados. |
| RF07 | O paciente deve visualizar seus próximos agendamentos na tela inicial. |
| RF08 | O paciente deve escolher um médico e consultar seu perfil profissional, especialidade, CRM, biografia e local de atendimento quando informados. |
| RF09 | O paciente deve consultar somente dias futuros que possuam pelo menos um horário disponível. |
| RF10 | O paciente deve visualizar somente horários configurados pelo médico que ainda não estejam ocupados. |
| RF11 | O paciente deve poder atualizar manualmente a disponibilidade apresentada. |
| RF12 | O paciente deve criar um agendamento selecionando médico, dia, horário e tipo. |
| RF13 | O paciente deve editar seu próprio agendamento, podendo visualizar o horário atual durante a edição. |
| RF14 | Usuários autorizados devem poder cancelar um agendamento, preservando-o como registro cancelado. |
| RF15 | Uma reserva concluída deve deixar de aparecer na disponibilidade consultada por outros pacientes. |
| RF16 | O sistema deve permitir alternância entre tema claro e escuro, mantendo legíveis os elementos do sistema operacional. |
| RF17 | Todo usuário deve poder selecionar e enviar sua foto de perfil pelo aplicativo. |
| RF18 | O administrador deve visualizar pacientes e médicos em listas separadas e consultar seus dados e agendamentos relacionados. |
| RF19 | O administrador deve poder editar e excluir usuários e agendamentos após duas confirmações distintas. |

## 3. Requisitos não funcionais

| Código | Requisito não funcional |
| --- | --- |
| RNF01 | A aplicação deve utilizar arquitetura em camadas, separando rotas, controladores, serviços, repositórios e persistência. |
| RNF02 | Web e mobile devem consumir a mesma API REST e compartilhar as mesmas regras de negócio. |
| RNF03 | Os dados permanentes devem ser armazenados em banco MySQL. |
| RNF04 | Senhas devem ser armazenadas por hash e nunca retornadas pelas APIs. |
| RNF05 | Rotas protegidas devem exigir JWT válido, e o servidor deve aplicar autorização por usuário e perfil. |
| RNF06 | A sessão mobile deve ser persistida em armazenamento seguro e removida no logout ou quando inválida. |
| RNF07 | A API deve restringir origens por CORS e a infraestrutura web deve aplicar HTTPS e cabeçalhos de segurança. |
| RNF08 | Dados sensíveis, como CPF, senha e e-mail pessoal, não devem compor o perfil público do médico. |
| RNF09 | A interface deve funcionar em Android e web, adaptar-se ao espaço disponível e permitir rolagem quando o conteúdo ultrapassar a tela. |
| RNF10 | Operações críticas devem ser validadas no servidor, independentemente das validações da interface. |
| RNF11 | O sistema deve impedir reservas ativas conflitantes para o mesmo médico ou para o mesmo paciente. |
| RNF12 | Componentes, tipos e serviços compartilhados devem ser reutilizados para reduzir duplicação e facilitar manutenção. |
| RNF13 | As funcionalidades principais devem possuir testes automatizados de regras de negócio e interação. |
| RNF14 | Imagens de perfil devem ser processadas pelo Multer, limitadas a 5 MB e aceitas somente nos formatos JPG, PNG e WEBP. |
| RNF15 | O nome de cada imagem deve combinar data/hora e identificador aleatório para evitar colisões. |
| RNF16 | Operações administrativas de alteração e exclusão devem validar novamente a senha do administrador no servidor e exigir um token de confirmação temporário, vinculado à ação e de uso único. |
| RNF17 | A autorização deve seguir RBAC, com uma matriz central que associe as roles `admin`, `medico` e `paciente` às permissões de cada ação. |

## 4. Restrições e proteção de dados

- O paciente autenticado agenda sempre para a identidade contida em seu token, não para um ID arbitrário enviado pelo aplicativo.
- Um usuário não pode consultar ou alterar recursos privados pertencentes a outro usuário.
- O perfil profissional do médico pode apresentar nome, foto, biografia, especialidade, CRM/UF e endereço de atendimento.
- CPF, senha, token e dados pessoais não necessários à decisão do paciente não devem ser exibidos no perfil profissional.
- Horários passados, não configurados, ocupados ou cancelados pelo médico não podem ser oferecidos para novos agendamentos.

## 5. Critérios gerais de aceite

- Paciente e médico conseguem cadastrar-se e autenticar-se conforme seus campos obrigatórios.
- A alteração da agenda do médico é persistida e refletida na disponibilidade do paciente.
- Após uma reserva, o horário ocupado deixa de ser retornado para os demais pacientes.
- Tentativas de acessar ou alterar dados de outro usuário são rejeitadas.
- O fluxo principal pode ser utilizado tanto no Android quanto na web sem perda de conteúdo.
- Build, análise de tipos, lint e testes automatizados terminam sem erros.
