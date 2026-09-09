# Projeto Uninerd

Sistema de agendamento médico com API REST, banco MySQL e aplicativo React Native executável no Android e na web.

Pacientes podem consultar médicos e horários disponíveis, realizar agendamentos e acompanhar suas consultas. Médicos podem configurar sua disponibilidade e visualizar a própria agenda.

## Funcionalidades

### Paciente

- Cadastro, autenticação e edição do perfil com foto e biografia.
- Próximos agendamentos na tela inicial.
- Escolha do médico em uma etapa separada.
- Perfil profissional do médico com foto, especialidade, CRM/UF, biografia e local de atendimento.
- Consulta somente de dias futuros e horários vagos.
- Atualização manual da disponibilidade.
- Criação, edição e cancelamento dos próprios agendamentos.
- Remoção dos horários reservados por outros pacientes da disponibilidade.

### Médico

- Cadastro e autenticação profissional.
- Perfil com foto e biografia.
- Configuração persistente dos dias e horários de atendimento.
- Agenda diária em formato de quadro, distinguindo horários livres e consultas marcadas.

### Recursos gerais

- Tema claro e escuro.
- Rolagem quando o conteúdo ultrapassa a tela.
- API compartilhada pelo Android e pela versão web do Expo.
- Cancelamento lógico de agendamentos.
- Upload de foto de perfil por Multer, com validação de formato, tamanho e nome único.

### Administrador

- Login administrativo separado, configurado no `.env`.
- Abas de pacientes e médicos com consulta de perfis e agendamentos relacionados.
- Edição e exclusão mediante senha administrativa e segunda confirmação na tela.
- Token de confirmação temporário, restrito à ação e utilizado uma única vez.

## Arquitetura

```text
Aplicativo mobile/web (Expo)
              |
              v
          API REST
              |
              v
 Routes -> Controllers -> Services -> Repositories
                                      |
                                      v
                                    MySQL
```

A API concentra autenticação, autorização, validações e regras de negócio. O aplicativo não acessa o banco diretamente.

## Tecnologias

- Node.js, Express e TypeScript
- React Native, Expo SDK 54 e Expo Router
- MySQL 8.4
- JWT, bcrypt e Expo Secure Store
- Jest e Testing Library
- Docker Compose para o banco
- PlantUML para os diagramas

## Estrutura atual

```text
.
├── src/                    # Código-fonte da API
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── entities/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
├── mobile/                 # Aplicativo Expo para Android e web
│   ├── app/                # Telas e rotas
│   ├── components/         # Componentes reutilizáveis
│   ├── constants/
│   ├── contexts/
│   ├── services/           # Comunicação com a API
│   ├── types/
│   └── utils/
├── docs/                   # Especificação, regras e diagramas
│   └── diagramas/
├── infra/certs/            # Certificados locais preservados
├── dist/                   # Build gerado da API
├── schema.sql              # Script SQL montado no MySQL
├── docker-compose.yml      # Serviço atual do MySQL
└── package.json            # Scripts e dependências da API
```

As pastas `backend/` e `frontend/` contêm artefatos legados ou gerados e não representam a localização do código-fonte atual da API e do aplicativo mobile.

## Pré-requisitos

- Node.js e npm
- Docker Desktop, caso o MySQL seja executado em container
- Expo Go no Android ou um emulador configurado
- Computador e celular na mesma rede para usar o Expo em modo LAN

## Configuração da API

Na raiz, copie `.env.example` para `.env` e use valores próprios. A API exige `JWT_SECRET`.

Exemplo para executar a API no Windows e o MySQL no Docker:

```env
MYSQL_ROOT_PASSWORD=uma_senha_root_forte
MYSQL_DATABASE=uninerd_db
MYSQL_USER=uninerd_app
MYSQL_PASSWORD=uma_senha_app_forte

DB_HOST=localhost
DB_PORT=3307
DB_USER=uninerd_app
DB_PASSWORD=uma_senha_app_forte
DB_NAME=uninerd_db

JWT_SECRET=uma_chave_longa_aleatoria
BCRYPT_SALT_ROUNDS=10
PORT=3000
CORS_ORIGINS=http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082,http://127.0.0.1:8082
```

Não publique o arquivo `.env` nem reutilize as senhas do exemplo.

## Configuração do mobile

Crie ou ajuste `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000/api
```

- Android físico: use o IPv4 do computador, por exemplo `192.168.0.20`.
- Web no mesmo computador: use `http://localhost:3000/api`.
- Emulador Android padrão: normalmente use `http://10.0.2.2:3000/api`.
- Reinicie o Expo com cache limpo após mudar o endereço.

## Como iniciar

Abra três terminais.

### 1. Banco MySQL

Na raiz:

```powershell
docker-compose up -d db
docker-compose ps
```

O MySQL fica acessível no host pela porta `3307`.

### 2. API

Na raiz:

```powershell
npm install
npm run dev
```

A API fica em `http://localhost:3000`. Teste em `http://localhost:3000/api/test`.

Para executar o build compilado:

```powershell
npm run build
npm start
```

### 3. Aplicativo Expo

Em outro terminal:

```powershell
cd mobile
npm install
npx expo start --lan --clear
```

- Pressione `a` para abrir no Android.
- Pressione `w` para abrir no navegador.
- No Android físico, leia o QR Code com o Expo Go.
- Se a porta `8081` estiver ocupada, aceite a alternativa sugerida.

## Portas utilizadas

| Serviço | Endereço/porta |
| --- | --- |
| API REST | `http://localhost:3000` |
| Teste da API | `http://localhost:3000/api/test` |
| MySQL no Docker | `localhost:3307` |
| Expo | `8081` ou a próxima porta disponível |

O `docker-compose.yml` atual inicia somente o MySQL. A API, o Expo e qualquer proxy HTTPS devem ser iniciados separadamente.

## Segurança

- Senhas armazenadas com bcrypt.
- Autenticação JWT e rotas protegidas por middleware.
- Autorização por identidade, propriedade do recurso e RBAC centralizado por roles e permissões declaradas em cada rota.
- ID do paciente obtido do token ao agendar.
- CORS limitado às origens configuradas.
- Limitação de requisições em login e cadastro.
- Sessão mobile persistida pelo Expo Secure Store.
- CPF, senha, token e e-mail não são exibidos no perfil profissional do médico.
- Validações críticas repetidas pela API.

## Regras de agendamento

- O horário deve ser futuro e estar configurado pelo médico.
- Médico e paciente não podem possuir conflitos de horário ativos.
- Horários ocupados não são retornados como disponíveis.
- Na edição, o próprio agendamento pode ser ignorado por um `excludeId` autorizado.
- Agendamentos cancelados deixam de bloquear a disponibilidade.

Consulte todas as regras em [docs/regras-de-negocio.md](docs/regras-de-negocio.md).

## Testes e validações

### API

```powershell
npm run build
npm test -- --runInBand
```

### Mobile

```powershell
cd mobile
npm run typecheck
npm run lint
npm test -- --runInBand
```

Na última validação, os testes automatizados da API e do mobile foram aprovados. Execute-os novamente antes da apresentação para registrar evidências atualizadas.

## Documentação da rubrica

- [Persona principal — Ivonete](docs/PERSONA-IVONETE.md)
- [Especificação, contextualização e requisitos](docs/ESPECIFICACAO-DO-PROJETO.md)
- [Regras de negócio](docs/regras-de-negocio.md)
- [Checklist da rubrica](docs/RUBRICA-CHECKLIST.md)
- [Diagramas e instruções de exportação](docs/diagramas/README.md)
- [Evidências visuais e roteiro de validação](docs/evidencias/README.md)

Foram criados dois diagramas de casos de uso, dois de atividades e dois de sequência. Os arquivos-fonte estão em `docs/diagramas` no formato PlantUML (`.puml`).

O conjunto também contém o diagrama entidade-relacionamento do banco de dados e a especificação registra a evolução incremental do produto até a versão de entrega.
