import { ALTURA_CABECALHO } from '../app/theme';
import { ATIVOS_DA_MARCA } from './BrandMark';

/**
 * Opacidade da marca d'água da área principal (`docs/demanda_cliente_3.md`,
 * item 5: "6% de opacidade"; change `marca-dagua-e-inicio-rodada-3`, design.md
 * D1).
 *
 * Num fundo **claro** o símbolo **escurece** o fundo — o pior caso para o texto
 * escuro é o pixel **mais escuro** do símbolo (o inverso da navegação, onde o
 * pior era o mais claro). Mistura de `COR_MAIS_ESCURA_DO_SIMBOLO` com
 * `superficie`, contra os textos que aparecem direto sobre o fundo:
 *
 *   opacidade   textoApoio   texto     azulLink   verdeAcao (texto)
 *     0%          5,85:1     15,92:1   11,40:1      5,35:1
 *     6%          5,24:1     14,26:1   10,21:1      4,79:1   ← adotada
 *     8%          5,06:1     13,77:1    9,86:1      4,63:1
 *    10%          4,88:1     13,29:1    9,52:1      4,46:1 ✗
 *
 * Reapurada com a paleta e o símbolo da Forte Saúde (change
 * `identidade-visual-fortesaude`, design.md D3 e D5): é este par que fixa o
 * tom do laranja de ação — um laranja mais claro reprovaria já a 6%.
 *
 * Os cartões são opacos e ficam **por cima**: o texto deles não muda. O teste
 * de contraste refaz a conta a partir desta constante.
 */
export const OPACIDADE_MARCA_DAGUA_AREA_PRINCIPAL = 0.06;

/**
 * Pixel opaco mais escuro do símbolo **colorido** servido — o pior caso sobre
 * fundo claro. Medido no ativo gerado (o azul da logo, `#2121B7`, após a
 * reamostragem).
 */
export const COR_MAIS_ESCURA_DO_SIMBOLO = '#2020B6';

/** Altura do símbolo: acompanha telas baixas, com teto no desenho do mockup. */
const ALTURA_MARCA_DAGUA = 'min(70vh, 560px)';

/**
 * Símbolo decorativo à direita da área principal, em **todas** as telas do
 * shell autenticado — montado uma vez no `AppShell`, logo nunca no login. É a
 * versão **colorida** do símbolo: o fundo aqui é claro (change
 * `identidade-visual-fortesaude`, design.md D2).
 *
 * Camada **fixa** cobrindo só a área principal (abaixo da barra superior, à
 * direita da navegação): acompanha a viewport, não a altura da página, e, como
 * recorta a si mesma (`overflow: hidden`) fora do fluxo, **não gera rolagem**
 * — o que um `<img>` absoluto com deslocamento negativo dentro do conteúdo
 * geraria. Fica atrás do conteúdo (`z-index: 0`, com o `Content` em 1), fora da
 * árvore acessível e transparente ao ponteiro.
 *
 * `esquerda` é a largura atual da navegação (expandida, colapsada ou 0 no modo
 * estreito), recebida do `AppShell`, que já a conhece — sem medir o DOM.
 */
export function MarcaDaguaDaAreaPrincipal({ esquerda }: { esquerda: number }) {
  return (
    <div
      aria-hidden
      data-marca-dagua-area-principal=""
      style={{
        position: 'fixed',
        top: ALTURA_CABECALHO,
        left: esquerda,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <img
        src={ATIVOS_DA_MARCA.simboloSobreClaro.src}
        alt=""
        style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          height: ALTURA_MARCA_DAGUA,
          width: 'auto',
          aspectRatio: `${ATIVOS_DA_MARCA.simboloSobreClaro.proporcao}`,
          // ~⅓ do símbolo sai pela borda direita, como no mockup.
          transform: 'translate(33%, -50%)',
          opacity: OPACIDADE_MARCA_DAGUA_AREA_PRINCIPAL,
          userSelect: 'none',
        }}
      />
    </div>
  );
}
