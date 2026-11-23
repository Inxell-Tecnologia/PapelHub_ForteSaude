# Design — identidade-visual-fortesaude

## Context

A camada de apresentação herdada do upstream foi desenhada em torno da
identidade do Instituto SETES: uma logo **branca**, de fundo transparente,
apresentada apenas sobre fundos escuros (degradê da navegação e campo do
login); um símbolo isolado, também transparente, que aparece na navegação
colapsada, como marca d'água da navegação (fundo escuro) e como marca d'água da
área principal (fundo claro); e uma paleta marinho + verde, com cada par de
cores apurado por cálculo em `__tests__/contraste.test.ts`.

O que o cliente entregou não se encaixa direto nesse desenho: duas artes
coloridas (azul e laranja) **sobre fundo branco, em JPG**, sem versão
transparente nem negativa. A logo colorida sobre o índigo da navegação teria o
azul invisível; recortada com o fundo, viraria um selo branco.

Restrições herdadas e não renegociadas: tokens de apresentação têm origem única
(`sistema-de-design`); todo par normatizado é verificado por cálculo, nunca por
inspeção; a logo nunca aparece sobre fundo claro; o nome acessível da logo é o
nome da organização.

## Goals / Non-Goals

**Goals:**

- Nenhum ativo, cor ou nome acessível do Instituto SETES na interface nem no
  manual da Forte Saúde.
- Ativos derivados **das artes fornecidas**, de forma reproduzível.
- Paleta derivada da logo, sustentando os mesmos pisos de contraste.
- Divergência mínima em relação ao upstream, para que os próximos syncs não
  multipliquem conflitos.

**Non-Goals:**

- Mudar a composição das telas (posição da logo, layout do login, orçamento de
  altura da navegação, opacidades das marcas d'água).
- Transformar a identidade visual em configuração por implantação (D7).
- Reapurar tons categóricos (`tonsDeEstado`, `tonsDeTipoDocumental`,
  `tonsDeAtalho`): são cores semânticas, não de marca.

## Decisions

### D1 — Ativos derivados por desmistura sobre o branco, não por recorte

Cada pixel das artes é a composição de uma das três tintas da marca (azul
`#2121B7`, laranja `#F6841F`, cinza `#5C5C5C` da frase institucional) sobre o
branco. O script amplia a arte 4× (bicúbico) e, por pixel, escolhe a tinta que
melhor o reconstrói e calcula a opacidade:

```
c = a · tinta + (1 − a) · branco   ⇒   a = Σ(255 − c) / Σ(255 − tinta)
```

O pixel de saída recebe a cor **pura** da tinta com essa opacidade. Resultado:
fundo transparente sem halo branco, bordas lisas e cores exatas da marca.

_Alternativa descartada:_ remover o fundo por limiar de cor (chroma key). Deixa
franja clara na borda da arte, visível justamente sobre o índigo escuro.
_Alternativa descartada:_ redesenhar em vetor. Daria o melhor resultado, mas
seria uma arte nova, não derivada da fornecida; fica como evolução se o cliente
enviar o arquivo vetorial.

As artes originais e o script ficam versionados em `docs/images/fortesaude/`.
Regerar é `python3 -I derivar_marca.py <dir-das-artes> <dir-de-saída>`.

### D2 — Versão negativa: o azul vira branco, o laranja permanece

Para os fundos escuros, a logo e o símbolo têm o azul (e o cinza da frase)
trocados por branco, e o laranja **preservado**. O mesmo arranjo da logo ISETES
que substitui (símbolo colorido, texto branco), e o laranja mede 6,54:1 sobre o
topo do degradê e 4,19:1 sobre a base. Converter tudo para branco descartaria
metade da identidade da marca.

Como o símbolo agora aparece sobre os dois tipos de fundo, ele ganha **duas**
versões: negativa (navegação colapsada e marca d'água da navegação, fundo
escuro) e colorida (marca d'água da área principal, fundo claro, e favicon). A
versão negativa sobre fundo claro seria invisível; a colorida sobre o índigo
perderia o azul.

Fica uma nova variante em `ATIVOS_DA_MARCA`, `simboloSobreClaro`, consumida
só pela marca d'água da área principal.

### D3 — Paleta derivada da logo, função por função

| Token | Antes (ISETES) | Agora | Derivação | Pares apurados |
| --- | --- | --- | --- | --- |
| `marinhoEscuro` | `#012442` | `#12115C` | azul da logo escurecido | branco 16,66:1 (AAA) |
| `marinhoClaro` | `#0B5382` | `#2121B7` | azul da logo | branco 10,68:1 |
| `verdeMarca` | `#0EC782` | `#F6841F` | laranja da logo | texto 6,73:1; branco 2,55:1 (recusado) |
| `verdeAcao` | `#067A52` | `#A84A00` | laranja da logo escurecido | branco 5,76:1 |
| `azulLink` | `#025484` | `#1C1C9E` | azul da logo escurecido | branco 12,29:1 |
| `textoSobreEscuro` | `#CBD5DD` | `#D3D3F5` | tinta clara do azul | topo 11,43:1; base 7,33:1 |
| `azulAvatar` | `#9ED8F6` | `#C4C3F5` | tinta clara do azul | texto 10,19:1; branco 1,68:1 (recusado) |

Neutros (`texto`, `textoApoio`, `superficie`, bordas) e `vermelhoIndicador`
não mudam: não são cores da marca e já estão apurados.

O laranja de ação precisa ser escuro (`#A84A00`) por duas exigências ao mesmo
tempo: rótulo branco no botão (piso 4,5:1) **e** texto de ação sobre a marca
d'água da área principal a 6% (4,79:1; um tom mais claro, como `#B45309`,
cai para 4,17:1). O laranja vivo da logo continua sendo a cor de destaque
(item ativo, anel de foco sobre a navegação), com texto escuro por cima —
mesma regra que valia para o verde.

### D4 — Os nomes dos tokens não mudam

`verdeMarca` passa a guardar um laranja, e `marinhoEscuro`, um índigo. Os nomes
descrevem a origem ISETES, não a função, e renomeá-los alcançaria 7 arquivos e
dezenas de usos — cada um deles um conflito potencial no próximo sync com o
upstream, que continua usando esses nomes.

Mesmo critério de `implantacao-fortesaude` D4 para `@gdoc/*`: identificador
interno, sem efeito observável, não se renomeia. O cabeçalho de `theme.ts`
registra que os nomes são **papéis herdados** e que o valor é o desta
implantação. As specs, que são lidas por gente, passam a usar o nome da função
("cor de destaque da marca", "cor de ação"), não o do token.

### D5 — Marcas d'água: mesmas opacidades, constantes de cor reapuradas

`COR_MAIS_CLARA_DO_SIMBOLO` passa a `#FFFFFF` (pixel mais luminoso do símbolo
negativo) e `COR_MAIS_ESCURA_DO_SIMBOLO` a `#2020B6` (pixel opaco mais escuro
do símbolo colorido), ambos medidos nos ativos gerados.

As opacidades **não mudam** (8% na navegação, 6% na área principal): são
decisões visuais já aceitas pelo cliente, e a nova paleta as sustenta com mais
folga. Com o índigo, o texto da navegação sobre a marca d'água só reprova a
partir de 22% (antes, 14%). O teste que demonstrava "o teto não é arbitrário" a
14% passa a demonstrá-lo no novo limite.

### D6 — Logo do shell expandido a 186 px de largura

A logo horizontal da Forte Saúde tem proporção 4,76:1, contra 2,34:1 da logo
ISETES. Mantidos os 150 px, ela ficaria com 31 px de altura e a frase
institucional ilegível. A faixa disponível ao lado do controle de recolher é de
192 px (264 − 16 − 8 − 44 − 4); 186 px dão 39 px de altura (o valor que fecha
sem resto no arredondamento da proporção), **menos** que os
64 px que a logo ISETES ocupava — o orçamento de altura da navegação em 768 px
ganha folga, não perde. No login, a altura de 72 px (56 px estreito) dá 343 px
(267 px) de largura, dentro do campo de apresentação (máx. 520 px; 420 px
estreito).

### D7 — A identidade continua versionada, não configurada

Fazer logo e paleta virem de configuração por implantação removeria o conflito
de sync na origem, mas é uma mudança de arquitetura do upstream (a spec
`sistema-de-design` normatiza a paleta como constante do produto) e não cabe num
fork. Fica registrado como proposta a levar ao upstream: ativos e paleta num
módulo único por implantação, que o fork substitui sem tocar componentes.

## Risks / Trade-offs

- **[Arte em JPG de 500 px]** → a ampliação 4× suaviza as bordas; a desmistura
  e o ajuste de opacidade compensam, e a verificação visual sobre os dois
  fundos não mostrou halo. Se o cliente enviar arquivo vetorial ou PNG
  transparente, basta trocar as artes de entrada e rodar o script.
- **[Frase institucional pequena]** → no shell, a 39 px de altura, a frase
  "Cooperativa de trabalho em serviços de saúde" fica com ~4 px — legível como
  textura, não como texto. A logo é anunciada pelo nome da organização, então
  nenhuma informação depende de lê-la.
- **[Nomes de token enganosos]** → `verdeMarca` laranja confunde quem lê o
  código. Mitigado pelo comentário no cabeçalho de `theme.ts` (D4); o custo
  alternativo (conflito a cada sync) é recorrente.
- **[Próximo sync]** → mudanças do upstream em `theme.ts`, `BrandMark.tsx` ou
  nas marcas d'água vão conflitar com esta fatia. Resolução: manter a estrutura
  do upstream e reaplicar os valores e ativos desta change.
