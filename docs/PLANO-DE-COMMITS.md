# Plano exato de branches e commits

Este roteiro parte do estado atual do repositorio:

- branch atual: `main`;
- remoto configurado: `origin`;
- `main` sincronizada com `origin/main` no commit `16013d2`;
- `.env.example` e `.gitignore` ja estao no stage;
- os demais arquivos do projeto ainda nao foram versionados.

Execute os comandos na ordem apresentada e somente avance quando a conferencia de
cada etapa estiver correta.

## Regras de seguranca

- Execute os comandos na raiz do projeto.
- Nao use `git add .`, `git add -A` nem adicione uma pasta inteira.
- Nao use `git commit -am`, pois arquivos podem entrar no commit errado.
- Antes de cada commit, execute `git diff --cached --name-status` e compare a saida
  com a lista esperada.
- Se aparecer um arquivo inesperado no stage, remova somente esse arquivo com:

```bash
git restore --staged -- caminho/do/arquivo
```

- Nao execute `git reset --hard` nem descarte arquivos do projeto.

## 1. Criar a branch de integracao

Confirme que voce esta na `main`:

```bash
git branch --show-current
```

Saida esperada:

```text
main
```

Crie a branch `dev` a partir do commit atual da `main`:

```bash
git switch -c dev
git push -u origin dev
```

Confirme:

```bash
git branch --show-current
```

Saida esperada:

```text
dev
```

As alteracoes e os arquivos que ja estavam no stage permanecerao no diretorio de
trabalho. Isso e esperado.

Instale exatamente as dependencias registradas no `package-lock.json` antes das
validacoes. A pasta `node_modules/` e ignorada e nao entrara nos commits:

```bash
npm ci
git status --short package.json package-lock.json
```

O segundo comando nao deve mostrar alteracoes. Se mostrar, nao continue: revise a
versao do Node.js e do npm antes de criar os commits.

## 2. Commit da API

Crie a feature a partir da `dev`:

```bash
git switch -c feature/api
```

Adicione somente os arquivos da API e de sua configuracao:

```bash
git add -- .dockerignore
git add -- .env.example
git add -- .gitignore
git add -- Dockerfile
git add -- jest.config.js
git add -- package.json
git add -- package-lock.json
git add -- tsconfig.json
git add -- app.ts
git add -- server.ts
git add -- connection.ts
git add -- schema.sql
git add -- MedicalController.ts
git add -- MedicalRepository.ts
git add -- medicalRoutes.ts
git add -- User.ts
git add -- UserController.ts
git add -- UserRepository.ts
git add -- UserService.ts
git add -- userRoutes.ts
git add -- authMiddleware.ts
git add -- validators.ts
```

Confira o stage:

```bash
git diff --cached --name-status
```

Devem aparecer exatamente estes 22 arquivos:

```text
.dockerignore
.env.example
.gitignore
Dockerfile
jest.config.js
package-lock.json
package.json
tsconfig.json
app.ts
server.ts
connection.ts
schema.sql
MedicalController.ts
MedicalRepository.ts
medicalRoutes.ts
User.ts
UserController.ts
UserRepository.ts
UserService.ts
userRoutes.ts
authMiddleware.ts
validators.ts
```

Se a lista estiver correta, valide e crie o commit. O `npm ci` da etapa anterior e
necessario para que `jest` e `tsc` estejam disponiveis:

```bash
npm test
npm run build
git commit -m "feat: adiciona API de agendamento medico"
git push -u origin feature/api
```

Integre a feature na `dev`:

```bash
git switch dev
git merge --no-ff feature/api -m "merge: integra API de agendamento medico"
git push origin dev
```

Confirme que o merge entrou:

```bash
git log --oneline --decorate -5
```

Somente depois da confirmacao, remova a branch local da feature:

```bash
git branch -d feature/api
```

## 3. Commit do aplicativo mobile

Crie a feature a partir da `dev` ja atualizada:

```bash
git switch -c feature/mobile
```

Adicione somente os arquivos atuais do aplicativo:

```bash
git add -- mobile/.gitignore
git add -- "mobile/app/(tabs)/_layout.tsx"
git add -- "mobile/app/(tabs)/index.tsx"
git add -- "mobile/app/(tabs)/medicos.tsx"
git add -- "mobile/app/(tabs)/agendamentos.tsx"
git add -- mobile/assets/images/android-icon-background.png
git add -- mobile/assets/images/android-icon-foreground.png
git add -- mobile/assets/images/android-icon-monochrome.png
git add -- mobile/assets/images/favicon.png
git add -- mobile/assets/images/icon.png
git add -- mobile/assets/images/partial-react-logo.png
git add -- mobile/assets/images/react-logo.png
git add -- mobile/assets/images/react-logo@2x.png
git add -- mobile/assets/images/react-logo@3x.png
git add -- mobile/assets/images/splash-icon.png
```

Confira o stage:

```bash
git diff --cached --name-status
```

Devem aparecer somente `mobile/.gitignore`, os quatro arquivos de
`mobile/app/(tabs)/` e as dez imagens de `mobile/assets/images/`.

Nao devem aparecer `.expo`, `node_modules`, `.claude` ou `.vscode`.

Se estiver correto:

```bash
git commit -m "feat: adiciona telas iniciais do aplicativo mobile"
git push -u origin feature/mobile
git switch dev
git merge --no-ff feature/mobile -m "merge: integra aplicativo mobile"
git push origin dev
git branch -d feature/mobile
```

## 4. Commit do teste end-to-end

```bash
git switch -c feature/teste-e2e-medicos
git add -- cypress/e2e/doctors.cy.js
git diff --cached --name-status
```

A saida deve conter somente:

```text
cypress/e2e/doctors.cy.js
```

Se estiver correto:

```bash
git commit -m "test: adiciona teste e2e de medicos"
git push -u origin feature/teste-e2e-medicos
git switch dev
git merge --no-ff feature/teste-e2e-medicos -m "merge: integra teste e2e de medicos"
git push origin dev
git branch -d feature/teste-e2e-medicos
```

## 5. Commit da documentacao

Crie esta feature por ultimo, pois este proprio plano pode ser revisado durante os
passos anteriores:

```bash
git switch -c feature/documentacao
git add -- docs/GITFLOW.md
git add -- docs/PLANO-DE-COMMITS.md
git add -- docs/RUBRICA-CHECKLIST.md
git diff --cached --name-status
```

A saida deve conter exatamente:

```text
docs/GITFLOW.md
docs/PLANO-DE-COMMITS.md
docs/RUBRICA-CHECKLIST.md
```

Se estiver correto:

```bash
git commit -m "docs: atualiza gitflow plano de commits e checklist"
git push -u origin feature/documentacao
git switch dev
git merge --no-ff feature/documentacao -m "merge: integra documentacao do projeto"
git push origin dev
git branch -d feature/documentacao
```

## 6. Validacao completa antes da `main`

Confirme primeiro que esta na `dev`:

```bash
git branch --show-current
git status --short
```

A branch deve ser `dev`. O status pode continuar mostrando arquivos locais nao
versionados ou ignorados, mas nenhum arquivo deve estar no stage.

Execute as validacoes disponiveis na raiz:

```bash
npm test
npm run build
```

Confira o historico que sera levado para a `main`:

```bash
git log --oneline --decorate --graph main..dev
```

O historico deve mostrar os quatro commits planejados e seus merges.

## 7. Integrar a entrega na `main`

Execute esta etapa somente se todas as validacoes anteriores terminarem sem erro:

```bash
git switch main
git pull --ff-only origin main
git merge --no-ff dev -m "merge: publica entrega do projeto"
git push origin main
```

Confirme o resultado:

```bash
git status --short
git log --oneline --decorate --graph -12
git branch -vv
```

Ao final, `main` e `dev` devem apontar para historicos que contem todos os commits.
A `main` tera um commit de merge adicional referente a entrega.

## 8. Tag da versao

Crie a tag somente depois que o push da `main` funcionar:

```bash
git tag -a v1.0.0 -m "release: versao 1.0.0"
git push origin v1.0.0
```

Confira:

```bash
git tag --list
```

## Arquivos que nao devem ser adicionados

Mesmo que aparecam no `git status`, nao execute `git add` para estes caminhos:

```text
.env
.husky/_/
backend/.env
frontend/.env
frontend/.vite/
frontend/node_modules/
frontend/dist/
frontend/.vscode/
infra/certs/*.pem
mobile/.claude/
mobile/.expo/
mobile/.vscode/
mobile/node_modules/
node_modules/
dist/
cypress/screenshots/
cypress/videos/
```

Nunca publique `infra/certs/uninerd.local-key.pem`: esse arquivo contem uma chave
privada. Para visualizar tambem os arquivos ignorados, use:

```bash
git status --short --ignored
```

## Resultado final esperado

```text
main
  recebe a entrega validada a partir de dev

dev
  integra feature/api
  integra feature/mobile
  integra feature/teste-e2e-medicos
  integra feature/documentacao

origin/main
  acompanha main

origin/dev
  acompanha dev

v1.0.0
  aponta para a entrega final em main
```

As branches remotas `feature/*` permanecem no GitHub como registro do fluxo. As
branches locais sao removidas somente depois de integradas na `dev`.
