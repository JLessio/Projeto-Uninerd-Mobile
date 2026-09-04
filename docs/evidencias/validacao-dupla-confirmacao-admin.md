# Validação da dupla confirmação administrativa

## Objetivo

Comprovar que operações administrativas sensíveis exigem duas confirmações independentes:

1. validação da identidade pela senha do administrador;
2. confirmação explícita da ação que será executada.

## Edição de usuário

- `web-admin-editar-confirmacao-1.png`: primeira etapa solicitando a senha administrativa.
- `web-admin-editar-confirmacao-2.png`: segunda etapa perguntando se o administrador confirma a edição.

## Exclusão de usuário

- `web-admin-excluir-confirmacao-1.png`: primeira etapa solicitando a senha administrativa.
- `web-admin-excluir-confirmacao-2.png`: segunda etapa destacada como ação destrutiva.

## Resultado

As quatro telas foram obtidas na aplicação web em execução. Após cada segunda confirmação, foi utilizado o botão **Cancelar**. Portanto, nenhum usuário foi editado ou excluído durante a produção das evidências.

O mesmo componente React Native é utilizado no Android e no Expo Web, mantendo as duas etapas e as regras de RBAC em ambas as plataformas. A API somente entrega o token temporário de confirmação após validar a senha do administrador.

Resultado: **aprovado**.
