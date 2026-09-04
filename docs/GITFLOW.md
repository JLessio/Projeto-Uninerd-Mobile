# GitFlow do projeto

Use este fluxo para atender a rubrica sem precisar inventar historico.

## Branches principais

- `main`: versao final e estavel para entrega.
- `dev`: integracao das funcionalidades antes de ir para `main`.
- `feature/*`: uma branch por grupo de alteracoes.

## Primeira preparacao local

```bash
git branch -M main
git add -- caminho/do/arquivo
git commit -m "chore: estrutura inicial do projeto"
git checkout -b dev
```

Para a lista exata de arquivos por dia, siga `docs/PLANO-DE-COMMITS.md`.

Quando voce conectar o GitHub:

```bash
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
git push -u origin dev
```

## Fluxo de uma feature

```bash
git checkout dev
git checkout -b feature/nome-da-feature

# faca as alteracoes
git add -- caminho/do/arquivo
git commit -m "tipo: descricao curta da alteracao"

git checkout dev
git merge feature/nome-da-feature
git branch -d feature/nome-da-feature
```

Depois de validar tudo:

```bash
git checkout main
git merge dev
git push origin main
git push origin dev
```

## Tipos de commit aceitos

- `feat`: nova funcionalidade.
- `fix`: correcao de bug.
- `test`: criacao ou ajuste de testes.
- `docs`: documentacao.
- `chore`: configuracao, organizacao ou tarefa de manutencao.
- `refactor`: melhoria interna sem mudar comportamento.
- `ci`: hooks, pipelines e automacoes.

Exemplos:

```bash
git commit -m "chore: organiza estrutura de pastas"
git commit -m "feat: configura ambiente docker com nginx"
git commit -m "test: adiciona fluxo e2e de cadastro"
```
