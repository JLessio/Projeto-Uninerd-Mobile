# Validação dos testes de interação administrativa

## Cenários cobertos

- listagem de pacientes e abertura do perfil selecionado;
- listagem de médicos com apresentação da especialidade;
- apresentação de erros devolvidos pela API;
- carregamento do perfil administrativo e dos respectivos agendamentos;
- redirecionamento de usuários sem a role `admin`;
- bloqueio da confirmação quando a senha não é informada;
- validação da senha administrativa na primeira etapa;
- exigência de uma segunda confirmação antes da ação sensível;
- cancelamento sem executar edição ou exclusão.

## Resultado da execução

Comandos utilizados:

```bash
npm run typecheck
npm test -- --runInBand
```

Resultado em 03/09/2026:

- TypeScript: aprovado, sem erros;
- 12 suítes aprovadas;
- 36 testes aprovados;
- nenhuma falha;
- nenhum dado real foi editado ou excluído.

Resultado geral: **aprovado**.
