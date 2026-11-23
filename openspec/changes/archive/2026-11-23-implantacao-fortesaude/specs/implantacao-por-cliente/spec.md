# Spec Delta

## Purpose

Trata o repositório como um **fork por cliente**: os valores versionados que
identificam a implantação — identificação do cliente exibida, repositório
autorizado a implantar, endereço canônico do manual, prefixo de nomes dos
recursos de nuvem — são os desta implantação, e não neutros nem herdados de
outra. Define também o que é escolha irreversível depois do primeiro
provisionamento, e exige que o procedimento de provisionar um projeto vazio seja
um documento versionado, porque as dependências entre seus passos são circulares
e os modos de falha são silenciosos.

## ADDED Requirements

### Requirement: Valores de implantação têm como default versionado o valor desta implantação

O repositório SHALL adotar, como valor padrão versionado de cada configuração de
implantação, o valor **desta** implantação — nunca um valor neutro, nunca o de
outra implantação. Isso alcança nominalmente: a identificação do cliente exibida,
o repositório autorizado a assumir a identidade de deploy, o prefixo de nomes dos
recursos de nuvem e o endereço canônico do manual do usuário.

A configuração não versionada SHALL ficar restrita ao que é segredo ou ao que só
passa a existir depois do primeiro provisionamento. Um provisionamento feito a
partir dos defaults versionados, sem nenhuma configuração local, NÃO SHALL
produzir uma implantação que se apresente como outro cliente, que fique sem
identificação de cliente, nem que autorize outro repositório a implantar.

#### Scenario: Provisionamento sem configuração local preserva a identidade do cliente

- **WHEN** a implantação é provisionada usando apenas os valores padrão
  versionados no repositório, sem arquivo de configuração local
- **THEN** a identificação de cliente exibida é a desta implantação, e não vazia
  nem a de outra

#### Scenario: Repositório autorizado a implantar é este

- **WHEN** a automação de deploy deste repositório solicita a identidade de
  deploy da implantação
- **THEN** a autorização é concedida a este repositório, e qualquer outro
  repositório é recusado

#### Scenario: Valor que só existe após provisionar não tem default versionado

- **WHEN** uma configuração depende de um endereço que só passa a existir depois
  do primeiro provisionamento
- **THEN** ela permanece fora dos defaults versionados e é registrada como passo
  do procedimento de implantação

### Requirement: Endereço canônico do manual é o de publicação deste repositório

O sistema SHALL adotar como endereço canônico do manual do usuário o endereço em
que **este** repositório publica o manual, e SHALL manter esse endereço idêntico
ao endereço declarado pela configuração de publicação do próprio manual. A
divergência entre os dois SHALL ser detectada automaticamente e reprovar a
verificação do repositório.

O endereço canônico NÃO SHALL apontar para um repositório ou organização que não
seja responsável por esta implantação, mesmo que o conteúdo publicado ali seja do
mesmo produto.

#### Scenario: Endereço canônico e endereço de publicação coincidem

- **WHEN** a verificação automática compara o endereço canônico adotado pela
  aplicação com o endereço declarado pela configuração de publicação do manual
- **THEN** os dois são iguais, e a verificação aprova

#### Scenario: Divergência entre os dois reprova a verificação

- **WHEN** apenas um dos dois endereços é alterado
- **THEN** a verificação automática reprova, apontando a divergência

#### Scenario: Pessoa autenticada alcança o manual desta implantação

- **WHEN** uma pessoa autenticada aciona o acesso ao manual do usuário sem que a
  implantação defina endereço próprio
- **THEN** é levada ao manual publicado por este repositório

### Requirement: Prefixo de nomes dos recursos de nuvem é escolha anterior ao primeiro provisionamento

O repositório SHALL derivar o nome de todo recurso de nuvem de uma **fonte única**
de prefixo, sem nome literal de recurso espalhado pela infraestrutura como
código. Esse prefixo SHALL respeitar o domínio de nomes mais restritivo entre os
recursos que o consomem, de modo que nenhum provisionamento seja recusado por
nome inválido.

A escolha do prefixo SHALL ser tratada como **anterior ao primeiro
provisionamento**: depois que os recursos existem, alterá-lo implica destruir e
recriar recursos que guardam dado — o que não é renomeação, e SHALL ser tratado
como imutável. O repositório SHALL registrar essa condição junto ao próprio
prefixo, para que a distinção entre "ainda escolhível" e "já imutável" fique
disponível a quem a encontrar.

O prefixo de infraestrutura NÃO SHALL ser confundido com o nome exibido do
produto: os dois SHALL poder divergir em grafia, e alterar um NÃO SHALL exigir
alterar o outro.

#### Scenario: Prefixo inválido para o recurso mais restritivo é recusado

- **WHEN** o prefixo escolhido não respeita o domínio de nomes do recurso mais
  restritivo que o consome
- **THEN** o provisionamento é recusado, e a recusa ocorre antes de qualquer
  recurso ser criado

#### Scenario: Nome exibido do produto independe do prefixo de infraestrutura

- **WHEN** o prefixo de infraestrutura usa uma grafia diferente da do nome
  exibido do produto
- **THEN** a aplicação continua exibindo o nome do produto em sua própria
  grafia, sem referência ao prefixo

#### Scenario: Prefixo é tratado como imutável depois do provisionamento

- **WHEN** alguém considera alterar o prefixo de uma implantação já provisionada
- **THEN** o repositório informa, no próprio ponto de configuração, que a
  alteração destrói e recria recursos que guardam dado

### Requirement: Procedimento de implantação de um projeto vazio é documento versionado em fases

O repositório SHALL manter um procedimento versionado que leve um projeto de
nuvem vazio até o primeiro acesso do administrador global, organizado em **fases
ordenadas** cuja fronteira seja o instante em que um valor necessário à fase
seguinte passa a existir. O procedimento SHALL declarar explicitamente cada
dependência circular — o repositório de estado que não pode ser criado pela
própria ferramenta de infraestrutura, o endereço do serviço que só existe depois
do primeiro provisionamento, e a imagem de aplicação de que a criação do
administrador global depende.

O procedimento SHALL destacar, com a consequência observável de cada uma, as
condições que produzem **falha silenciosa ou sintoma que não aponta a causa**.
SHALL cobrir nominalmente: a necessidade de autorizar todas as formas de endereço
pelas quais a interface pode ser aberta quando não há domínio próprio; a ordem
entre publicar a aplicação e exigir autenticação no canal interno de
reconciliação; e a condição em que a automação de deploy considera uma alteração
sem efeito em produção e por isso não publica nada.

O procedimento NÃO SHALL ser a única fonte das decisões de infraestrutura: SHALL
remeter ao ponto da infraestrutura como código que sustenta cada passo, de modo
que o comando possa ser conferido contra a fonte.

#### Scenario: Fase depende de valor criado pela fase anterior

- **WHEN** um passo exige o endereço do serviço de aplicação
- **THEN** ele aparece numa fase posterior à que cria o serviço, e o
  procedimento diz de onde o valor é lido

#### Scenario: Condição de falha silenciosa é declarada com o sintoma

- **WHEN** o procedimento descreve uma configuração cuja ausência não produz erro
  imediato
- **THEN** declara o sintoma observável que a ausência produz e o passo que a
  evita

#### Scenario: Alteração sem efeito em produção não publica aplicação

- **WHEN** a única alteração levada à linha principal se restringe aos tipos de
  arquivo que a automação classifica como sem efeito em produção
- **THEN** nenhuma imagem nova é publicada, e o procedimento declara essa
  condição para que a implantação não permaneça numa imagem de exemplo

### Requirement: Administrador global inicial é criado sem que a senha toque o repositório

A implantação SHALL criar o administrador global inicial por um procedimento
dedicado e idempotente, cuja senha SHALL ser fornecida por um cofre de segredos e
NÃO SHALL constar do repositório, da configuração de infraestrutura versionada
nem do estado da ferramenta de infraestrutura.

O endereço de e-mail do administrador global inicial SHALL ser tratado como
**identificador de acesso**, não como endereço de entrega: enquanto a implantação
não possuir canal de notificação por e-mail, o procedimento NÃO SHALL exigir que
esse endereço seja uma caixa postal existente nem que qualquer registro de
entrega seja configurado.

O procedimento SHALL alertar que uma senha gravada com caracteres invisíveis
excedentes produz recusa de todo acesso legítimo sem erro que aponte a causa, e
que corrigir o segredo depois NÃO SHALL ser suficiente, porque a criação é
idempotente e não reescreve a credencial já gravada.

#### Scenario: Senha não aparece em nenhum artefato versionado

- **WHEN** a implantação é concluída e o administrador global existe
- **THEN** a senha utilizada não consta do repositório, da configuração de
  infraestrutura versionada nem do estado da ferramenta de infraestrutura

#### Scenario: Endereço do administrador não exige caixa postal

- **WHEN** o administrador global inicial é criado com um endereço de e-mail que
  não corresponde a nenhuma caixa postal existente
- **THEN** o acesso funciona normalmente, porque o endereço é identificador de
  acesso

#### Scenario: Reexecução do procedimento não altera o administrador existente

- **WHEN** o procedimento de criação é executado novamente numa implantação que
  já possui administrador global
- **THEN** nada é alterado, e o procedimento declara que corrigir o segredo nessa
  situação não reescreve a credencial já gravada
