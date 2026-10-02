# Spec Delta

## MODIFIED Requirements

### Requirement: Nome da aplicação exibido é PapelHub

A aplicação SHALL exibir **PapelHub** como nome do produto em toda a camada
de apresentação: título do documento no navegador, cabeçalho da tela de
login, marca do shell autenticado e tela de Início. O nome NÃO SHALL variar
por papel, por unidade ou por estado de autenticação.

O **título do documento** SHALL ser composto pelo nome da aplicação seguido
da identificação do cliente, quando esta estiver configurada, no formato
`PapelHub - Forte Saúde`. O título estático servido no documento SHALL conter
**apenas o nome da aplicação**, e a composição com a identificação do cliente
SHALL ocorrer em tempo de execução, após a resolução da configuração — de
modo que a identificação NÃO SHALL ser fixada em tempo de compilação. Sem
identificação configurada, o título SHALL permanecer apenas com o nome da
aplicação.

Identificadores internos SHALL ser tratados em duas categorias distintas, e
este requisito NÃO SHALL ser invocado para alterar nenhuma delas. Os
identificadores de **desenvolvimento e integração contínua** — scope de pacotes
do monorepo, papéis de banco do sandbox e da CI, bucket emulado — permanecem
inalterados: não têm recurso de nuvem por trás e trocá-los não produz nenhum
efeito observável para quem usa o sistema. O **prefixo de nomes dos recursos de
nuvem** é escolha de implantação, governada pela capability
`implantacao-por-cliente`, e SHALL poder divergir em grafia do nome exibido do
produto sem que um exija o outro.

#### Scenario: Título do documento compõe nome e identificação do cliente
- **WHEN** uma pessoa abre a aplicação no navegador com a identificação do cliente
  configurada como `Forte Saúde`
- **THEN** o título do documento apresenta `PapelHub - Forte Saúde`

#### Scenario: Sem identificação configurada o título fica só com o nome
- **WHEN** uma pessoa abre a aplicação numa implantação sem identificação de
  cliente configurada
- **THEN** o título do documento apresenta apenas `PapelHub`

#### Scenario: Identificação do cliente não é fixada em tempo de compilação
- **WHEN** a identificação do cliente é alterada na configuração da implantação
- **THEN** o título do documento passa a refletir a nova identificação sem exigir
  nova compilação do frontend

#### Scenario: Tela de login apresenta o nome da aplicação
- **WHEN** uma pessoa não autenticada abre a tela de login
- **THEN** o cabeçalho da tela apresenta o nome **PapelHub**

#### Scenario: Shell autenticado apresenta a marca em ambos os estados
- **WHEN** uma pessoa autenticada visualiza o shell com a navegação expandida e
  depois colapsada
- **THEN** a marca apresenta o nome **PapelHub** no estado expandido e uma
  forma abreviada equivalente no estado colapsado

#### Scenario: Grafia do prefixo de infraestrutura não alcança o nome exibido
- **WHEN** o prefixo de nomes dos recursos de nuvem da implantação usa uma grafia
  diferente da do nome do produto
- **THEN** a aplicação continua exibindo **PapelHub** em toda a camada de
  apresentação, sem referência ao prefixo

### Requirement: Identificação do cliente é configurada por implantação

O sistema SHALL obter a identificação do cliente de uma configuração de ambiente
da implantação (`APP_CLIENT_NAME`), e NÃO SHALL embuti-la como literal no código
da interface. Quando a configuração estiver ausente ou vazia, a aplicação SHALL
operar normalmente e simplesmente NÃO exibir identificação de cliente, sem erro,
sem espaço reservado e sem degradação de nenhuma outra funcionalidade. A
identificação SHALL ser única por implantação, NÃO variando por unidade nem por
pessoa autenticada.

A identificação SHALL ser alterável **sem nova compilação do frontend e sem nova
publicação da imagem da aplicação**: por ser resolvida em tempo de execução a
partir da configuração do serviço, alterar a configuração e recarregar a página
SHALL bastar para que a nova identificação apareça.

#### Scenario: Identificação configurada é exibida
- **WHEN** a implantação define a identificação do cliente como `Forte Saúde`
- **THEN** a aplicação exibe `Forte Saúde` como identificação do cliente

#### Scenario: Ausência de configuração não exibe identificação nem quebra a tela
- **WHEN** a implantação não define identificação de cliente
- **THEN** nenhuma identificação de cliente é exibida e a tela de login permanece
  plenamente funcional

#### Scenario: Identificação não varia por unidade
- **WHEN** pessoas de unidades diferentes acessam a mesma implantação
- **THEN** todas veem a mesma identificação de cliente

#### Scenario: Correção da identificação dispensa nova compilação e nova publicação
- **WHEN** a identificação do cliente é corrigida na configuração do serviço de
  uma implantação já no ar
- **THEN** a identificação corrigida passa a ser exibida ao recarregar a página,
  sem nova compilação do frontend nem nova publicação da imagem
