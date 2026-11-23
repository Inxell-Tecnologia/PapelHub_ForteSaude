"""Deriva os ativos de marca da Forte Saúde a partir das duas artes fornecidas
(JPG, 500x500, fundo branco, sem transparência).

Método: amplia a arte (bicúbico), e para cada pixel decide de qual tinta da
marca ele é (azul, laranja ou cinza da frase) e quanto dela há sobre o branco —
a "desmistura" da composição sobre fundo branco:

    c = a * tinta + (1 - a) * branco   =>   a = soma(255 - c) / soma(255 - tinta)

A tinta escolhida é a que reconstrói o pixel com menor erro. O pixel de saída
recebe a cor **pura** da tinta com a opacidade `a`: bordas lisas, sem halo
branco, e cores exatamente as da marca.

Versões:
  cor      — tintas originais (para fundo claro)
  negativa — azul e cinza viram branco, laranja permanece (para fundo escuro)

Uso: python3 -I derivar_marca.py <dir-das-artes> <dir-de-saida>
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

AZUL = (33, 33, 183)  # #2121B7, mediana medida na arte
LARANJA = (246, 132, 31)  # #F6841F
CINZA = (92, 92, 92)  # frase "COOPERATIVA DE TRABALHO..."
BRANCO = (255, 255, 255)

TINTAS = np.array([AZUL, LARANJA, CINZA], dtype=float)
NEGATIVA = np.array([BRANCO, LARANJA, BRANCO], dtype=float)

ESCALA = 4


def desmisturar(rgb: np.ndarray, paleta_saida: np.ndarray) -> Image.Image:
    c = rgb.astype(float)
    tinta_c = 255.0 - c  # (h, w, 3)
    erros, alfas = [], []
    for t in TINTAS:
        a = np.clip(tinta_c.sum(axis=2) / (255.0 - t).sum(), 0, 1)
        recon = a[..., None] * t + (1 - a[..., None]) * 255.0
        erros.append(((recon - c) ** 2).sum(axis=2))
        alfas.append(a)
    erros = np.stack(erros)
    alfas = np.stack(alfas)
    k = erros.argmin(axis=0)
    a = np.take_along_axis(alfas, k[None], axis=0)[0]
    # Ruído de compressão JPG no fundo vira transparência total; a borda
    # ganha contraste para compensar o borrado da ampliação.
    a = np.clip((a - 0.10) / 0.80, 0, 1)
    out = np.zeros(rgb.shape[:2] + (4,), dtype=np.uint8)
    out[..., :3] = paleta_saida[k].astype(np.uint8)
    out[..., 3] = np.round(a * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def ampliar(img: Image.Image) -> np.ndarray:
    return np.asarray(
        img.resize((img.width * ESCALA, img.height * ESCALA), Image.Resampling.BICUBIC)
    )


def recortar_ao_conteudo(img: Image.Image, margem: int = 0) -> Image.Image:
    bbox = img.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = bbox
    return img.crop((x0 - margem, y0 - margem, x1 + margem, y1 + margem))


def redimensionar_altura(img: Image.Image, altura: int) -> Image.Image:
    largura = round(img.width * altura / img.height)
    return img.resize((largura, altura), Image.Resampling.LANCZOS)


def quadrado(img: Image.Image, lado: int, respiro: float = 0.06) -> Image.Image:
    """Enquadra sem distorcer: margem transparente, nunca estiramento."""
    util = round(lado * (1 - 2 * respiro))
    f = util / max(img.width, img.height)
    s = img.resize((max(1, round(img.width * f)), max(1, round(img.height * f))),
                   Image.Resampling.LANCZOS)
    fundo = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    fundo.paste(s, ((lado - s.width) // 2, (lado - s.height) // 2), s)
    return fundo


def main() -> None:
    origem, destino = Path(sys.argv[1]), Path(sys.argv[2])
    destino.mkdir(parents=True, exist_ok=True)

    horizontal = Image.open(origem / '1.jpg').convert('RGB')
    vertical = Image.open(origem / '2.jpg').convert('RGB')

    # Logo horizontal: faixa de tinta medida em (53, 209)–(447, 290).
    h = horizontal.crop((45, 200, 456, 300))
    rgb_h = ampliar(h)
    logo_neg = recortar_ao_conteudo(desmisturar(rgb_h, NEGATIVA))
    logo_cor = recortar_ao_conteudo(desmisturar(rgb_h, TINTAS))

    # Símbolo: topo da arte vertical (linhas 159–272). O acento do "Ú" de
    # SAÚDE invade o canto inferior direito do retângulo (linhas 268+,
    # colunas 320+) e é apagado antes da desmistura.
    v = np.asarray(vertical).copy()
    v[266:, 318:] = 255
    simb = Image.fromarray(v).crop((150, 150, 350, 276))
    rgb_s = ampliar(simb)
    simb_neg = recortar_ao_conteudo(desmisturar(rgb_s, NEGATIVA))
    simb_cor = recortar_ao_conteudo(desmisturar(rgb_s, TINTAS))

    # Servidos a 2x da maior exibição: logo até ~72 px de altura no login.
    redimensionar_altura(logo_neg, 144).save(destino / 'forte-saude-logo-negativa.png', optimize=True)
    redimensionar_altura(logo_cor, 144).save(destino / 'forte-saude-logo-cor.png', optimize=True)
    # Símbolo: a marca d'água da área principal chega a 560 px de altura.
    redimensionar_altura(simb_neg, 400).save(destino / 'forte-saude-simbolo-negativo.png', optimize=True)
    redimensionar_altura(simb_cor, 400).save(destino / 'forte-saude-simbolo-cor.png', optimize=True)
    quadrado(simb_cor, 64).save(destino / 'favicon.png', optimize=True)

    for f in sorted(destino.glob('*.png')):
        im = Image.open(f)
        print(f.name, im.size, f'{f.stat().st_size // 1024} KiB')


if __name__ == '__main__':
    main()
