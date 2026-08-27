import type { Gift, GiftPriceRange } from "@/types";

/**
 * LISTA DE PRESENTES
 * ---------------------------------------------------------------------------
 * Para adicionar, remover ou mudar valores, edite apenas este arquivo.
 *
 * `paymentUrl`  → LINK DO PAGBANK deste presente. É o campo mais importante:
 *                 é para cá que o botão "Pagar" manda o convidado, e é lá que
 *                 ele escolhe entre cartão, PIX e boleto.
 *
 *                 Como gerar: PagBank → Vender → Link de pagamento → crie um
 *                 link com o valor do presente e cole aqui.
 *
 *                 O MESMO link pode ser usado por vários convidados.
 *                 Se ficar vazio, o modal usa `payments.pagbankLink` como
 *                 reserva e, se também estiver vazio, oferece o PIX.
 * `active`      → false esconde o presente do site.
 * `featured`    → destaca o card na home.
 * `mystery`     → esconde a descrição até o convidado clicar (easter egg).
 */

export const giftsContent = {
  title: "Nossa lista",
  eyebrow: "💍 Presentes",
  intro: [
    "Como estamos iniciando nossa vida do zero, decidimos transformar nossa lista em algumas contribuições.",
    "Você escolhe o motivo/objetivo do presente. Nós prometemos usar o dinheiro com sabedoria.",
  ],
  /** Linha final, em tom de piada */
  disclaimer: "(ou não.)",
};

export const gifts: Gift[] = [
  {
    id: "nao-dei-nada",
    title: "Troco",
    emoji: "💸",
    description:
      "Só para não dizer que não deu nada.",
    value: 80,
    image: "/images/presentes/imagem-julio-cris.webp",
    paymentUrl: "https://pag.ae/826i_FFGa",
    active: true,
  },
  {
    id: "docinho-da-noiva",
    title: "Docinho da Noiva",
    emoji: "🍫",
    description:
      "Uma ajuda para manter a noiva calma e racional por uma semana.",
    value: 100,
    image: "/images/presentes/imagem-chocolate.jpg",
    // ↓ Cole aqui o link do PagBank deste presente. Ex.: "https://pag.ae/7abc123"
    paymentUrl: "https://pag.ae/826j19TnJ",
    active: true,
    featured: true,
  },
  {
    id: "cobertor",
    title: "Cobertor",
    emoji: "🧣",
    description:
      "Cobertor para a noiva estar coberta de razão.",
    value: 120,
    image: "/images/presentes/imagem-gato-de-coberta.jpg",
    paymentUrl: "https://pag.ae/826j1EdYM",
    active: true,
  },
  {
    id: "amigos-para-sempre",
    title: "Amigos para sempre",
    emoji: "🫂",
    description:
      "Cota para sermos amigos para sempre.",
    value: 200,
    image: "/images/presentes/imagem-amigos.jpg",
    paymentUrl: "https://pag.ae/826j28AM5",
    active: true,
  },
  {
    id: "liberar-rpg",
    title: "RPG",
    emoji: "👑",
    description:
    "Cota para liberar o Thiago para jogar RPG de mesa.",
    value: 250,
    image: "/images/presentes/imagem-rpg.jpg",
    paymentUrl: "https://pag.ae/826j2yoem",
    active: true,
  },
  {
    id: "rolo-macarrao",
    title: "Rolo de macarrão",
    emoji: "💁‍♀️",
    description:
      "Para quando a Lari ficar com raiva do Thiago.",
    value: 250,
    image: "/images/presentes/imagem-rolo-macarrao.webp",
    paymentUrl: "https://pag.ae/826j2NHNQ",
    active: true,
  },
  {
    id: "capacete",
    title: "Capacete contra rolo de macarrão",
    emoji: "🪖",
    description:
      "Para o Thiago ter proteção contra a Lari.",
    value: 350,
    image: "/images/presentes/imagem-capacete.jpg",
    paymentUrl: "https://pag.ae/826j34BEq",
    active: true,
  },
  {
    id: "ajuda-condominio",
    title: "Condomínio",
    emoji: "🌆",
    description:
      "Ajuda para pagar o condomínio.",
    value: 400,
    image: "/images/presentes/imagem-barriga-cobrando-aluguel.webp",
    paymentUrl: "https://pag.ae/826j3nY15",
    active: true,
  },
  {
    id: "cota-lua-de-mel",
    title: "Cota da Lua de Mel",
    emoji: "🗼",
    description:
      "Um pedacinho da viagem. Cada cota equivale a mais ou menos uma tarde de preguiça com uma vista linda.",
    value: 500,
    image: "/images/presentes/imagem-lua-de-mel.jpg",
    paymentUrl: "https://pag.ae/826j3KRcR",
    active: true,
    featured: true,
  },
  {
    id: "assinatura-de-streaming-vitalicia",
    title: "Streaming (quase) vitalício",
    emoji: "📺",
    description:
      "Para continuar discutindo o que assistir por muitos e muitos anos de casados.",
    value: 600,
    image: "/images/presentes/imagem-streaming.jpg",
    paymentUrl: "https://pag.ae/826j48N7M",
    active: true,
  },
  {
    id: "ajuda-cartao-noiva",
    title: "Fatura do cartão",
    emoji: "💳",
    description:
      "Ajuda para pagar o gasto da Lari.",
    value: 700,
    image: "/images/presentes/imagem-cartao-credito.jpg",
    paymentUrl: "https://pag.ae/826j4s5Ba",
    active: true,
  },
  {
    id: "ajuda-casamento",
    title: "Ajuda no casamento",
    emoji: "👰‍♀️",
    description:
      "Ajuda para pagar o casamento.",
    value: 800,
    image: "/images/presentes/imagem-casamento.jpg",
    paymentUrl: "https://pag.ae/826j4Jm63",
    active: true,
  },
  {
    id: "supermercado",
    title: "Supermercado",
    emoji: "🛒",
    description:
      "Para pagar a primeira ida ao super mercado.",
    value: 1200,
    image: "/images/presentes/imagem-supermercado.jpg",
    paymentUrl: "https://pag.ae/826j4Z9hQ",
    active: true,
  },
  {
    id: "computador",
    title: "Melhoria setup",
    emoji: "💻",
    description:
      "Cota para ajudar na melhoria do computador do Thiago.",
    value: 2000,
    image: "/images/presentes/imagem-setup.webp",
    paymentUrl: "https://pag.ae/826j5grVq",
    active: true,
  },
  {
    id: "mobilia",
    title: "Mobília",
    emoji: "🛋️",
    description:
      "Ajuda para mobiliar a casa.",
    value: 2500,
    image: "/images/presentes/imagem-mobilia.jpg",
    paymentUrl: "https://pag.ae/826j5wdnM",
    active: true,
  },
  {
    id: "robo-aspirador",
    title: "Robô aspirador",
    emoji: "🤖",
    description:
      "Um robô para nos liberar da limpeza semanal.",
    value: 3500,
    image: "/images/presentes/imagem-robo.jpg",
    paymentUrl: "https://pag.ae/826mFpt4o",
    active: true,
    featured: true,
  },
  {
    id: "lava-louca",
    title: "Lava louças",
    emoji: "🍽️",
    description:
      "Uma lava louças para não acumular pratos na pia.",
    value: 5000,
    image: "/images/presentes/imagem-louca.jpg",
    paymentUrl: "https://pag.ae/826mFPeNM",
    active: true,
    featured: true,
  },
];

// ---------------------------------------------------------------------------
// Filtros por faixa de valor
// ---------------------------------------------------------------------------

export const giftPriceRanges: { id: GiftPriceRange; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "100-500", label: "R$ 100 – R$ 500" },
  { id: "500-1000", label: "R$ 500 – R$ 1000" },
  { id: "1000-mais", label: "R$ 1000+" },
];

export function matchesPriceRange(value: number, range: GiftPriceRange): boolean {
  switch (range) {
    case "100-500":
      return value > 100 && value <= 500;
    case "500-1000":
      return value > 500 && value <= 1000;
    case "1000-mais":
      return value > 1000;
    case "todos":
    default:
      return true;
  }
}

/** Presentes visíveis no site, na ordem em que devem aparecer. */
export function getActiveGifts(): Gift[] {
  return gifts.filter((gift) => gift.active);
}

export function getFeaturedGifts(limit = 3): Gift[] {
  const featured = getActiveGifts().filter((gift) => gift.featured);
  return (featured.length > 0 ? featured : getActiveGifts()).slice(0, limit);
}

export function getGiftById(id: string): Gift | undefined {
  return gifts.find((gift) => gift.id === id);
}
