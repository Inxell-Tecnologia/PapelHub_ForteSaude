import { paleta, TAMANHO_MINIMO_TEXTO, FAMILIA_TITULO } from '../app/theme';
import { ATIVOS_DA_MARCA, BrandMark } from './BrandMark';

/**
 * Largura da logo na marca expandida. A logo horizontal da Forte Saúde (4,76:1)
 * é bem mais larga que a do ISETES (2,34:1) para a qual os 150 px da demanda
 * nº 2 foram medidos: ocupa quase toda a faixa ao lado do controle de recolher
 * (264 − 16 − 8 − 44 − 4 = 192 px): 186 px, que fecham sem resto com 39 px de
 * altura. Abaixo dos 64 px de antes, o orçamento de altura da navegação ganha
 * folga (change `identidade-visual-fortesaude`, design.md D6).
 */
const LARGURA_DA_LOGO = 186;

/**
 * Marca do shell expandido: logo da Forte Saúde e, logo abaixo, o nome do
 * produto e o descritor em texto (`docs/demanda_cliente_3.md`, item 1;
 * capability `identidade-visual`).
 *
 * **Nome acessível** (design.md D3): a logo tem "FORTESAÚDE" escrito —
 * é informação, então é anunciada pelo nome da organização; o nome do
 * **produto** é anunciado uma única vez, pelo texto "PapelHub".
 *
 * **Sem a linha da identificação do cliente.** Com a logo da organização no
 * topo, "Forte Saúde" em texto logo abaixo seria repetição, e custaria 18 px que o
 * orçamento de altura da navegação não tem (design.md D1). A identificação
 * continua no título do documento e na tela de login.
 */
export function MarcaDoProduto() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <BrandMark
        variante="logo"
        height={Math.round(LARGURA_DA_LOGO / ATIVOS_DA_MARCA.logo.proporcao)}
        informativa
      />
      <div
        style={{
          color: paleta.textoSobreEscuro,
          fontSize: TAMANHO_MINIMO_TEXTO,
          lineHeight: '18px',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: paleta.branco, fontFamily: FAMILIA_TITULO, fontWeight: 600 }}>
          PapelHub
        </span>
        {/* Descritor: constante do produto, não varia por implantação. O
            separador é decorativo e não é anunciado. */}
        <span aria-hidden> · </span>
        <span>Gestão de Documentos</span>
      </div>
    </div>
  );
}
