# Tasks — implantacao-fortesaude

> **Fronteira desta fatia (design.md D10):** as seções 1–6 são do repositório e
> verificáveis por `npm run lint && npm run build && npm run test` no sandbox. A
> seção 7 é checklist de execução pelo operador, com credencial GCP e acesso ao
> console — não é executável aqui e não bloqueia o fechamento das seções 1–6.

## 1. Identificação do cliente (o pedido)

- [x] 1.1 `infra/terraform/variables.tf`: `app_client_name` com
  `default = "Forte Saúde"` — default versionado é o desta implantação
  (design.md D1). Atualizar a descrição para dizer que este repositório é um
  fork por cliente e que o default **é** o valor de produção, não um neutro.
- [x] 1.2 `.env.example`: `APP_CLIENT_NAME=Forte Saúde` (hoje `SETES`).
- [x] 1.3 `infra/terraform/terraform.tfvars.example`: descomentar
  `app_client_name` com o valor real e remover o exemplo `SETES`.
- [x] 1.4 **Não tocar** `apps/web/src/auth/LoginPage.tsx` nem
  `apps/web/src/shell/AppShell.tsx` (design.md D2) — a spec
  `identidade-visual` proíbe literal no código da interface. Confirmar por
  `git diff --stat` que nenhum componente React aparece no diff final.
- [x] 1.5 Fixtures de teste que usam `'SETES'` como valor de `clientName`
  passam a `'Forte Saúde'`: `apps/web/src/__tests__/login.test.tsx`,
  `apps/web/src/__tests__/shell-identidade-visual.test.tsx`. Coerência do fork —
  as asserções não dependem do valor, e isso deve continuar verdade depois da
  troca.

## 2. Repositório autorizado no CI/CD

- [x] 2.1 `infra/terraform/variables.tf`: `github_repository` com
  `default = "Inxell-Tecnologia/PapelHub_ForteSaude"`. É o valor que vira a
  `attribute_condition` do Workload Identity Pool (`cicd.tf:27`) — com o default
  antigo, nenhum deploy autentica, e o erro do STS não aponta a causa.
- [x] 2.2 **Não alterar `cicd.tf`** — a condição já deriva da variável; não há
  literal de repositório em recurso nenhum.

## 3. Endereço canônico do manual repontado (D5)

- [x] 3.1 `apps/api/src/config.ts`: `CANONICAL_MANUAL_URL` →
  `https://inxell-tecnologia.github.io/PapelHub_ForteSaude/`.
- [x] 3.2 `docs/manual/mkdocs.yml`: `site_url` com **exatamente** o mesmo valor
  de 3.1, no mesmo commit.
- [x] 3.3 Fixtures que repetem o endereço:
  `apps/web/src/__tests__/shell-manual-do-usuario.test.tsx` e
  `apps/web/src/__tests__/shell-painel-sobreposto.test.tsx`.
- [x] 3.4 **`apps/api/src/__tests__/config-manual-url.test.ts` não deve ser
  alterado** e deve passar. Ele lê o `mkdocs.yml` e compara com a constante — se
  precisar ser tocado, 3.1 e 3.2 divergiram.
- [x] 3.5 `app_manual_url` permanece **vazio** em `variables.tf` e comentado em
  `terraform.tfvars.example`: o canônico já é o certo, e um override redundante
  é mais um valor para divergir (design.md D5).

## 4. Manual do usuário com os dados desta implantação

- [x] 4.1 `docs/manual/docs/a-tela.md`: o exemplo de identificação da organização
  passa de `"SETES"` para `"Forte Saúde"`.
- [x] 4.2 `docs/manual/docs/index.md`: o bloco "Endereço desta implantação" deixa
  de anunciar a URL do Cloud Run do cliente anterior. O valor real só é conhecido
  na Fase 1 da seção 7 — deixar um marcador explícito e preencher no passo 7.6.2,
  nunca manter o endereço antigo "até depois".
- [x] 4.3 Conferir que nenhuma outra página do manual cita `SETES`, `GDoc` ou a
  URL antiga: `grep -rn "SETES\|GDoc\|gdoc-prod" docs/manual/`.
- [x] 4.4 Não formatar `docs/` com Prettier — está no `.prettierignore` de
  propósito (prosa autoral).

## 5. Prefixo de recursos GCP: `gdoc` → `papelhub` (D3, D4)

- [x] 5.1 `infra/terraform/variables.tf`: `app_name` `default = "papelhub"`
  — **minúsculo**. `name_prefix` passa a `papelhub-prod`. Acrescentar à descrição
  da variável a condição normativa: o prefixo é escolhível **antes** do primeiro
  provisionamento e imutável depois dele (recriar bucket/Cloud SQL/Pub/Sub é
  perda de dados, não renomeação).
- [x] 5.2 `infra/terraform/variables.tf`: `db_name` → `papelhub`, `db_user` →
  `papelhub_app`. Nenhum `.sql`, `.ts`, `.yml` ou `.sh` referencia `gdoc_app`
  (verificado) — reconfirmar com
  `grep -rn "gdoc_app\|\"gdoc\"" --include=*.sql --include=*.ts --include=*.yml --include=*.sh .`
  antes de fechar a tarefa.
- [x] 5.3 **Não alterar nenhum recurso `.tf`.** Todos derivam de
  `local.name_prefix`; a troca é só de default. Confirmar que o diff de
  `infra/terraform/` contém apenas `variables.tf`, os dois `.example` e o
  `README.md`.
- [x] 5.4 `infra/terraform/terraform.tfvars.example`: `project_id` →
  `fortesaude-papelhub`; comentários de exemplo de URL do Cloud Run deixam de
  citar `gdoc-prod-api-…`; `bootstrap_admin_email = "admin@papelhub.com"`.
- [x] 5.5 `infra/terraform/backend.hcl.example`: `bucket` →
  `fortesaude-papelhub-terraform-state`.
- [x] 5.6 `infra/terraform/README.md`: substituir todas as ocorrências de
  `gdoc-prod-*` e de `NAME_PREFIX="gdoc-${ENVIRONMENT}"` pelo novo prefixo; na
  seção "Bootstrap", a localização do bucket de state deste projeto é escolha
  nova (o parágrafo atual registra uma decisão de **não mover** o bucket do
  projeto anterior) — adotar `us-central1`, coerente com `var.region`, e reescrever
  o parágrafo como escolha e não como herança; remover a afirmação "Aplicado
  contra o projeto real `gdoc-502613`", que é de outra implantação.
- [x] 5.7 `CLAUDE.md`: reescrever a linha que registra `name_prefix = "gdoc"`
  como decisão. A nova redação mantém a trava (renomear destrói e recria
  recursos com dado) mas a posiciona como **trava pós-provisionamento**,
  registrando o prefixo vigente `papelhub` e que a escolha só é livre antes do
  primeiro `apply`. Manter congelados, com a razão, o scope `@gdoc/*`,
  `gdoc_dev`/`gdoc_ci` e `gdoc-dev-bucket` (design.md D4).
- [x] 5.8 `README.md`: o parágrafo de identificadores internos acompanha 5.7.
  Corrigir também o exemplo de login (`admin.global@gdoc.dev`) se ele estiver
  apresentado como credencial de produção — é de dev e deve dizê-lo.
  _Verificado: a seção "Prova de fundação ponta a ponta" já declara "o seed de
  dev cria alguns", então a condicional não se aplicou — nada a corrigir ali.
  O endereço canônico do manual nessa mesma página foi repontado (tarefa 3)._
- [x] 5.9 Busca de resíduo em prosa:
  `grep -rn "gdoc-prod" --include=*.md . | grep -v node_modules | grep -v changes/archive`
  deve voltar vazio. `openspec/changes/archive/` é histórico imutável — **não**
  tocar.

## 6. Runbook de implantação versionado (D6)

- [x] 6.1 Criar `docs/runbook-implantacao.md`, em pt_BR, organizado nas seis
  fases da seção 7 abaixo — a seção 7 é a especificação do conteúdo.
- [x] 6.2 Cada fase declara **o que passa a existir nela** e qual valor da fase
  seguinte depende disso. As três circularidades aparecem nomeadas: bucket de
  state anterior ao `init`; URL do Cloud Run anterior ao CORS e à audience do
  Pub/Sub; imagem real anterior ao Job de bootstrap.
- [x] 6.3 Cada passo remete ao arquivo que o sustenta (`cicd.tf`,
  `bootstrap_job.tf`, `deploy.yml`, …), para que o comando possa ser conferido
  contra a fonte em vez da prosa.
- [x] 6.4 Seção "Armadilhas" com as três de falha silenciosa e o **sintoma** de
  cada uma: as duas formas de URL no CORS; imagem antes da validação OIDC do
  Pub/Sub; gate `no_prod_effect` do `deploy.yml` sem `workflow_dispatch`.
- [x] 6.5 Seção "Não mexer" com a tabela do envelope de capacidade (design.md
  D8) e a razão: subir `api_max_instances` sem subir `db_tier` reproduz o
  `429 Rate exceeded.`.
- [x] 6.6 Trazer integralmente o alerta de senha suja no Windows/PowerShell que
  hoje vive em `infra/terraform/README.md`, incluindo o fato de que corrigir o
  secret depois **não** reescreve a credencial (design.md D9).
- [x] 6.7 `README.md`: um link para o runbook na seção de produção.

## 7. Execução pelo operador — checklist (fora do sandbox)

> Valores desta implantação: projeto `fortesaude-papelhub`, região
> `us-central1`, `name_prefix` `papelhub-prod`, admin inicial
> `admin@papelhub.com`.

### Fase 0 — pré-Terraform (Cloud Shell)

- [ ] 7.0.1 Billing habilitado no projeto `fortesaude-papelhub` (console GCP →
  Faturamento). Sem isso o `apply` falha ao habilitar as APIs.
- [ ] 7.0.2 `gcloud config set project fortesaude-papelhub`
- [ ] 7.0.3 Criar o bucket de state — o Terraform não pode criar o bucket onde
  guarda o próprio state:
  `gsutil mb -l us-central1 gs://fortesaude-papelhub-terraform-state` e
  `gsutil versioning set on gs://fortesaude-papelhub-terraform-state`
- [ ] 7.0.4 `cp backend.hcl.example backend.hcl` e
  `cp terraform.tfvars.example terraform.tfvars`; conferir `project_id`,
  `app_client_name` e `bootstrap_admin_email`.
- [ ] 7.0.5 GitHub → Settings → Pages → **Source: GitHub Actions** (não "Deploy
  from a branch"), senão o `deploy-pages@v4` do `docs.yml` falha.

### Fase 1 — primeiro `terraform apply` (cria a URL do Cloud Run)

- [ ] 7.1.1 `terraform init -backend-config=backend.hcl`
- [ ] 7.1.2 `terraform plan` — conferir que **nada** será destruído (projeto
  vazio) e que os nomes saem com `papelhub-prod`.
- [ ] 7.1.3 `terraform apply`. A API sobe com a imagem placeholder
  `us-docker.pkg.dev/cloudrun/container/hello` — esperado: o serviço existe, o
  código ainda não.
- [ ] 7.1.4 Guardar os outputs: `terraform output`. A partir daqui existem
  `api_url`, `artifact_registry_repository`,
  `github_actions_workload_identity_provider`,
  `github_actions_deployer_service_account`, `migrate_job_name`.
- [ ] 7.1.5 Registrar **as duas** formas de URL do serviço (console Cloud Run →
  serviço `papelhub-prod-api`): `-hash-<região>.a.run.app` e
  `-<nº-projeto>.<região>.run.app`. Ambas são necessárias na Fase 5.

### Fase 2 — variáveis de repositório no GitHub

- [ ] 7.2.1 GitHub → Settings → Secrets and variables → Actions → **Variables**
  (não Secrets — o controle de acesso é a condição do WIF + IAM, não o sigilo
  destes valores). Criar as sete: `GCP_PROJECT_ID` = `fortesaude-papelhub`,
  `GCP_REGION` = `us-central1`, `GCP_ARTIFACT_REPOSITORY`,
  `GCP_CLOUD_RUN_SERVICE` = `papelhub-prod-api`,
  `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_DEPLOYER_SERVICE_ACCOUNT`,
  `GCP_MIGRATE_JOB` = `papelhub-prod-migrate`.

### Fase 3 — publicar a imagem real

- [ ] 7.3.1 Integrar esta mudança na `main` (merge commit, nunca squash). O
  merge toca `.env.example`, `apps/api/src/config.ts` e `infra/terraform/*.tf` —
  **fora** do allowlist `no_prod_effect`, portanto o deploy prossegue.
- [ ] 7.3.2 Acompanhar `CI` → `Deploy`. O workflow builda, empurra a imagem,
  atualiza a imagem do Job de migração e executa `papelhub-prod-migrate` **antes**
  do `gcloud run deploy`. Falha na migração aborta antes do deploy, por desenho.
- [ ] 7.3.3 Se o `Deploy` tiver sido pulado ("no effect on production"), o
  commit tocou só o allowlist. `deploy.yml` **não tem `workflow_dispatch`** —
  re-rodar a execução pela UI do Actions ou levar uma alteração de código.
- [ ] 7.3.4 Confirmar que o `docs.yml` publicou o manual em
  `https://inxell-tecnologia.github.io/PapelHub_ForteSaude/` (o merge toca
  `docs/manual/**`).

### Fase 4 — administrador global inicial

- [ ] 7.4.1 Gravar a senha como versão do secret — **nunca** em
  `terraform.tfvars` nem no state:
  `echo -n "<SENHA>" | gcloud secrets versions add papelhub-prod-bootstrap-admin-password --data-file=- --project=fortesaude-papelhub`
  **No Windows/PowerShell não usar `echo -n`** — ver a seção de armadilhas do
  runbook (6.6): grava bytes invisíveis, todo login vira 401, e corrigir o
  secret depois não resolve.
- [ ] 7.4.2 Conferir o tamanho gravado: deve ser exatamente o número de
  caracteres da senha, sem `0D`/`0A` no fim.
- [ ] 7.4.3 Executar o Job uma vez (idempotente; aplica migrações pendentes e
  cria **só** o `global_admin`):
  `gcloud run jobs execute papelhub-prod-bootstrap --project=fortesaude-papelhub --region=us-central1 --wait`
- [ ] 7.4.4 Conferir nos logs do Job que o administrador foi criado, e não que
  foi no-op por já existir.

### Fase 5 — segundo `terraform apply` (CORS e Pub/Sub)

- [ ] 7.5.1 `terraform.tfvars`: `cors_allowed_origins` com **as duas** formas de
  URL de 7.1.5. Faltando uma, o upload falha com "Falha no envio." e erro de CORS
  no console quando a SPA é aberta pela forma ausente.
- [ ] 7.5.2 `terraform.tfvars`: `pubsub_push_audience` =
  `<api_url>/internal/storage-events`. Só agora — a imagem com o validador OIDC
  já está publicada (Fase 3); invertido, todo push válido vira 401.
- [ ] 7.5.3 `terraform apply`
- [ ] 7.5.4 Conferir que o `lifecycle.ignore_changes` preservou a imagem real do
  serviço — o `apply` **não** deve reverter para a placeholder.

### Fase 6 — validação funcional

- [ ] 7.6.1 Abrir a URL do Cloud Run: a tela de login mostra a logomarca, o
  título **PapelHub** e, abaixo, **Forte Saúde**. Conferir a acentuação; se
  estiver corrompida, corrigir por
  `gcloud run services update papelhub-prod-api --set-env-vars APP_CLIENT_NAME="Forte Saúde"`
  — não exige rebuild (design.md D2).
- [ ] 7.6.2 Com a URL confirmada, preencher o endereço desta implantação em
  `docs/manual/docs/index.md` (tarefa 4.2) e integrar. Esse commit toca só
  `docs/` — corretamente classificado como sem efeito em produção, e o `docs.yml`
  republica o site.
- [ ] 7.6.3 Entrar com `admin@papelhub.com`. Conferir: shell expandido mostra
  **Forte Saúde** sob a marca; aba do navegador mostra `PapelHub - Forte Saúde`;
  rodapé leva ao manual em `inxell-tecnologia.github.io/PapelHub_ForteSaude/`.
- [ ] 7.6.4 Enviar um arquivo de teste — valida CORS (7.5.1), URL assinada e
  reconciliação de cota pelo push do Pub/Sub (7.5.2). Conferir que o espaço usado
  na tela de envio reflete o arquivo.
- [ ] 7.6.5 Cadastrar as pessoas reais pela tela **Pessoas**. Confirmar que
  **não** existem contas de demonstração (`colaborador.a@…`, `admin.a@…`) — o
  seed é travado em produção, mas conferir é barato.

## 8. Verificação

- [x] 8.1 `npm run lint && npm run build && npm run test` na raiz.
- [x] 8.2 `npm run format:check` — gate da CI. `docs/` e `openspec/` ficam fora
  por `.prettierignore`; não formatá-los.
- [x] 8.3 `npm run test --workspace apps/api -- src/__tests__/config-manual-url.test.ts`
  passa **sem** o arquivo ter sido alterado (tarefa 3.4).
- [x] 8.4 `cd infra/terraform && terraform fmt -check && terraform validate`
  (`validate` não exige credencial).
  _O binário `terraform` **não existe** neste sandbox (config.yaml: dev roda sem
  GCP). Substituto executado: parse dos 19 `.tf` com `python-hcl2` (todos OK) e
  conferência dos defaults efetivos lidos da árvore sintática — `app_name`
  minúsculo, `name_prefix` = `papelhub-prod`, envelope 8×2=16 contra 25.
  **Rodar `fmt -check` e `validate` de verdade na Fase 1, antes do `plan`.**_
- [x] 8.5 `git diff --stat` final: nenhum arquivo em `apps/web/src/` fora de
  `__tests__/`; nenhum arquivo em `openspec/changes/archive/`; em
  `infra/terraform/` apenas `variables.tf`, `terraform.tfvars.example`,
  `backend.hcl.example` e `README.md`.
- [x] 8.6 `openspec validate implantacao-fortesaude --strict`

## 9. Pendências descobertas na implementação

- [ ] 9.1 **No arquivamento** (`/opsx:archive`): o `## Purpose` de
  `openspec/specs/identidade-visual/spec.md` cita `SETES` como exemplo
  ("identificação do cliente da implantação (ex.: **SETES**)"). O mecanismo de
  delta substitui **blocos de requisito** — `Purpose` não é alcançado por um
  delta só-`MODIFIED` (nenhum change arquivado deste repositório carrega
  `Purpose` num delta sem `ADDED`; verificado). Corrigir a prosa para
  `Forte Saúde` no mesmo commit do arquivamento, senão o registro consolidado
  fica citando o cliente anterior.
- [ ] 9.2 **Defeito corrigido durante a implementação, registrado para não
  reaparecer:** a primeira redação da descrição de `var.app_name` continha
  `` `${project_id}-${name_prefix}-files` `` dentro de um heredoco `<<-EOT`.
  Terraform **interpola** `${...}` em heredoc, e `project_id` não é referência
  válida num `description` (variável não referencia nada) — `terraform validate`
  reprovaria o módulo inteiro, e só na Fase 1, na máquina do operador. Reescrito
  como `<project_id>-<name_prefix>-files`. **Nunca usar `${}` em texto de
  `description`**; se for inevitável, escapar como `$${}`.

## 10. Defeitos revelados pelo primeiro provisionamento real

Encontrados ao executar a Fase 1 contra `fortesaude-papelhub`. Os dois são
anteriores a este change (vêm da fundação), mas só um projeto **vazio** os
expõe: no projeto do cliente anterior os Jobs nasceram num `apply` em que o
secret e as concessões já existiam.

- [x] 10.1 **`version = "latest"` da senha do administrador — ordenação, não
  corrida.** `bootstrap_job.tf` referencia `latest` do secret
  `bootstrap-admin-password`, cujo container é o único gerenciado pelo Terraform
  (a senha nunca entra no state, por desenho). O Cloud Run resolve `latest` **ao
  criar o Job**, então em projeto novo o `apply` completo falha sempre com
  `Secret .../versions/latest was not found`. O runbook colocava a gravação da
  senha na Fase 4, depois do `apply` — ordem impossível.
  **Corrigido** com a Fase 1a: `terraform apply -target=google_secret_manager_secret.bootstrap_admin_password`
  → gravar a versão → `apply` completo. A Fase 4 deixa de duplicar a gravação e
  passa a só conferir que a versão existe. O alerta de senha suja no
  PowerShell acompanhou a gravação para a Fase 1a, onde ela agora acontece.
- [x] 10.2 **Arestas de IAM ausentes no grafo — corrida real.** Os Jobs
  `trash_purge` e `notify_expiring_grants` têm service account **própria**,
  criada na mesma camada do grafo, e seus `depends_on` listavam
  `google_secret_manager_secret_version.database_url` mas **não** a respectiva
  `google_secret_manager_secret_iam_member`. O Cloud Run valida o
  `secretAccessor` na criação do Job, então o Terraform podia criar o Job antes
  da concessão → `Error code 9 ... Permission denied on secret`. Resultado não
  determinístico: na execução real o Job de expurgo passou e o de avisos
  falhou. **Corrigido** em `scheduler.tf` (as duas arestas) e em `cloud_run.tf`,
  que tinha a mesma lacuna no serviço da API (`api_database_url` e
  `api_auth_session_secret`) e vinha escapando por sorte de ordenação.
- [x] 10.3 **APIs de gerenciamento não pré-habilitadas.** O primeiro `apply`
  falhou na ativação de API ("erro de ativação e API IAM"): o `apis.tf` habilita
  as APIs da aplicação, mas o Terraform só habilita algo se as APIs de
  gerenciamento já estiverem ativas. **Corrigido** com o passo 3 da Fase 0
  (`gcloud services enable serviceusage cloudresourcemanager iam iamcredentials`)
  e o registro de que API recém-habilitada demora a propagar — uma retentativa
  do primeiro `apply` é esperada, não sintoma de erro de configuração.
- [ ] 10.4 **Rodar `terraform fmt -check` e `validate` na próxima sessão com
  Terraform instalado** (pendência herdada da tarefa 8.4). As edições de 10.1 e
  10.2 foram parseadas com `python-hcl2`, o que confirma sintaxe mas **não**
  resolve referências — um nome de recurso errado num `depends_on` só aparece no
  `validate`.
- [x] 10.5 **`deletion_protection` do provider 6.x trava a recuperação de um
  `create` falho.** Sequência real observada: os `create` dos Jobs de bootstrap
  e de avisos falharam (10.1 e 10.2) **depois** de a API aceitar o recurso, na
  espera de prontidão — então o Terraform gravou o id e marcou os dois como
  `tainted`. O apply seguinte planejou **substituir** os dois, e o destroy foi
  recusado: `cannot destroy job without setting deletion_protection=false`. O
  provider google 6.x (pinado em `versions.tf` como `~> 6.0`) introduziu essa
  flag com default `true` em Cloud Run v2, e o repositório só a declarava para
  o Cloud SQL.
  **Corrigido** com `deletion_protection = false` nos **quatro** Jobs
  (`bootstrap`, `migrate`, `trash_purge`, `notify_expiring_grants`): Job não
  guarda dado e destruir/recriar é gratuito, então ali a flag só produz impasse.
  **Deliberadamente NÃO replicado** no `google_cloud_run_v2_service.api`, onde o
  default `true` é rede de segurança desejável — o serviço é o endpoint de
  produção e destruí-lo é indisponibilidade, não recriação barata.
  **Limite do conserto, registrado porque não é óbvio:** o provider lê a flag do
  **state**, não da configuração, então isto impede o próximo impasse e **não
  desfaz um já instalado** — para esse caso a Armadilha 6 do runbook traz a
  saída (`gcloud run jobs delete` + `terraform state rm` + `apply`, já que a
  trava é do Terraform e não da API do Cloud Run).
- [x] 10.6 **Erro de ambiente registrado para não ser confundido com defeito do
  módulo.** O `apply` falhou com `dial tcp [2607:f8b0:...]:443: connect: cannot
  assign requested address` ao ler
  `data.google_storage_project_service_account` (`pubsub.tf:21`). É IPv6: o
  Cloud Shell não oferece IPv6 utilizável, o DNS devolve AAAA para
  `*.googleapis.com` e o provider (binário Go) tenta o IPv6 —
  [bug conhecido do provider](https://github.com/hashicorp/terraform-provider-google/issues/6782).
  **Nada a corrigir no Terraform.** Documentado na seção "Erros de ambiente" do
  runbook, separada das Armadilhas de propósito: armadilha é falha silenciosa do
  nosso desenho, isto é falha ruidosa de fora. A mensagem nomeia um recurso que
  não é a causa, e sem esse registro o operador tende a editar `pubsub.tf`.
