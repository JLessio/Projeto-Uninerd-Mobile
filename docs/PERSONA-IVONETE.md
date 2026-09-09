# Persona principal — Ivonete

> Ivonete é uma persona fictícia composta, construída a partir de dificuldades, comportamentos e necessidades observados em um conjunto de pessoas reais. Ela não representa uma pessoa específica e não contém dados que permitam identificar os participantes que serviram de referência.

## Origem da persona

A persona foi construída pela síntese de padrões recorrentes percebidos em pessoas idosas que precisam procurar atendimento médico e possuem experiência digital básica. Entre esses padrões estão a preferência por manter contatos importantes reunidos, a dificuldade de localizar profissionais em diferentes canais, a insegurança diante de interfaces complexas e a necessidade de confirmar claramente se uma ação foi concluída.

O nome Ivonete, a idade de 71 anos e sua narrativa pessoal são elementos fictícios usados para reunir essas características em uma personagem coerente. As necessidades representadas, porém, têm origem em situações vividas por um grupo real, e não apenas em suposições da equipe.

## Identificação

| Característica | Descrição |
| --- | --- |
| Nome | Ivonete |
| Idade | 71 anos |
| Ocupação | Aposentada |
| Contexto familiar | Mora com a filha e costuma organizar sozinha seus compromissos de saúde |
| Tecnologia disponível | Celular Android; utiliza principalmente ligações, WhatsApp e câmera |
| Experiência digital | Básica; consegue realizar tarefas quando as etapas são claras e não mudam inesperadamente |
| Acompanhamentos frequentes | Cardiologia para hipertensão, endocrinologia para diabetes e ortopedia por dores no joelho |

## Frase que representa a persona

> “Antes eu encontrava todos os telefones no mesmo caderno. Quero abrir um único lugar, achar o médico de que preciso e saber quando ele pode me atender.”

## História e contexto

Ivonete cresceu acostumada a consultar uma lista telefônica e, mais tarde, um caderno no qual mantinha os números de médicos, clínicas e familiares. Mesmo que fosse necessário telefonar para confirmar um atendimento, ela sabia que todas as opções estavam organizadas em um único lugar.

Com a migração dos serviços para a internet, as informações ficaram espalhadas entre sites, redes sociais, mensagens e diferentes números de telefone. Quando precisa de uma especialidade, Ivonete nem sempre sabe qual página é confiável, se o profissional ainda atende naquele local ou se haverá horário disponível. Ela também se sente insegura ao alternar entre muitas telas e tem receio de tocar na opção errada e perder o que já preencheu.

O Uninerd funciona para Ivonete como uma versão digital e mais útil de seu antigo caderno: concentra os médicos em um só ambiente, apresenta informações profissionais e permite consultar os horários sem depender de várias ligações. Depois de marcar, ela encontra a consulta novamente na página inicial, junto com o nome do médico, a data e a situação do atendimento.

## Objetivos

- Encontrar em um único lugar os médicos disponíveis para suas necessidades de saúde.
- Identificar facilmente a especialidade de cada profissional.
- Confirmar que o médico é um profissional real por meio de nome, foto, CRM, biografia e local de atendimento.
- Visualizar apenas dias e horários que realmente podem ser escolhidos.
- Marcar uma consulta sem precisar telefonar para várias clínicas.
- Consultar posteriormente com quem marcou, em qual dia e em qual horário.
- Cancelar quando houver um imprevisto e explicar o motivo de maneira respeitosa.

## Dificuldades e frustrações

- Informações de médicos espalhadas em diferentes sites e contatos.
- Letras pequenas, baixo contraste e botões sem descrição clara.
- Formulários longos que apagam dados quando ocorre um erro.
- Termos técnicos, mensagens genéricas e caminhos de navegação difíceis de entender.
- Insegurança para diferenciar horários livres, ocupados, cancelados ou já concluídos.
- Medo de marcar duas vezes ou não saber se o agendamento foi realmente salvo.
- Necessidade de pedir ajuda à filha quando uma aplicação apresenta opções demais.

## Necessidades de acessibilidade e usabilidade

- Linguagem direta, em português, sem nomes técnicos de rotas.
- Botões grandes, identificados pela ação que realizam.
- Bom contraste nos temas claro e escuro.
- Uma ação principal por etapa do agendamento.
- Possibilidade de voltar sem perder todo o contexto.
- Confirmações visíveis após salvar, editar ou cancelar.
- Tela inicial com os próximos compromissos e acesso ao histórico.
- Estados objetivos, como `Vago`, `Ocupado`, `Cancelado`, `Concluído` e `Expirado`.
- Rolagem quando o conteúdo ultrapassar o tamanho da tela.

## Jornada principal no Uninerd

1. Ivonete entra com sua conta e encontra seus próximos compromissos na tela inicial.
2. Seleciona **Novo agendamento** quando precisa de outra consulta.
3. Visualiza os médicos reunidos em uma lista e compara suas especialidades.
4. Escolhe um profissional e confere foto, CRM, biografia e local de atendimento.
5. O aplicativo mostra somente os próximos dias que possuem horários vagos.
6. Ivonete seleciona dia, horário e tipo de atendimento e confirma a reserva.
7. O sistema retorna à tela inicial, onde a consulta passa a funcionar como um lembrete organizado.
8. Se houver cancelamento, ela recebe uma explicação clara e ainda pode consultar o registro no histórico.

## Relação entre a persona e o produto

| Necessidade de Ivonete | Resposta do Uninerd |
| --- | --- |
| Ter os médicos reunidos como em seu antigo caderno | Lista centralizada de profissionais no fluxo de novo agendamento |
| Saber qual médico atende seu problema | Especialidade apresentada junto ao nome do profissional |
| Sentir confiança antes de escolher | Perfil profissional com foto, CRM, biografia e endereço de atendimento |
| Evitar várias ligações para perguntar horários | Consulta direta da disponibilidade configurada pelo médico |
| Não selecionar uma opção inválida | Exibição somente de dias futuros e horários vagos |
| Confirmar que a marcação deu certo | Retorno automático ao início com a consulta reservada |
| Recuperar informações posteriormente | Histórico de consultas independentemente do estado |
| Entender o que aconteceu com um compromisso | Estados claros e alerta com mensagem de cancelamento |
| Utilizar o celular com segurança | Interface com contraste, rolagem, textos objetivos e ações confirmadas |

## User Story principal

**Como** Ivonete, paciente de 71 anos com experiência digital básica,  
**quero** encontrar médicos, conferir informações profissionais e escolher um horário disponível em um único aplicativo,  
**para** cuidar dos meus compromissos de saúde sem depender de vários números de telefone ou pedir ajuda em todas as etapas.

### Critérios de aceite relacionados

- Os médicos devem aparecer com nome e especialidade claramente identificados.
- O perfil escolhido deve mostrar informações profissionais sem expor dados pessoais nocivos.
- Somente dias futuros com disponibilidade devem ser apresentados.
- Horários cancelados ou concluídos devem voltar a aparecer como vagos na grade de disponibilidade.
- Após a criação, a consulta deve aparecer na tela inicial da paciente.
- A interface deve permanecer legível no Android e na web, nos temas claro e escuro.

## Síntese

A conexão do Uninerd com Ivonete está na centralização e na previsibilidade. O aplicativo recupera a simplicidade que ela percebia no caderno telefônico, acrescentando informações profissionais, disponibilidade atualizada e confirmação do agendamento. Assim, a tecnologia reduz sua dependência de terceiros sem exigir que ela abandone a lógica de organização com a qual já está familiarizada.
