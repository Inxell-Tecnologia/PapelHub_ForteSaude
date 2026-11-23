# Tasks

> Mudança de **CI/CD e IAM**. Nenhuma rota, migration, tela ou spec de produto
> muda. A implantação tem ordem obrigatória (seção 5): permissões e variável
> antes do merge do workflow (design.md D4).

## 1. Terraform — origem única da lista

- [ ] 1.1 `locals.tf`: mapa `deploy_updated_jobs` com `bootstrap`, `trash_purge`,
      `notify_grants` e `notify_readings`, cada um com o recurso do Job e a
      service account de runtime (design.md D1). Comentário explicando por que o
      Job de migração fica de fora.
- [ ] 1.2 `cicd.tf`: `google_cloud_run_v2_job_iam_member.deployer_run_developer_jobs`
      (`for_each` no mapa, `roles/run.developer`).
- [ ] 1.3 `cicd.tf`: `google_service_account_iam_member.deployer_act_as_job_runtime`
      (`for_each` nas service accounts **distintas** do mapa, excluída a da API,
      que já tem `deployer_act_as_api`; `roles/iam.serviceAccountUser`) — design.md
      D2.
- [ ] 1.4 `outputs.tf`: `deploy_updated_job_names`, nomes separados por espaço,
      em ordem estável.
- [ ] 1.5 `terraform fmt -check` no diretório. Verificar: sem diferenças.

## 2. Pipeline

- [ ] 2.1 `deploy.yml`: passo "Update scheduled and bootstrap job images" **depois**
      de "Deploy to Cloud Run", percorrendo `vars.GCP_DEPLOY_UPDATED_JOBS` com
      `gcloud run jobs update --image "${IMAGE}:${TARGET_SHA}"`, `set -euo
      pipefail` e o nome do Job em cada linha de log (design.md D3). Sem
      `execute`.
- [ ] 2.2 Mesmo passo: variável vazia ou ausente → `exit 1` com a mensagem de
      design.md D4.
- [ ] 2.3 Verificar o YAML (parse) e, se disponível, `actionlint`.

## 3. Documentação

- [ ] 3.1 Runbook, Fase 2: `GCP_DEPLOY_UPDATED_JOBS` na tabela de variáveis, com a
      origem (output `deploy_updated_job_names`).
- [ ] 3.2 Runbook, Fase 4 passo 6 e "Atualização de uma implantação no ar" passo
      4: o alinhamento passa a ser automático; o laço `gcloud` fica como
      recuperação (deploy vermelho no passo novo, ou Job criado por `apply`
      depois do último deploy).
- [ ] 3.3 Runbook, Armadilha 10: incluir no checklist de Job novo "acrescentar
      ao mapa `deploy_updated_jobs` e atualizar `GCP_DEPLOY_UPDATED_JOBS`".
- [ ] 3.4 `infra/terraform/README.md`: linha da variável nova na tabela de
      variáveis do GitHub.

## 4. Verificação local

- [ ] 4.1 `npm run format:check` (o workflow e o Terraform não são formatados
      pelo Prettier, mas o Markdown fora de `docs/` e `openspec/` é).
- [ ] 4.2 `openspec validate deploy-atualiza-jobs-agendados --strict`.

## 5. Implantação em produção (Cloud Shell + GitHub, nesta ordem)

- [ ] 5.1 Com a branch do PR em checkout no Cloud Shell: `terraform plan`.
      Esperado: **só criações** — 4 `deployer_run_developer_jobs` e 3
      `deployer_act_as_job_runtime` — mais o output novo, e as alterações
      cosméticas conhecidas (`client = "gcloud"`). Nenhum `destroy`/`replace`.
- [ ] 5.2 `terraform apply` e `terraform output -raw deploy_updated_job_names`.
- [ ] 5.3 GitHub → Settings → Variables: criar `GCP_DEPLOY_UPDATED_JOBS` com o
      valor do output.
- [ ] 5.4 Merge do PR (merge commit). Conferir no Actions o passo novo verde,
      com os quatro Jobs listados.
- [ ] 5.5 Conferir que os cinco Jobs e o serviço apontam para a mesma imagem
      (`gcloud run jobs describe … --format="value(spec.template.spec.template.spec.containers[0].image)"`
      para cada um, e o mesmo para o serviço).
- [ ] 5.6 Conferir que nenhum Job foi executado pelo deploy:
      `gcloud run jobs executions list --job=papelhub-prod-trash-purge --limit=1`
      não mostra execução no horário do deploy.
