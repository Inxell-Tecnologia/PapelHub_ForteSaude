# Spec Delta

## MODIFIED Requirements

### Requirement: Limites operacionais apresentados como padrões da implantação

O manual SHALL apresentar os limites operacionais configuráveis — cota de
armazenamento por pessoa, prazo de retenção da lixeira, tetos de quantidade e
tamanho do download compactado e antecedência do aviso de expiração — informando
seus valores vigentes e deixando explícito que são **padrões da implantação**,
ajustáveis por configuração de ambiente. Esses valores NÃO SHALL ser afirmados
como constantes imutáveis do produto. O endereço de acesso à aplicação SHALL ser
identificado como o endereço da implantação em questão, e não como endereço único
do produto.

O endereço anunciado SHALL ser o **desta** implantação, e NÃO SHALL ser o de outra
implantação do mesmo produto. Do mesmo modo, quando o manual ilustrar a
identificação da organização exibida na interface, SHALL usar como exemplo a
identificação desta implantação, e NÃO a de outro cliente.

Especificamente quanto à cota de armazenamento, o manual SHALL apresentá-la como
o **padrão aplicado a quem não tem exceção**, e NÃO SHALL afirmá-la como o limite
de toda pessoa: o manual SHALL registrar que a administração global pode conceder
cota individual diferente a uma pessoa, e SHALL orientar quem não souber a
própria cota a consultá-la na tela de envio, que sempre exibe a cota efetiva.
Referência: design.md D9.

#### Scenario: Limite é apresentado com sua natureza configurável
- **WHEN** o usuário consulta a cota de armazenamento no manual
- **THEN** encontra o valor vigente acompanhado da ressalva de que é o padrão
  desta implantação

#### Scenario: Endereço não é apresentado como único do produto
- **WHEN** o usuário consulta como acessar a aplicação
- **THEN** o endereço é identificado como o desta implantação

#### Scenario: Endereço anunciado é o desta implantação
- **WHEN** o usuário consulta o endereço de acesso no manual publicado por este
  repositório
- **THEN** encontra o endereço desta implantação, e não o de outra implantação do
  mesmo produto

#### Scenario: Exemplo de identificação da organização é o desta implantação
- **WHEN** o usuário lê a explicação sobre a identificação da organização exibida
  nas telas de login e de navegação
- **THEN** o exemplo citado é a identificação desta implantação

#### Scenario: Cota é apresentada como padrão sujeito a exceção
- **WHEN** o usuário consulta a cota de armazenamento no manual
- **THEN** encontra a informação de que aquele é o valor padrão e de que pode
  existir cota individual distinta concedida pela administração global

### Requirement: Publicação automatizada do manual como site

O manual SHALL ser publicado automaticamente como site estático navegável a
partir do repositório, sem etapa manual de publicação a cada alteração. A
publicação SHALL ocorrer quando uma alteração do manual chega à branch principal,
e NÃO SHALL ser disparada por alterações que não tocam o manual. O artefato
publicado SHALL ser gerado a partir do commit correspondente, sem que HTML gerado
seja versionado no repositório.

O endereço de publicação declarado pela configuração do site SHALL ser o endereço
em que **este** repositório publica, e SHALL coincidir com o endereço canônico que
a aplicação oferece ao usuário autenticado — divergência entre os dois SHALL
reprovar a verificação automática do repositório. O procedimento de implantação
SHALL registrar que a publicação depende de o repositório estar configurado para
publicar a partir da automação, e que num repositório recém-criado o site só passa
a existir quando a primeira alteração do manual chega à branch principal.
Referência: design.md D5, D7.

#### Scenario: Alteração do manual publica o site
- **WHEN** uma alteração no manual é integrada à branch principal
- **THEN** o site é reconstruído e publicado com o conteúdo daquele commit

#### Scenario: Alteração de código não republica o manual
- **WHEN** uma alteração que não toca o manual é integrada à branch principal
- **THEN** a publicação do site não é disparada

#### Scenario: Site publicado não é versionado como HTML
- **WHEN** o site é publicado
- **THEN** nenhum arquivo gerado do site é adicionado ao histórico do repositório

#### Scenario: Endereço de publicação coincide com o endereço oferecido pela aplicação
- **WHEN** a verificação automática compara o endereço declarado pela
  configuração do site com o endereço canônico oferecido pela aplicação
- **THEN** os dois são iguais, e a verificação aprova
