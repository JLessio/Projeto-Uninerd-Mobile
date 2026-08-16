# Projeto Uninerd

João Lessio

Sistema de agendamento medico usando as ferramentas DevOps, Cloud, Redes, Cyberseguranca e Tech Forge.

## Estrutura de pastas

```text
.
  backend/          API Node.js + TypeScript
  frontend/         Aplicacao React + Vite
  mobile/           Aplicativo React Native com Expo Router
  database/         Scripts SQL de criacao do banco
  infra/
    nginx/          Proxy reverso, HTTPS e headers de seguranca
    certs/          Certificados locais para uninerd.local
  cypress/          Testes end-to-end
  docs/
    docker/         Guia do ambiente Docker/local
  scripts/          Scripts auxiliares do projeto
```

## Comandos principais

```bash
npm install
cp .env.example .env
npm run docker:up
npm run test:e2e
```

## Enderecos locais

- `https://uninerd.local`: aplicacao via Nginx com HTTPS.
- `https://localhost`: alternativa local.
- `http://localhost`: redireciona para HTTPS.

## Pontos da rubrica cobertos

- `docker-compose.yml` separado por servicos, redes, volumes e variaveis de ambiente.
- Backend conectado ao MySQL pela rede interna `database-net`.
- Frontend consumindo o backend por `/api` atraves do Nginx.
- MySQL persistindo dados no volume `mysql_data`.
- Nginx como proxy reverso com HTTPS, redirecionamento HTTP para HTTPS e headers de seguranca.
- Somente o Nginx expoe portas no host.
- Husky configurado para validar mensagem de commit e executar testes e2e no pre-push.

# Arquitetura do Projeto

```text
Mobile
  ↓
API REST
  ↓
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Banco de Dados
```

## Aplicacoes

### Backend

API responsavel pelas regras de negocio, autenticacao, validacoes relacionadas a requisicao e persistencia. A organizacao segue uma arquitetura em camadas:

```text
backend/src/
  config/
  controllers/
  database/
  entities/
  middlewares/
  repositories/
  routes/
  services/
  utils/
```

As `routes` definem URLs, metodos HTTP e middlewares. Os `controllers` recebem `Request`, chamam os `services` e devolvem `Response`. Os `services` concentram regras de negocio. Os `repositories` concentram acesso ao banco de dados.

### Frontend

Aplicacao web em React + Vite. Nesta etapa ela foi apenas analisada e preservada, pois ja faz parte do projeto existente.

### Mobile

Aplicativo React Native utilizando Expo SDK 54 e Expo Router. A estrutura foi padronizada para separar rotas, componentes reutilizaveis, services, tipos, constantes e hooks.

## Estrutura de Diretorios

```text
projeto/
  backend/
  frontend/
  mobile/
    app/
      _layout.tsx
      login.tsx
      (tabs)/
        _layout.tsx
        index.tsx
        medicos.tsx
        agendamentos.tsx
    components/
      common/
        AppButton.tsx
        AppInput.tsx
        AppScreen.tsx
      ui/
    constants/
      config.ts
      theme.ts
    hooks/
    services/
      api.tsx
    types/
      api.ts
      appointment.ts
      doctor.ts
      user.ts
    assets/
  cypress/
  database/
  docs/
  infra/
  scripts/
  docker-compose.yml
```

## Padroes utilizados

- Separacao de responsabilidades entre backend, frontend web e mobile.
- Backend em camadas: Routes, Controllers, Services, Repositories e banco de dados.
- Expo Router no mobile com telas mantidas dentro de `mobile/app`.
- Componentes reutilizaveis em `mobile/components/common`.
- Services para comunicacao com recursos externos, centralizando a API em `mobile/services/api.tsx`.
- URL base da API centralizada em `mobile/constants/config.ts`.
- Tipagem TypeScript em `mobile/types` para usuarios, medicos, agendamentos e respostas de API.
- Imports do mobile usando alias `@/`, conforme `mobile/tsconfig.json`.
