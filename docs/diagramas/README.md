# Diagramas do Projeto Uninerd

## Diagrama entidade-relacionamento

O arquivo `entidade-relacionamento.puml` representa a estrutura persistida no MySQL: especialidades, usuários, horários médicos e agendamentos. Ele identifica chaves primárias, estrangeiras e únicas, cardinalidades e as restrições usadas para impedir conflitos de agenda.

Para gerar a imagem:

```bash
plantuml docs/diagramas/entidade-relacionamento.puml
```

## Casos de uso

Os diagramas de casos de uso registram as funcionalidades acessíveis a cada ator e atendem ao requisito de no mínimo dois diagramas:

1. `casos-de-uso-paciente.puml`: cadastro, autenticação, perfil e gerenciamento de agendamentos pelo paciente.
2. `casos-de-uso-medico.puml`: cadastro profissional, perfil, configuração de disponibilidade e consulta da agenda pelo médico.

Os arquivos utilizam PlantUML. Para gerar as imagens em uma instalação com PlantUML disponível, execute:

```bash
plantuml docs/diagramas/casos-de-uso-paciente.puml
plantuml docs/diagramas/casos-de-uso-medico.puml
```

Também é possível abrir os arquivos com uma extensão PlantUML no editor e exportá-los como PNG, SVG ou PDF.

## Diagramas de atividades

Os diagramas de atividades apresentam as etapas, decisões e resultados das duas regras de negócio centrais:

1. `atividade-realizar-agendamento.puml`: seleção do médico, consulta de disponibilidade, validação de conflitos e criação do agendamento.
2. `atividade-configurar-agenda-medica.puml`: autenticação do médico, seleção dos horários, validação e substituição transacional da disponibilidade.

Para gerar as imagens:

```bash
plantuml docs/diagramas/atividade-realizar-agendamento.puml
plantuml docs/diagramas/atividade-configurar-agenda-medica.puml
```

## Diagramas de sequência

Os diagramas de sequência registram a ordem das chamadas entre atores, interfaces, API, camadas do backend e banco de dados:

1. `sequencia-criar-agendamento.puml`: consulta da disponibilidade, validações e criação ou rejeição do agendamento.
2. `sequencia-atualizar-agenda-medica.puml`: persistência da agenda do médico e posterior atualização dos horários exibidos ao paciente.

Para gerar as imagens:

```bash
plantuml docs/diagramas/sequencia-criar-agendamento.puml
plantuml docs/diagramas/sequencia-atualizar-agenda-medica.puml
```
