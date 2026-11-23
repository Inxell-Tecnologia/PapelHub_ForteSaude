# Design — implantacao-fortesaude

## Context

O repositório `Inxell-Tecnologia/PapelHub_ForteSaude` é um **fork por cliente**
do mesmo produto, destinado ao projeto GCP `fortesaude-papelhub`, que existe e
está **vazio** — nenhum recurso provisionado, nenhum dado, nenhum usuário.

Essa condição — projeto vazio — é o fato que governa quase toda decisão aqui.
Várias escolhas que em produção são irreversíveis (prefixo de nomes de recursos,
região, tier do banco) são, neste instante, gratuitas. E várias ordens de
operação que em produção são indiferentes passam a ser obrigatórias, porque
recursos que ainda não existem não podem ser referenciados.

O que já está resolvido e **não é redecidido** aqui:

- A identificação do cliente é configuração de implantação, entregue em runtime
  por `GET /auth/public-config`, exibida fora do heading para não poluir o nome
  acessível (changes `rebranding-doc7-setes`, `rebranding-papelhub`).
- A SPA é servida pela **própria API**, mesma origem, a partir de
  `WEB_DIST_DIR` dentro da imagem (`Dockerfile:46`) — exigência do cookie
  `HttpOnly`/`SameSite=Strict` sem CORS.
- O administrador global inicial nasce de um Cloud Run Job dedicado, fail-closed,
  idempotente, com a senha vindo do Secret Manager (change
  `bootstrap-admin-producao`). O seed de dev se recusa a rodar com
  `NODE_ENV=production`.
- O envelope de capacidade (instâncias × pool × `max_connections`) está
  calculado e é cicatriz de incidente (`429 Rate exceeded.`).

Restrições herdadas, não renegociadas: bytes nunca passam pela API; bucket
privado com uniform bucket-level access; RLS por `unit_id` com `SET LOCAL` por
transação; `global_admin` nunca é olho universal sobre bytes/auditoria de outra
unidade; as três listas de prefixo de API em sincronia.

## Goals / Non-Goals

**Goals:**

- `Forte Saúde` exibido na tela de login e no shell, **por configuração**.
- Nenhum valor versionado deste fork apontando para o cliente anterior ou para
  a organização anterior.
- Prefixo de recursos GCP coerente com o produto, aproveitando a janela em que
  isso não destrói nada.
- Provisionar o projeto vazio até o primeiro login do administrador global por
  um procedimento escrito, em fases, que não falhe no meio por circularidade.
- `admin@papelhub.com` criado como `global_admin` inicial, com senha que nunca
  toca o repositório nem o state do Terraform.

**Non-Goals:**

- Alterar a camada de apresentação. O pedido do cliente se atende sem tocar um
  componente React — e tocar seria violar a spec de `identidade-visual`.
- Renomear identificadores de desenvolvimento e CI (D4).
- Domínio customizado (D7), staging, PITR, canal de e-mail, migração de região.
- Mexer no envelope de capacidade (D8).
- Executar o provisionamento (D10).

## Decisions

### D1 — A identificação do cliente entra como configuração, e o default versionado é o desta implantação

`app_client_name` recebe `"Forte Saúde"` **tanto** em `terraform.tfvars` (valor
operacional) **quanto** como `default` em `variables.tf` (valor versionado).

O default versionado é a parte não óbvia. Hoje ele é `""` — "nenhuma
identificação exibida" — o que era correto num repositório multi-cliente e passa
a ser um risco num fork por cliente: um `terraform apply` feito sem o
`terraform.tfvars` local (outra máquina, outro operador, pipeline futuro)
provisionaria o Forte Saúde **sem identificação alguma**, e o sintoma — uma tela
de login que parece certa — não denuncia a causa. Pelo mesmo raciocínio,
`github_repository` deixa de ter o repositório anterior como default: um default
errado ali produz falha de autenticação opaca no STS.

Regra que fica valendo neste fork: **todo valor de implantação tem como default
versionado o valor desta implantação, não um neutro.** `terraform.tfvars` passa a
ser o lugar do que é segredo ou do que só existe após provisionar (CORS,
audience do Pub/Sub), não o lugar onde a identidade do cliente se esconde.

_Alternativa descartada:_ manter os defaults neutros e confiar no
`terraform.tfvars`. Rejeitada porque `terraform.tfvars` é gitignored — o
repositório não tem como verificar que ele existe nem que está certo, e o modo
de falha é silencioso nos dois casos (branding ausente, deploy sem autenticar).

### D2 — Nenhum componente React é tocado

A spec `identidade-visual` proíbe literal no código da interface, e o mecanismo
que a satisfaz já está pronto e testado. Os únicos arquivos de web nesta mudança
são fixtures de teste.

Consequência operacional que vale registrar, porque é o que torna esta decisão
confortável: como `clientName` chega por fetch em runtime, **corrigir a
identificação não exige rebuild do frontend nem novo deploy** — um
`gcloud run services update --set-env-vars APP_CLIENT_NAME=...` e um F5
resolvem. É a rede de segurança para o risco de acentuação do D9.

### D3 — `app_name = "papelhub"`, minúsculo, e o prefixo é escolha irreversível depois do primeiro apply

A decisão pedida foi `name_prefix = "Papelhub"`. **Não é aplicável com
maiúscula**, e isso não é preferência de estilo: `local.name_prefix` deriva nomes
de recursos cujos domínios de nome o GCP valida como minúsculos —

| Recurso | Nome derivado | Restrição |
| --- | --- | --- |
| Bucket de arquivos | `${project_id}-${name_prefix}-files` | GCS: apenas minúsculas |
| Instância Cloud SQL | `${name_prefix}-pg` | minúsculas, dígitos, hífen |
| Serviço e Jobs do Cloud Run | `${name_prefix}-api`, `-migrate`, `-bootstrap`, … | minúsculas |
| Artifact Registry | `${name_prefix}-api` | minúsculas |

Com `"Papelhub"`, o `terraform apply` falha na validação do bucket e do Cloud
Run. Logo: `app_name = "papelhub"` → `name_prefix = "papelhub-prod"`.

Isso **não altera o nome exibido do produto**. `PapelHub`, com as maiúsculas
camelizadas, é literal da camada de apresentação (`LoginPage.tsx:86`,
`AppShell.tsx` com a forma curta `PH`) e é o nome comercial correto. As duas
grafias convivem por natureza: uma é marca, a outra é identificador de
infraestrutura.

**Por que contrariar `CLAUDE.md` é legítimo aqui.** A proibição registrada lá
("renomear o `name_prefix` faria o Terraform destruir e recriar bucket, Cloud SQL
e tópico Pub/Sub") é verdadeira e continua valendo — para um projeto
provisionado. Em `fortesaude-papelhub` não há o que destruir. A regra não é
revogada: é **reposicionada** como o que sempre foi, uma trava pós-provisionamento.
A redação em `CLAUDE.md` passa a dizer isso explicitamente, para que o próximo
cliente saiba que a janela existe e quando ela fecha.

_Alternativa descartada (e era a recomendação inicial):_ **manter `gdoc`.** O
argumento contra a troca é bom — todo o `infra/terraform/README.md` e as sete
variáveis de repositório do GitHub citam `gdoc-prod-*`, e divergir faz a
documentação mentir ao operador exatamente no passo em que errar custa um
administrador global com senha corrompida. Foi descartada porque o custo é
pagável de uma vez, agora, atualizando os documentos no mesmo commit (tarefa 5),
enquanto o custo de manter `gdoc` é permanente: todo operador futuro do Forte
Saúde encontra recursos com o nome de um produto que não existe mais. O risco
real da troca não é o nome — é a documentação ficar atrás dele. Por isso a
atualização dos READMEs é tarefa **da mesma fatia**, não follow-up.

Fica normatizado (spec `implantacao-por-cliente`): o prefixo SHALL ser escolhido
antes do primeiro provisionamento e, depois dele, SHALL ser tratado como
imutável.

Nota cosmética aceita: o bucket de arquivos fica
`fortesaude-papelhub-papelhub-prod-files` — "papelhub" repetido, porque o padrão
`${project_id}-${name_prefix}` encontra um project_id que já contém o nome do
produto. 39 caracteres, bem abaixo do limite de 63. Mudar o padrão de nome do
bucket para evitar a repetição seria tocar `storage.tf` por estética, com o risco
de divergir da forma documentada. Não vale.

### D4 — A renomeação alcança os recursos GCP e para aí

Entram: `app_name`, `db_name`, `db_user`. Os dois últimos porque são gratuitos
agora (nenhum `.sql`, `.ts`, `.yml` ou `.sh` do repositório referencia `gdoc_app`
— verificado por busca) e porque deixar `gdoc_app` dono das tabelas dentro de uma
instância `papelhub-prod-pg` é a mesma incoerência pela metade.

Ficam fora, deliberadamente:

- **Scope npm `@gdoc/*`** (109 ocorrências). Renomear é churn mecânico amplo,
  arrisca o `postinstall` e o consumo de `packages/shared` por `dist/`, e não
  tem nenhum efeito observável para o cliente.
- **`gdoc_dev`, `gdoc_ci`, `gdoc-dev-bucket`.** Papéis Postgres e bucket
  emulado do sandbox efêmero. O `gdoc_ci` em particular é o papel **não-superuser**
  da CI, escolhido de propósito para que superuser não mascare bug de isolamento
  RLS — mexer no nome dele é mexer no gate de segurança sem ganho.
- **`BOOTSTRAP_ADMIN_EMAIL=admin.global@gdoc.dev`** no `.env.example`: default de
  dev, e o próprio `bootstrap.ts` é fail-closed contra defaults conhecidos.

Critério: renomeia-se o que o **operador de produção** lê num console GCP;
preserva-se o que só o **desenvolvedor** lê num sandbox descartável.

### D5 — O endereço canônico do manual é o deste repositório, e os dois pontos mudam no mesmo commit

`CANONICAL_MANUAL_URL` (`config.ts:43`) e `site_url` (`mkdocs.yml:3`) passam a
`https://inxell-tecnologia.github.io/PapelHub_ForteSaude/`.

A duplicação entre os dois é deliberada e documentada no próprio código: a imagem
da API não carrega `docs/`, então não há como derivar em runtime; e derivar em
build colidiria com o allowlist `no_prod_effect` do `deploy.yml` — uma mudança
de `site_url` ficaria sem efeito em produção até alguém tocar código fora de
`docs/`. O guarda é `config-manual-url.test.ts`, que lê o `mkdocs.yml` e falha se
divergirem. **Esse teste não deve ser alterado por esta mudança**; se ele
precisar ser tocado, o repontamento ficou pela metade.

_Alternativas descartadas:_

**(a) Só setar `app_manual_url` no `terraform.tfvars`.** Resolveria o rodapé do
shell sem tocar código. Mas o `site_url` do MkDocs continuaria declarando a
organização anterior, e ele não é decorativo: o tema Material o usa no
`<link rel="canonical">` e no `sitemap.xml` do site publicado. Ficaria um
artefato publicado que atribui o manual do Forte Saúde a outra empresa.

**(b) Não mexer.** O rodapé do shell mandaria o usuário do Forte Saúde para a
GitHub Pages de um repositório de terceiro, que pode ser arquivado ou tornado
privado sem aviso. Inaceitável num fork por cliente.

Como `CANONICAL_MANUAL_URL` já é o default quando `APP_MANUAL_URL` é
vazia/ausente, `app_manual_url` permanece **vazio** no `terraform.tfvars`: o
override existe para a implantação que publica o manual em outro lugar, o que não
é o caso. Menos um valor para divergir.

**Dependência operacional:** GitHub Pages do repositório precisa estar habilitado
com **Source: GitHub Actions** (não "Deploy from a branch"), senão o
`deploy-pages@v4` falha. E `docs.yml` só dispara em push que toque
`docs/manual/**` — num fork recém-criado, o site nunca é construído até isso
acontecer. Esta mudança resolve por construção: ela **toca** `docs/manual/**`
(o `site_url`, o `index.md`, o `a-tela.md`), então o primeiro push na `main`
publica o site.

### D6 — O runbook é um documento versionado, em fases, e as fases existem por circularidade real

As fases não são organização estética. Cada fronteira entre fases é um ponto onde
um valor passa a existir:

```
FASE 0  bucket de state          ← o Terraform não cria o bucket do próprio state
FASE 1  terraform apply #1       ← cria a URL do Cloud Run (imagem placeholder)
FASE 2  7 variáveis no GitHub    ← dependem dos outputs da Fase 1
FASE 3  push na main → CI → Deploy ← publica a imagem REAL e migra o schema
FASE 4  secret da senha + Job de bootstrap ← o Job precisa da imagem da Fase 3
FASE 5  terraform apply #2       ← CORS e audience do Pub/Sub, com a URL da Fase 1
FASE 6  primeiro login
```

Três armadilhas ganham destaque próprio no documento porque **todas falham
silenciosamente ou com sintoma que não aponta a causa**:

1. **As duas formas de URL do Cloud Run no CORS.** Sem domínio customizado, o
   serviço responde em `-hash-<região>.a.run.app` **e** em
   `-<nº-projeto>.<região>.run.app`; o `Origin` enviado é aquele por onde a SPA
   foi aberta. Faltando uma, o upload falha com "Falha no envio." e erro de CORS
   no console — sintoma que não menciona bucket nem Terraform.
2. **Imagem antes da validação OIDC do Pub/Sub.** Ligar `pubsub_push_audience`
   antes de a imagem com o validador estar publicada transforma todo push
   legítimo em 401 até o código novo subir.
3. **O gate `no_prod_effect` do `deploy.yml`.** Um merge que toque apenas
   `*.md`, `docs/*`, `openspec/*`, `.github/workflows/*` ou `.gitignore` tem o
   build, a migração e o deploy **pulados**, e `deploy.yml` não tem
   `workflow_dispatch` — não há disparo manual, só re-run pela UI do Actions.
   Esta mudança passa pelo gate por construção, porque toca `.env.example`,
   `apps/api/src/config.ts` e `infra/terraform/*.tf` — nenhum deles no
   allowlist. **Registrado como consequência verificada, não como sorte:** uma
   mudança de implantação puramente documental ficaria presa na imagem
   `hello` do Cloud Run.

O runbook mora em `docs/` (prosa autoral, fora do Prettier por
`.prettierignore`) e não em `infra/terraform/README.md`, que é referência de
decisões — gêneros diferentes, e misturá-los foi o que deixou o procedimento
implícito até agora.

### D7 — `frontend_domain` permanece vazio

A SPA continua servida pela própria API em `*.run.app`. O bucket+CDN de frontend
é provisionado e fica vazio; o balanceador e o certificado gerenciado só nascem
quando houver domínio, porque o Google exige domínio real para emitir o
certificado.

Consequência que o runbook precisa declarar: é **por isso** que o CORS precisa
das duas formas de URL. Com domínio customizado haveria uma origem só. Trocar
depois é um change próprio, que reconcilia CORS, audience do Pub/Sub e o
`path_matcher` do url-map.

### D8 — O envelope de capacidade é herdado sem ajuste

`api_max_instances = 8`, `api_db_pool_max = 2`, `db_tier = db-f1-micro`,
`api_request_concurrency = 20`, `timeout = 120s`, `api_min_instances = 0`.

8 × 2 = 16 conexões no pior caso contra as 25 do tier, com 9 de folga para os
quatro Jobs e acesso manual. Num projeto novo a tentação é "folgar" o teto de
instâncias; subir `api_max_instances` sem subir `db_tier` **reproduz exatamente**
o `429 Rate exceeded.` na tela de login que o repositório já pagou para
diagnosticar, por um caminho pior (erro no banco em vez de fila). O runbook
reproduz a tabela do envelope como aviso, e esta mudança não altera nenhum dos
valores.

### D9 — `admin@papelhub.com` é identificador de login, não endereço de entrega

O `NotificationPort` tem hoje **só** a implementação in-app
(`in-app-notification-port.ts`). Não existe canal de e-mail. Portanto
`admin@papelhub.com` não precisa ser uma caixa que existe: não há DNS, SPF,
DKIM nem entregabilidade a configurar, e nenhum fluxo do produto envia mensagem
para ele. A senha chega por outro caminho — versão do secret
`papelhub-prod-bootstrap-admin-password`, criada pelo operador, nunca no
`terraform.tfvars` nem no state.

Dois riscos operacionais que o runbook carrega palavra por palavra:

- **Senha suja no Windows/PowerShell.** `echo -n` não suprime a quebra de linha
  (`-n` casa com `-NoEnumerate`) e encanar para executável nativo anexa
  `\r\r\n`. O bootstrap grava o hash do valor sujo e **todo login legítimo vira
  401**, sem erro que aponte a causa. Pior: corrigir o secret depois não
  resolve, porque `bootstrapAdmin()` é no-op quando já existe um `global_admin`
  — é preciso remover o admin pela RLS e reexecutar o Job. O runbook traz a
  forma por arquivo e a conferência de bytes.
- **Acentuação de `Forte Saúde`.** O valor atravessa tfvars → env var do Cloud
  Run → JSON → React, tudo UTF-8. Funciona, mas é exatamente a string que um
  terminal mal configurado corrompe. Mitigado pelo D2: conferir na tela e, se
  preciso, corrigir por `--set-env-vars` sem rebuild.

### D10 — A fatia entrega configuração e procedimento, não o provisionamento executado

Nenhuma tarefa desta mudança roda `terraform apply`, `gcloud` ou cria variável no
GitHub. O sandbox não tem credencial GCP, e as sete variáveis de repositório e as
configurações do console não são versionáveis.

A fronteira é explícita no `tasks.md`: as seções 1–6 são do repositório e
verificáveis por `npm run lint/build/test`; a seção 7 é checklist de execução
pelo operador, marcável fora do sandbox. Isso mantém honesto o critério de
"change implementado" — o change está pronto quando o repositório está correto e
o procedimento está escrito, não quando o Forte Saúde está no ar.

## Risks / Trade-offs

- **A troca de prefixo faz a documentação herdada divergir.** Mitigação: os
  READMEs e o `CLAUDE.md` são atualizados na mesma fatia (tarefa 5), e a tarefa
  de verificação inclui uma busca por `gdoc-prod` residual em prosa.
- **O runbook não pode ser testado no sandbox.** Mitigação: cada fase cita o
  arquivo `.tf` ou o workflow que a sustenta, de modo que o leitor possa
  conferir o comando contra a fonte em vez de confiar na prosa. O procedimento
  não inventa nada que não esteja em `infra/terraform/` ou `.github/workflows/`.
- **O endereço da implantação no manual só é conhecido na Fase 1.** Ou seja,
  `docs/manual/docs/index.md` tem um valor que a tarefa 4 não pode preencher
  antes de provisionar. Aceito e explícito: a tarefa deixa o lugar marcado, e a
  seção 7 do `tasks.md` contém o passo de preencher e empurrar o valor real —
  commit que toca `docs/manual/**` e republica o site, sem efeito em produção
  (pelo gate, corretamente).
- **Dois defaults versionados que apontam para esta implantação reduzem a
  reusabilidade do repositório como template.** Trade-off aceito e é o cerne da
  Interpretação "fork por cliente": o próximo cliente forka e troca os defaults,
  guiado pela spec `implantacao-por-cliente`, que enumera exatamente quais são.
