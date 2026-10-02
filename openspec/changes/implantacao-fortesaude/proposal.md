# Proposal — implantacao-fortesaude

## Why

O mesmo software é reimplantado para um novo cliente, **Forte Saúde**, num
projeto GCP recém-criado e **sem nada provisionado** (`fortesaude-papelhub`).
O pedido do cliente é de uma linha: exibir a identificação `Forte Saúde` nas
telas de login e de início.

Essa linha **já está implementada**. A identificação do cliente é configuração
de implantação desde o change `rebranding-doc7-setes`: `APP_CLIENT_NAME` →
`GET /auth/public-config` → `LoginPage.tsx:87` e `AppShell.tsx:163`. A spec
consolidada é explícita (`openspec/specs/identidade-visual/spec.md`): o sistema
SHALL obter a identificação de uma configuração de ambiente e **NÃO SHALL
embuti-la como literal no código da interface**. Escrever `Forte Saúde` num
componente React violaria a spec; o caminho correto é `app_client_name` em
`terraform.tfvars`.

O trabalho real desta mudança é outro, e não estava no enunciado: **este
repositório é um fork por cliente, mas seus valores versionados ainda são os do
cliente anterior.** Quatro divergências, de gravidades diferentes:

1. **O WIF do CI/CD aponta para outro repositório.** `var.github_repository`
   tem default `CarlosSalesNaturalTec/GDoc`, e esse valor alimenta a
   `attribute_condition` do Workload Identity Pool (`cicd.tf:27`). Com o
   default, o `google-github-actions/auth@v2` do `deploy.yml` falha na troca de
   token — nenhum deploy sai.
2. **O endereço canônico do manual aponta para a GitHub Pages de outra
   organização.** `CANONICAL_MANUAL_URL` (`apps/api/src/config.ts:43`) e
   `site_url` (`docs/manual/mkdocs.yml:3`) — duplicação deliberada, vigiada por
   `config-manual-url.test.ts` — dizem
   `https://carlossalesnaturaltec.github.io/GDoc/`. O rodapé do shell do Forte
   Saúde mandaria o usuário para um repositório fora do controle da Inxell, que
   pode ser arquivado ou tornado privado.
3. **O manual publica dados do cliente anterior.**
   `docs/manual/docs/index.md:12` anuncia como "endereço desta implantação" a
   URL do Cloud Run do cliente anterior, e `a-tela.md:8` usa `"SETES"` como
   exemplo de identificação da organização.
4. **`.env.example` traz `APP_CLIENT_NAME=SETES`** — o default de
   desenvolvimento deste fork é o nome do cliente anterior.

Aproveitamos ainda uma janela que **fecha no primeiro `terraform apply`**: o
prefixo de nomes dos recursos GCP. `CLAUDE.md` e `README.md` registram
`name_prefix = "gdoc"` como decisão imutável, com razão correta — trocá-lo faz o
Terraform destruir e recriar bucket, Cloud SQL e tópico Pub/Sub. Mas essa razão
é sobre o projeto **já provisionado** do cliente anterior. Em
`fortesaude-papelhub` não existe recurso algum: aqui a troca custa zero, e só
aqui. Decisão tomada: `app_name = "papelhub"`.

Por fim, provisionar este repositório de zero tem **três circularidades** que
fazem uma lista linear de comandos falhar no meio (a URL do Cloud Run não existe
antes do primeiro `apply`, mas o CORS e a audience do Pub/Sub precisam dela; o
Job de bootstrap precisa da imagem real, que depende de variáveis do GitHub que
dependem dos outputs do Terraform). O conhecimento está espalhado em
`infra/terraform/README.md` em forma de referência, não de procedimento. Esta
mudança o consolida num runbook em fases, versionado, reaproveitável no próximo
cliente.

## What Changes

### Identificação do cliente (o pedido)

- `app_client_name = "Forte Saúde"` em `terraform.tfvars` (não versionado) e
  como **default** em `infra/terraform/variables.tf` — fork por cliente: o
  default versionado é o desta implantação.
- `.env.example`: `APP_CLIENT_NAME=Forte Saúde` (hoje `SETES`).
- **Nenhum componente React muda.** Os fixtures de teste que usam `'SETES'`
  como valor arbitrário de `clientName` passam a usar `'Forte Saúde'`, por
  coerência do fork — não porque a asserção dependa do valor.

### Repositório autorizado no CI/CD

- `var.github_repository` default →
  `Inxell-Tecnologia/PapelHub_ForteSaude`.

### Endereço canônico do manual repontado

- `CANONICAL_MANUAL_URL` e `mkdocs.yml::site_url` →
  `https://inxell-tecnologia.github.io/PapelHub_ForteSaude/`, em commit único
  (o teste de sincronia reprova se divergirem).
- Os dois fixtures de teste da web que repetem o endereço acompanham.
- GitHub Pages do repositório habilitado com **Source: GitHub Actions**.

### Prefixo de recursos GCP

- `var.app_name` default `gdoc` → **`papelhub`** (minúsculo — ver design.md D3),
  logo `name_prefix = "papelhub-prod"`. Alcança, por derivação, o nome do
  serviço Cloud Run, os quatro Jobs, a instância Cloud SQL, o bucket de
  arquivos, o repositório do Artifact Registry, os tópicos/subscriptions do
  Pub/Sub e os três secrets.
- `var.db_name` e `var.db_user` acompanham (`papelhub`, `papelhub_app`) —
  nenhum SQL ou código referencia esses nomes (verificado), e o custo é zero
  antes do provisionamento.
- `CLAUDE.md`, `README.md` e `infra/terraform/README.md` deixam de registrar
  `name_prefix = "gdoc"` como decisão e passam a registrar o novo prefixo com a
  razão da janela ("escolhível só antes do primeiro apply").
- **Não alcança** o scope npm `@gdoc/*`, `gdoc_dev`, `gdoc_ci` nem
  `gdoc-dev-bucket` — identificadores de desenvolvimento e CI, sem recurso GCP
  por trás. Ver design.md D4.

### Manual do usuário com os dados desta implantação

- `docs/manual/docs/index.md`: endereço desta implantação (URL real do Cloud Run,
  conhecida só depois da Fase 1 do runbook).
- `docs/manual/docs/a-tela.md`: exemplo de identificação da organização passa de
  `"SETES"` para `"Forte Saúde"`.

### Runbook de implantação versionado

- Novo `docs/runbook-implantacao.md` — seis fases ordenadas, com as três
  circularidades explícitas e as três armadilhas que produzem falha silenciosa:
  as **duas** formas de URL do Cloud Run no CORS, a ordem "imagem antes da
  validação OIDC do Pub/Sub", e o gate `no_prod_effect` do `deploy.yml`.
- Inclui o bootstrap do `global_admin` inicial `admin@papelhub.com`, com a senha
  entrando como versão do secret `papelhub-prod-bootstrap-admin-password` —
  nunca em `terraform.tfvars` nem no state.

Fora de escopo (registrado em design.md):

- **Domínio customizado do frontend.** `frontend_domain` permanece vazio; a SPA
  continua servida pela própria API em `*.run.app`, mesma origem. Ver D7.
- **Qualquer alteração no envelope de capacidade.** `api_max_instances = 8`,
  `api_db_pool_max = 2`, `db_tier = db-f1-micro` permanecem — o produto 8×2=16
  contra as 25 conexões do tier é cálculo fechado em change anterior. Ver D8.
- **Ambiente de staging**, reativação do PITR, canal de e-mail do
  `NotificationPort`, migração de região.
- **Migração de dados do cliente anterior** — não existe; é implantação nova.
- **Executar o provisionamento.** Esta mudança entrega configuração e runbook;
  a execução depende de credencial GCP e de acesso ao console, indisponíveis no
  sandbox.

## Capabilities

### New Capabilities

- `implantacao-por-cliente`: o repositório é um fork por cliente, e seus valores
  versionados — identificação do cliente, repositório autorizado no CI/CD,
  endereço canônico do manual, prefixo de recursos — são os **desta**
  implantação, de modo que um provisionamento a partir dos defaults não aponte
  para outro cliente. Inclui o runbook em fases que torna o provisionamento de
  um projeto vazio um procedimento reproduzível, e normatiza o prefixo de
  recursos como escolha irreversível depois do primeiro provisionamento.

### Modified Capabilities

- `identidade-visual`: o requisito de identificadores internos afirma que
  `name_prefix` do Terraform permanece inalterado — deixa de ser verdade. O
  requisito é reescrito para separar o que continua congelado (identificadores
  de desenvolvimento e CI) do que é escolha de implantação (prefixo de recursos
  GCP), sem afrouxar a proibição de embutir a identificação do cliente no
  código. O cenário que exemplifica com `SETES` passa a exemplificar com
  `Forte Saúde`.
- `documentacao-usuario`: o manual passa a normatizar que a identificação da
  organização usada como exemplo e o endereço anunciado são os **desta**
  implantação, e que o endereço de publicação do próprio manual é o deste
  repositório.

## Impact

- **Terraform (`infra/terraform`):** defaults de `app_name`, `db_name`,
  `db_user`, `github_repository` e `app_client_name` em `variables.tf`;
  `terraform.tfvars.example` e `backend.hcl.example` com os valores deste
  projeto; `README.md` reescrito nas seções de bootstrap, CI/CD e decisões.
  **Nenhum recurso `.tf` muda de forma** — só os defaults que os nomeiam.
- **API (`apps/api/src`):** uma linha — `CANONICAL_MANUAL_URL` em `config.ts`.
  Nenhuma rota, nenhuma regra de acesso, nenhum middleware.
- **Web (`apps/web/src`):** nenhum componente. Apenas fixtures em
  `__tests__/shell-manual-do-usuario.test.tsx`,
  `__tests__/shell-painel-sobreposto.test.tsx`, `__tests__/login.test.tsx` e
  `__tests__/shell-identidade-visual.test.tsx`.
- **Shared (`packages/shared`):** nada. O DTO `PublicConfigResponse` já carrega
  `clientName`.
- **Config de ambiente:** `.env.example` (`APP_CLIENT_NAME`).
- **Docs:** `CLAUDE.md`, `README.md`, `docs/manual/mkdocs.yml`,
  `docs/manual/docs/index.md`, `docs/manual/docs/a-tela.md`, e o novo
  `docs/runbook-implantacao.md`.
- **Testes:** `config-manual-url.test.ts` continua sendo o guarda da sincronia
  `config.ts` ↔ `mkdocs.yml` e **deve passar sem alteração** — se precisar ser
  tocado, o repontamento ficou pela metade.
- **Sem migração de banco.** Sem mudança no SessionStart hook. Sem mudança na
  paridade dev↔prod: os seams não são tocados.
- **Configuração fora do repositório** (não versionável, listada no runbook):
  sete variáveis de repositório no GitHub, GitHub Pages em modo Actions, bucket
  de state do Terraform, versão do secret da senha do administrador.
