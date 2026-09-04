# Validação do upload de imagens

## Nome único e prevenção de colisões

Em 02/09/2026, o mesmo arquivo original (`mesma-foto.png`) foi enviado simultaneamente por duas contas. O Multer gerou e preservou dois nomes diferentes:

- `perfil-20260902232353725-5e7814c009bf.png`
- `perfil-20260902232353734-6aa17776d44f.png`

Os dois nomes correspondem ao padrão `perfil-<data-hora>-<identificador-aleatorio>.<extensão>` e ambos foram encontrados fisicamente em `uploads/profiles`. Resultado: aprovado, sem colisão.

A captura real da pasta está em `arquivos-upload-nomes-unicos.png`.

## Arquivos inválidos e tamanho máximo

| Cenário | Resultado |
| --- | --- |
| JSON com MIME `application/json` | HTTP 400 — bloqueado |
| `.exe` declarando MIME `image/png` | HTTP 400 — bloqueado |
| PNG com 5 MB + 1 byte | HTTP 400 — bloqueado |
| Arquivos acima de 5 MB restantes na pasta | 0 |
