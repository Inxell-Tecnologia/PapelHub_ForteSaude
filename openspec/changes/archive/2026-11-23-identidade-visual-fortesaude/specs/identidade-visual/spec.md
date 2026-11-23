# Spec Delta

## MODIFIED Requirements

### Requirement: Logomarca oficial é exibida na tela de login e no shell expandido

A aplicação SHALL exibir a logomarca oficial — a **versão negativa** da logo da
Forte Saúde, de fundo transparente — na tela de login e no shell autenticado com
a navegação expandida.
A logomarca SHALL ser apresentada apenas sobre os fundos escuros da marca (o
degradê da navegação e o campo escuro da tela de login), e NÃO SHALL ser
exibida sobre fundo claro. Por ter fundo transparente, ela NÃO SHALL receber
moldura própria.

Referência: `docs/demanda_cliente_3.md`, item 1; change
`identidade-visual-fortesaude`, design.md D2.

#### Scenario: Logomarca aparece na tela de login
- **WHEN** uma pessoa não autenticada abre a tela de login
- **THEN** a logomarca oficial é exibida sobre o campo escuro da composição,
  junto ao cabeçalho com o nome da aplicação, sem moldura própria

#### Scenario: Logomarca aparece no shell expandido
- **WHEN** uma pessoa autenticada visualiza o shell com a navegação expandida
- **THEN** a logomarca oficial é exibida diretamente sobre o fundo da navegação,
  no topo, sem moldura própria

#### Scenario: Logomarca não aparece sobre fundo claro
- **WHEN** qualquer tela da aplicação apresenta a logomarca oficial
- **THEN** o fundo imediatamente atrás dela é um dos fundos escuros da marca

## ADDED Requirements

### Requirement: Ativos da marca são derivados das artes do cliente

Os ativos da marca SHALL ser derivados das artes fornecidas pelo cliente por um
procedimento versionado e reproduzível, e NÃO SHALL ser editados à mão. O
símbolo isolado da marca SHALL existir em duas versões — negativa, para os
fundos escuros, e colorida, para os fundos claros —, e cada superfície SHALL
usar a versão correspondente ao seu fundo.

Referência: change `identidade-visual-fortesaude`, design.md D1 e D2.

#### Scenario: Símbolo usa a versão adequada ao fundo
- **WHEN** o símbolo da marca é apresentado sobre a navegação escura e sobre a
  área principal clara
- **THEN** sobre a navegação aparece a versão negativa, e sobre a área principal
  a versão colorida

#### Scenario: Ativos são regeráveis a partir das artes do cliente
- **WHEN** o cliente substitui as artes de origem da marca
- **THEN** os ativos da aplicação são regerados pelo procedimento versionado, sem
  edição manual de imagem
