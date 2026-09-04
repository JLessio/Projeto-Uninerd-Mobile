# Validação E2E web

## Ferramenta e ambiente

- Cypress 16;
- Google Chrome 151 em modo headless;
- Expo Web em `http://localhost:8081`;
- API em `http://localhost:3000/api`;
- execução em 03/09/2026.

## Fluxos executados

1. abertura do login e validação dos campos obrigatórios;
2. autenticação real do administrador;
3. redirecionamento direto para a lista de pacientes;
4. alternância entre as abas Pacientes e Médicos;
5. abertura de um perfil administrativo;
6. validação da senha na primeira confirmação;
7. apresentação obrigatória da segunda confirmação;
8. cancelamento seguro sem editar ou excluir dados.

## Resultado

```text
Spec: autenticacao-admin.cy.js
Testes: 3
Aprovados: 3
Falhas: 0
Duração: 8 segundos
```

Comando reproduzível:

```bash
npm run test:e2e
```

Resultado geral: **aprovado**.
