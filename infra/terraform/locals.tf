locals {
  name_prefix = "${var.app_name}-${var.environment}"

  labels = merge(
    {
      app         = var.app_name
      environment = var.environment
      managed_by  = "terraform"
    },
    var.labels,
  )

  required_apis = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudscheduler.googleapis.com",
    "pubsub.googleapis.com",
    "storage.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "sts.googleapis.com", # troca de token do Workload Identity Federation (ver cicd.tf)
  ]

  create_frontend_lb = var.frontend_domain != ""

  # Prefixos servidos pela API (apps/api/src/app.ts) — espelha
  # apps/web/vite.config.ts (API_PROXY_PREFIXES) e apps/api/src/lib/
  # api-prefixes.ts (que também tem `/internal`, sem equivalente aqui pois
  # não passa pelo url-map). Mesma origem para SPA + API (design.md D1/D2 do
  # change `web-shell-e-auth`): preserva o cookie de sessão
  # HttpOnly/SameSite=Strict sem CORS. Mantenha as três listas em sincronia
  # ao adicionar uma rota.
  api_proxy_prefixes = [
    "/auth",
    "/files",
    "/folders",
    "/users",
    "/units",
    "/sectors",
    "/grants",
    "/trash",
    "/audit",
    "/dashboard",
    "/search",
    "/notifications",
    "/favorites",
    "/reading",
    "/health",
  ]
}
