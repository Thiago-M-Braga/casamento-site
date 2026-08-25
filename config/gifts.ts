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
    "Como já temos quase tudo que precisamos, decidimos transformar nossa lista em pequenas contribuições para a nossa vida de casados.",
    "Você escolhe o motivo. Nós prometemos usar o dinheiro com sabedoria.",
  ],
  /** Linha final, em tom de piada */
  disclaimer: "(ou não.)",
  note:
    "Vocês não precisam nos dar nada. Mas se quiserem financiar nossas decisões questionáveis, fiquem à vontade.",
};

export const gifts: Gift[] = [
  {
    id: "chocolate-da-noiva",
    title: "Chocolate da Noiva",
    emoji: "🍫",
    description:
      "Uma contribuição para manter a noiva alimentada e, consequentemente, o casamento funcionando.",
    value: 100,
    image: "/images/presentes/imagem-presente-chocolate.webp",
    // ↓ Cole aqui o link do PagBank deste presente. Ex.: "https://pag.ae/7abc123"
    paymentUrl: "",
    active: true,
    featured: true,
  },
  {
    id: "rpg-do-noivo",
    title: "RPG do Noivo",
    emoji: "🎲",
    description:
      "Ajude o noivo a jogar RPG na televisão da sala sem ouvir reclamações por pelo menos alguns meses.",
    value: 1000,
    image: "/images/presentes/imagem-presente-rpg.webp",
    paymentUrl: "",
    active: true,
    featured: true,
  },
  {
    id: "cota-lua-de-mel",
    title: "Cota da Lua de Mel",
    emoji: "🌴",
    description:
      "Um pedacinho da viagem. Cada cota equivale a mais ou menos uma tarde de preguiça com vista para o mar.",
    value: 500,
    image: "/images/presentes/imagem-presente-lua-de-mel.webp",
    paymentUrl: "",
    active: true,
    featured: true,
  },
  {
    id: "cafe-que-salva-a-manha",
    title: "Café que salva a manhã",
    emoji: "☕",
    description:
      "Investimento direto na cordialidade matinal do casal. Retorno garantido para todos ao redor.",
    value: 50,
    image: "/images/presentes/imagem-presente-cafe.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "racao-gourmet-do-gato",
    title: "Ração gourmet do gato",
    emoji: "🐈",
    description:
      "Ele não foi convidado para o casamento, mas ainda manda na casa. Melhor não contrariar.",
    value: 80,
    image: "/images/presentes/imagem-presente-gato.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "aula-de-danca-emergencial",
    title: "Aula de dança emergencial",
    emoji: "💃",
    description:
      "Para que a primeira dança seja apenas levemente desastrosa, e não um vídeo viral.",
    value: 250,
    image: "/images/presentes/imagem-presente-danca.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "panela-que-nao-gruda",
    title: "Panela que realmente não gruda",
    emoji: "🍳",
    description:
      "A gente já tentou três. Todas grudam. Essa é a última esperança da nossa cozinha.",
    value: 300,
    image: "/images/presentes/imagem-presente-panela.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "delivery-de-domingo",
    title: "Delivery de domingo",
    emoji: "🍕",
    description:
      "Patrocine o dia em que ninguém quer cozinhar. Ou seja: todo domingo do ano.",
    value: 120,
    image: "/images/presentes/imagem-presente-pizza.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "fundo-de-reforma-eterna",
    title: "Fundo de reforma eterna",
    emoji: "🔧",
    description:
      "Aquela obra que começa com uma tomada solta e termina com a casa toda no chão.",
    value: 800,
    image: "/images/presentes/imagem-presente-reforma.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "plantas-que-vamos-tentar-nao-matar",
    title: "Plantas que vamos tentar não matar",
    emoji: "🪴",
    description:
      "Tentativa número sete. Dessa vez a gente jura que vai regar. Sem promessas.",
    value: 90,
    image: "/images/presentes/imagem-presente-plantas.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "assinatura-de-streaming-vitalicia",
    title: "Streaming (quase) vitalício",
    emoji: "📺",
    description:
      "Para continuar discutindo o que assistir por muitos e muitos anos de casados.",
    value: 200,
    image: "/images/presentes/imagem-presente-streaming.webp",
    paymentUrl: "",
    active: true,
  },
  {
    id: "presente-misterioso",
    title: "Presente misterioso",
    emoji: "🎁",
    description:
      "Nem nós sabemos o que é. Você contribui, e a gente promete contar depois no Instagram.",
    value: 1500,
    paymentUrl: "",
    active: true,
    mystery: true,
  },
];

// ---------------------------------------------------------------------------
// Filtros por faixa de valor
// ---------------------------------------------------------------------------

export const giftPriceRanges: { id: GiftPriceRange; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ate-100", label: "Até R$ 100" },
  { id: "100-500", label: "R$ 100 – R$ 500" },
  { id: "500-mais", label: "R$ 500+" },
];

export function matchesPriceRange(value: number, range: GiftPriceRange): boolean {
  switch (range) {
    case "ate-100":
      return value <= 100;
    case "100-500":
      return value > 100 && value <= 500;
    case "500-mais":
      return value > 500;
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
