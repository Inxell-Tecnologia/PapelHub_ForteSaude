# Proposal — identidade-visual-fortesaude

## Why

O sync do fork com o upstream (`CarlosSalesNaturalTec/GDoc`, merge
`65904b4`) trouxe a identidade visual do **Instituto SETES** — changes
`identidade-visual-isetes`, `identidade-isetes-e-menu-compacto` e
`marca-dagua-e-inicio-rodada-3`. Essa identidade não é configuração de
implantação: é **ativo e token versionados** (`apps/web/public/isetes-*.png`,
`paleta` em `theme.ts`, cores do símbolo nas marcas d'água, `alt="Instituto
SETES"`, logo e favicon do manual). Por isso ela mesclou **sem conflito** e,
sem esta mudança, a Forte Saúde abriria o sistema com a logo e as cores de
outra organização, com a CI verde.

O cliente forneceu duas artes (logo horizontal e vertical, JPG 500×500, fundo
branco, sem transparência) e autorizou que a paleta seja alterada conforme as
cores da logo.

## What Changes

### Ativos da marca, derivados das artes fornecidas

- As duas artes originais passam a ser versionadas em
  `docs/images/fortesaude/`, com o script que deriva os ativos
  (`derivar_marca.py`) — os ativos são reproduzíveis, não editados à mão.
- Novos ativos em `apps/web/public/` (design.md D1, D2):
  - `forte-saude-logo-negativa.png` — logo horizontal com o azul em branco e o
    laranja preservado, fundo transparente, para os fundos escuros da marca;
  - `forte-saude-simbolo-negativo.png` — o símbolo isolado, mesma regra, para a
    navegação colapsada e a marca d'água da navegação;
  - `forte-saude-simbolo-cor.png` — o símbolo nas cores originais, para a marca
    d'água da área principal (fundo claro);
  - `favicon.png` regerado a partir do símbolo colorido.
- `isetes-logo-branca.png`, `isetes-logo-cor.png` e `isetes-simbolo.png` são
  removidos de `apps/web/public/`.

### Paleta derivada da logo

- Os **valores** da `paleta` em `theme.ts` passam a derivar do azul `#2121B7` e
  do laranja `#F6841F` da logo, cada par normatizado reapurado por cálculo
  (design.md D3). Os **nomes** dos tokens não mudam (design.md D4).
- Cores do símbolo usadas na apuração das marcas d'água passam às do novo
  símbolo (design.md D5).

### Marca no shell, no login e no manual

- `ATIVOS_DA_MARCA` aponta para os novos ativos; a logo é anunciada como
  **Forte Saúde**; nova variante `simboloSobreClaro` para a marca d'água da
  área principal.
- Largura da logo no shell expandido ajustada à proporção horizontal (D6).
- Manual: logo e favicon do site, paleta do tema e as passagens que descrevem a
  logo e o símbolo do ISETES.

## Capabilities

### Modified Capabilities

- `identidade-visual`: o requisito "Logomarca oficial é exibida na tela de login
  e no shell expandido" deixa de nomear a logo branca do Instituto SETES e passa
  a normatizar a **versão negativa** da logomarca do cliente; o símbolo ganha
  versão para fundo claro.
- `sistema-de-design`: os requisitos de paleta deixam de nomear cores do ISETES
  ("degradê azul-marinho", "verde da marca", "verde de ação") e passam a
  normatizar as funções pela paleta derivada da logo da Forte Saúde.

## Impact

- **Web (`apps/web`):** `public/` (ativos), `app/theme.ts` (valores),
  `shell/BrandMark.tsx`, `shell/MarcaDoProduto.tsx`,
  `shell/MarcaDaguaDaNavegacao.tsx`, `shell/MarcaDaguaDaAreaPrincipal.tsx`,
  comentários de `auth/LoginPage.tsx` e `shell/AppShell.tsx`; testes
  `contraste.test.ts`, `login.test.tsx`, `shell-identidade-visual.test.tsx`.
- **Docs:** `docs/manual/mkdocs.yml`, `docs/manual/docs/assets/`, novo
  `docs/manual/docs/stylesheets/marca.css`, `a-tela.md`, `primeiro-acesso.md`.
- **API, shared, Terraform, banco:** nada. Nenhuma rota, variável de ambiente,
  migration ou recurso de nuvem muda.
- **Sync com o upstream:** a divergência fica concentrada em `theme.ts` (só
  valores), `BrandMark.tsx` (a tabela de ativos) e nos dois módulos de marca
  d'água — os pontos que a próxima sincronização deve revisar.
