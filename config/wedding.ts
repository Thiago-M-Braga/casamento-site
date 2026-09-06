import type {
  GuestPhotoMode,
  GuestPhotosConfig,
  TimelineEvent,
  WeddingVenue,
} from "@/types";

/**
 * CONFIGURAÇÃO CENTRAL DO CASAMENTO
 * ---------------------------------------------------------------------------
 * Tudo que o casal provavelmente vai querer mudar está neste arquivo.
 * Nenhum componente deve ter nomes, datas, endereços ou links fixos no código.
 *
 * ⚠️ NUNCA coloque credenciais aqui (tokens, service role keys, senhas).
 *    Credenciais vão em `.env.local` — veja `.env.example`.
 */
export const weddingConfig = {
  // -------------------------------------------------------------------------
  // O casal
  // -------------------------------------------------------------------------
  couple: {
    bride: "Larissa",
    groom: "Thiago",
    displayName: "Larissa & Thiago",
    /** Usado no monograma do topo e no favicon textual */
    initials: "L & T",
    /** Frase curta que aparece no hero */
    tagline: "Uma nova fase começa aqui.",
  },

  // -------------------------------------------------------------------------
  // Data e hora
  // -------------------------------------------------------------------------
  wedding: {
    /** Formato ISO: AAAA-MM-DD */
    date: "2027-08-21",
    /** Formato 24h: HH:MM */
    time: "09:00",
    timezone: "America/Sao_Paulo",
    /** Mensagem exibida quando a contagem regressiva chega a zero */
    countdownFinishedMessage: "Hoje é o grande dia! Obrigado por celebrar com a gente. ❤️",
  },

  // -------------------------------------------------------------------------
  // Cerimônia
  // -------------------------------------------------------------------------
  ceremony: {
    name: "Restaurante Pedra Branca",
    description:
      "A cerimônia e a recepção acontecem no mesmo endereço. Chegue com cerca de 30 minutos de antecedência: às 9h em ponto as portas se fecham.",
    address: "R. Padre Aluísio Boeing, 1727, Jaraguá do Sul, SC",
    city: "Jaraguá do Sul",
    state: "SC",
    time: "09:00",
    mapsUrl: "https://maps.app.goo.gl/NzbC6a2BvCVkUoqSA",
    /** Opcional: URL de embed do Google Maps. Deixe vazio para usar apenas o link. */
    mapsEmbedUrl: "",
    image: "/images/decoracao/pedra-branca-icon.jpg",
  } satisfies WeddingVenue,

  // -------------------------------------------------------------------------
  // Contato
  // -------------------------------------------------------------------------
  contact: {
    /** Somente números, com DDI e DDD. Ex.: 5548999998888 */
    whatsapp: "5547999155588",
    email: "larissaethiago@gmail.com",
  },

  social: {
    /**
     * Hashtag do casamento, SEM o "#". Deixe vazio para esconder.
     * Evite "&" e acentos: o Instagram corta a hashtag no primeiro símbolo.
     */
    hashtag: "LariEBraga2027",
  },

  // -------------------------------------------------------------------------
  // Pagamentos
  // -------------------------------------------------------------------------
  payments: {
    // --- PIX -----------------------------------------------------------------
    /**
     * Chave PIX (e-mail, CPF, telefone ou aleatória).
     * ⚠️ AINDA É UM EXEMPLO — troque pela chave real antes de divulgar o site,
     * senão o QR Code aponta para uma chave que não existe.
     */
    pixKey: "larissaethiago21@gmail.com",
    pixName: "Thiago",
    /** Cidade do recebedor — exigida pelo padrão PIX (BR Code), sem acento */
    pixCity: "JARAGUA DO SUL",
    /** Texto exibido na aba do PIX */
    pixInstructions:
      "Abra o app do seu banco, escolha PIX → Pagar com chave, cole a chave acima e informe o valor. 😄",

    /** Deixe false para esconder a opção de PIX direto e usar só o PagBank. */
    pixEnabled: true,

    // --- PagBank -------------------------------------------------------------
    /**
     * Cada presente tem o SEU link do PagBank, em `config/gifts.ts` →
     * `paymentUrl`. É lá que você cola os links.
     *
     * Como criar: PagBank → Vender → Link de pagamento → crie um link com o
     * valor do presente. O convidado escolhe a forma de pagamento (cartão com
     * parcelamento, PIX ou boleto) dentro da página do PagBank.
     *
     * O mesmo link serve para vários convidados — não crie um link por pessoa.
     */
    pagbankName: "PagBank",

    /**
     * Link usado na "contribuição livre" (valor à escolha do convidado) e como
     * reserva para presentes que ainda não têm link próprio.
     */
    pagbankLink: "",

    /** Texto exibido antes de mandar o convidado para o link de pagamento */
    pagbankInstructions:
      "Você será levado ao ambiente seguro do PagBank, onde escolhe como pagar: cartão de crédito (com parcelamento), PIX ou boleto. Seus dados de pagamento não passam pelo nosso site.",
  },

  // -------------------------------------------------------------------------
  // Site / SEO
  // -------------------------------------------------------------------------
  site: {
    title: "Larissa & Thiago",
    description:
      "Estamos nos casando! Aqui você encontra os detalhes do grande dia, a lista de presentes e o formulário de confirmação de presença.",
    /** Sem barra no final. Use o domínio próprio em produção. */
    url: "https://casamento-thiago-e-lari.vercel.app",
    locale: "pt-BR",
  },

  // -------------------------------------------------------------------------
  // Liga/desliga funcionalidades
  // -------------------------------------------------------------------------
  features: {
    gifts: true,
    rsvp: true,
    gallery: true,
    /** Envio de fotos pelos convidados no dia do casamento (veja `guestPhotos`). */
    guestPhotos: true,
    guestMessages: true,
    usefulInfo: true,
    music: false,
    easterEggs: true,
  },

  // -------------------------------------------------------------------------
  // Fotos dos convidados — o "álbum coletivo" do dia
  //
  // No dia do casamento a página /galeria libera um botão para os convidados
  // enviarem as fotos que tiraram. Elas entram na mesma galeria, junto com as
  // fotos do casal, e ficam salvas no Supabase (tabela `guest_photos` + bucket
  // `fotos-convidados`).
  //
  // ⚠️ Precisa da migration `supabase/migrations/0004_guest_photos.sql`
  //    aplicada no banco. Sem ela, o envio responde erro.
  // -------------------------------------------------------------------------
  guestPhotos: {
    /**
     * Quando o envio fica disponível:
     *  - "auto"    → abre e fecha sozinho, pelas regras de data abaixo.
     *                Use esta opção no dia a dia.
     *  - "aberto"  → força aberto agora (útil para TESTAR antes do casamento).
     *  - "fechado" → força fechado, sem mexer nas datas.
     *
     * O `as GuestPhotoMode` existe porque este arquivo é `as const`: sem ele, o
     * TypeScript trataria o valor como "auto para sempre" e acusaria erro em
     * quem compara com as outras opções.
     */
    mode: "aberto" as GuestPhotoMode,

    /**
     * Hora do dia do casamento em que o envio abre (fuso de `wedding.timezone`).
     * 0 = meia-noite do próprio dia. Use 6 para abrir só de manhã, por exemplo.
     */
    opensAtHour: 0,

    /**
     * Quantos dias depois do casamento o envio continua aberto. O fechamento
     * acontece no fim do último dia. 7 = uma semana para todos mandarem as
     * fotos com calma (muita gente só lembra no dia seguinte).
     */
    closesDaysAfter: 7,

    /** Quantas fotos o convidado pode selecionar de uma vez. */
    maxPerUpload: 10,

    /**
     * true  → a foto só aparece na galeria depois do casal aprovar no painel.
     * false → aparece na hora (o painel continua podendo esconder/excluir).
     *
     * Deixamos false de propósito: a graça é ver o álbum crescer durante a
     * festa. Se preferir revisar antes, troque para true.
     */
    requireApproval: false,
  } satisfies GuestPhotosConfig,

  // -------------------------------------------------------------------------
  // Analytics (não injeta script nenhum enquanto `enabled` for false)
  // -------------------------------------------------------------------------
  analytics: {
    enabled: false,
    googleAnalyticsId: "",
  },

  // -------------------------------------------------------------------------
  // Compartilhamento
  // -------------------------------------------------------------------------
  share: {
    message:
      "Estamos muito felizes em compartilhar o nosso grande dia com você! ❤️\n\nConfira todas as informações do casamento:",
  },

  // -------------------------------------------------------------------------
  // Painel do casal
  // -------------------------------------------------------------------------
  admin: {
    /**
     * Código da URL do painel: /adm/<secretPath>
     *
     * Trocar esse código muda o endereço do painel. Ele funciona como uma
     * primeira barreira ("quem não sabe o endereço não chega"), mas NÃO é
     * segurança suficiente sozinho — a página também pede a senha de
     * ADMIN_PASSWORD, porque ali ficam nomes, telefones e comprovantes dos
     * convidados.
     */
    secretPath: "2329",
  },

  // -------------------------------------------------------------------------
  // Privacidade (exibida nos formulários)
  // -------------------------------------------------------------------------
  privacy: {
    notice:
      "Usamos seus dados apenas para organizar o casamento (lugares, café e recados). Não compartilhamos com ninguém e apagamos tudo depois da festa.",
  },
} as const;

// ---------------------------------------------------------------------------
// Hero — imagens de fundo. Com mais de uma, o hero alterna entre elas.
//
// O `src` precisa bater EXATAMENTE com o arquivo em /public, incluindo
// maiúsculas e a extensão (a Vercel diferencia maiúsculas de minúsculas).
// Não repita o mesmo `src` em duas linhas: cada foto precisa ser única.
// ---------------------------------------------------------------------------
export const heroImages = [
  { src: "/images/banner/escada-jardim-botanico.jpeg", alt: "Larissa e Thiago" },
  // Para alternar entre várias fotos, acrescente linhas aqui:
  // { src: "/images/banner/imagem-banner-2.webp", alt: "Mãos entrelaçadas do casal" },
] as const;

// ---------------------------------------------------------------------------
// Nossa história
// ---------------------------------------------------------------------------
export const storyContent = {
  title: "Nossa história",
  subtitle: "Como duas pessoas teimosas finalmente concordaram em algo.",
  paragraphs: [
    "A gente se conheceu por acaso. Foram algumas conversas soltas que, em poucos dias, já tinham virado rotina — e deixaram claro que ali existia uma conexão diferente. Até que veio a pergunta dela, sem rodeios: “afinal, o que somos e no que isso vai dar?”. A resposta foi a mais sincera possível: um sim, com a certeza de que não haveria arrependimento.",
    "De lá para cá foram muitas apresentações de dança, amizades novas e viagens que a gente vai contar pelo resto da vida. Nada disso estava no planejamento — e é justamente por isso que deu tão certo.",
    "Agora queremos dividir o próximo capítulo com as pessoas que estiveram em todos os anteriores. Ou seja: você.",
  ],
  images: [
    { src: "/images/casal/beijo-mao.jpeg", alt: "Thiago beijando a mão de Larissa" },
    {
      src: "/images/casal/estatua-jardim-botanico.jpeg",
      alt: "Larissa e Thiago no Jardim Botânico",
    },
  ],
};

// ---------------------------------------------------------------------------
// Galeria
// ---------------------------------------------------------------------------
/**
 * Cada foto precisa de um `src` ÚNICO e de um `alt` que descreva a imagem de
 * verdade (é o que leitores de tela leem em voz alta).
 *
 * Para acrescentar fotos: coloque o arquivo em /public/images/galeria e crie
 * uma linha aqui. Repetir o mesmo `src` quebra a navegação do visualizador.
 */
export const galleryImages = [
  { src: "/images/galeria/beijo-mao.jpeg", alt: "Thiago beijando a mão de Larissa" },
  {
    src: "/images/casal/estatua-jardim-botanico.jpeg",
    alt: "Larissa e Thiago em frente à estátua do Jardim Botânico",
  },
  {
    src: "/images/banner/escada-jardim-botanico.jpeg",
    alt: "O casal na escadaria do Jardim Botânico",
  },
];

// ---------------------------------------------------------------------------
// Informações úteis
// ---------------------------------------------------------------------------
export const usefulInfo = {
  title: "Informações úteis",
  subtitle: "Alguns detalhes para você chegar tranquilo e aproveitar com a gente.",
  items: [
    {
      icon: "⏰",
      title: "Horários",
      description: "Este é o ponto mais importante: a cerimônia começa às 9h em ponto.",
      details: [
        "Chegue entre 8h15 e 8h45 para escolher seu lugar com calma.",
        "Às 9h as portas se fecham e não será possível entrar. É o nosso único pedido inflexível.",
        "A celebração se encerra por volta do meio-dia.",
      ],
    },
    {
      icon: "🚗",
      title: "Estacionamento",
      description: "Estacionamento gratuito no próprio local.",
      details: [
        "São cerca de 50 vagas, suficientes para todos os convidados.",
        "A entrada é por uma via única, então reserve alguns minutos extras na chegada.",
        "Terá pessoas auxiliando no estacionamento.",
      ],
    },
    {
      icon: "👔",
      title: "Trajes",
      description: "Esporte fino — sem necessidade de gravata, mas também sem chinelo.",
      details: [
        "Elas: evite branco e off-white (esses são da noiva), verde escuro, terracota ou laranja.",
        "Eles: evite bordô.",
        "Fora dessas cores, fique à vontade: o importante é você estar confortável.",
      ],
    },
    {
      icon: "💍",
      title: "Sobre a celebração",
      description: "Combinados que ajudam a manter o dia leve para todos.",
      details: [
        "A cerimônia e a recepção acontecem no mesmo endereço — você não precisa se deslocar.",
        "Os lugares são contados um a um, logo convidado não convida.",
        "Deixe o celular no silencioso durante a cerimônia.",
        "Evite circular ou entrar no caminho dos fotógrafos: pode estragar os registros.",
        "Preste atenção na cerimônia.",
      ],
    },
    {
      icon: "☕",
      title: "Comes e bebes",
      description: "Vamos servir um café colonial completo, do doce ao salgado.",
      details: [
        "Sirva-se com empatia.",
        "Não haverá bebida alcoólica no evento.",
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Textos das telas de RSVP
// ---------------------------------------------------------------------------
export const rsvpContent = {
  title: "Confirmação de presença",
  subtitle:
    "Precisamos saber quem vem para organizar os lugares e o café. Confirme até 30 dias antes do casamento, por favor.",
  successAttending: {
    title: "Obrigado, {nome}! ❤️",
    lines: [
      "Sua presença está confirmada.",
      "Estamos muito felizes em ter você com a gente nesse dia.",
    ],
  },
  successNotAttending: {
    title: "Vamos sentir sua falta! ❤️",
    lines: [
      "Obrigado por nos avisar com antecedência.",
      "Fica combinado um encontro depois da festa.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Easter eggs (frases sorteadas em cliques discretos)
// ---------------------------------------------------------------------------
export const easterEggPhrases = [
  "Ok, você achou um easter egg. Isso não te dá desconto no presente.",
  "A noiva escolheu a decoração. O noivo escolheu a comida. Todos saíram ganhando.",
  "Sim, vai ter docinho.",
  "Se você chegou aqui clicando em tudo, a gente gosta de você.",
  "Spoiler: a primeira dança vai ser um desastre lindo.",
];

export type WeddingConfig = typeof weddingConfig;
