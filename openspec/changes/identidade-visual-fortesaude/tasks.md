# Tasks

> Fatia **de apresentação**, só em `apps/web` e `docs/`. Nenhuma rota, variável
> de ambiente, migration ou recurso de nuvem muda; não há tarefa de Terraform
> nem de SessionStart hook.

## 1. Ativos da marca

- [ ] 1.1 Versionar as artes do cliente em `docs/images/fortesaude/`
      (`fortesaude-original-horizontal.jpg`, `fortesaude-original-vertical.jpg`)
      e o script `derivar_marca.py` (design.md D1).
- [ ] 1.2 Gerar e copiar para `apps/web/public/`
      `forte-saude-logo-negativa.png` (144 px de altura),
      `forte-saude-simbolo-negativo.png` e `forte-saude-simbolo-cor.png`
      (400 px de altura) e `favicon.png` (64×64, símbolo colorido com margem
      transparente). Verificar: `file` reporta RGBA; prancha de inspeção sobre
      o índigo e sobre a superfície clara sem halo.
- [ ] 1.3 Remover `isetes-logo-branca.png`, `isetes-logo-cor.png` e
      `isetes-simbolo.png` de `apps/web/public/`. Verificar:
      `grep -rn "isetes-" apps/web/src` não encontra nada.

## 2. Paleta

- [ ] 2.1 Trocar os valores de `paleta` em `theme.ts` conforme design.md D3,
      sem renomear tokens; cabeçalho registra que os nomes são papéis herdados
      (D4) e cada comentário de token traz as razões reapuradas.
- [ ] 2.2 Atualizar a tabela de `contraste.test.ts` com as razões reapuradas e
      o teto da marca d'água da navegação (22%, design.md D5).

## 3. Marca no shell e no login

- [ ] 3.1 `ATIVOS_DA_MARCA`: logo negativa com `nome: 'Forte Saúde'`, símbolo
      negativo, nova variante `simboloSobreClaro` com o símbolo colorido
      (design.md D2).
- [ ] 3.2 `MarcaDaguaDaAreaPrincipal` usa `simboloSobreClaro`;
      `COR_MAIS_ESCURA_DO_SIMBOLO = '#2020B6'`, tabela do comentário reapurada.
- [ ] 3.3 `MarcaDaguaDaNavegacao`: `COR_MAIS_CLARA_DO_SIMBOLO = '#FFFFFF'`,
      tabela do comentário reapurada.
- [ ] 3.4 `MarcaDoProduto`: logo a 186 px de largura (design.md D6);
      comentários sem referência ao ISETES.
- [ ] 3.5 Testes `login.test.tsx` e `shell-identidade-visual.test.tsx`
      apontam para o novo ativo e o novo nome acessível.

## 4. Manual

- [ ] 4.1 `mkdocs.yml`: logo do cabeçalho = símbolo negativo, favicon = símbolo
      colorido, paleta `custom` com `stylesheets/marca.css` nas cores da marca.
- [ ] 4.2 `a-tela.md` e `primeiro-acesso.md`: descrever a logo e o símbolo da
      Forte Saúde e as cores atuais, sem ISETES.

## 5. Verificação

- [ ] 5.1 `npm run lint`, `npm run build`, `npm run test`, `npm run format:check`.
- [ ] 5.2 Subir a SPA e capturar login e shell (expandido e colapsado) para
      inspeção visual.
- [ ] 5.3 Ao arquivar: atualizar o _Purpose_ de `identidade-visual`, que ainda
      cita o Instituto SETES como logomarca oficial.
