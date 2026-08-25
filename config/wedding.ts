import type { TimelineEvent, WeddingVenue } from "@/types";

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
    tagline: "Uma nova aventura começa aqui.",
  },

  // -------------------------------------------------------------------------
  // Data e hora
  // -------------------------------------------------------------------------
  wedding: {
    /** Formato ISO: AAAA-MM-DD */
    date: "2027-08-21",
    /** Formato 24h: HH:MM */
    time: "16:00",
    timezone: "America/Sao_Paulo",
    /** Mensagem exibida quando a contagem regressiva chega a zero */
    countdownFinishedMessage: "Hoje é o grande dia. Obrigado por celebrar com a gente. ❤️",
  },

  // -------------------------------------------------------------------------
  // Cerimônia
  // -------------------------------------------------------------------------
  ceremony: {
    name: "Capela Nossa Senhora da Glória",
    description:
      "A cerimônia começa pontualmente. Chegue com cerca de 30 minutos de antecedência para encontrar seu lugar com calma.",
    address: "Rua das Acácias, 120 — Centro",
    city: "Florianópolis",
    state: "SC",
    time: "16:00",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Florian%C3%B3polis%2C+SC",
    /** Opcional: URL de embed do Google Maps. Deixe vazio para usar apenas o link. */
    mapsEmbedUrl: "",
    image: "/images/decoracao/imagem-decoracao-1.webp",
  } satisfies WeddingVenue,

  // -------------------------------------------------------------------------
  // Contato
  // -------------------------------------------------------------------------
  contact: {
    /** Somente números, com DDI e DDD. Ex.: 5548999998888 */
    whatsapp: "5548999998888",
    email: "larissaethiago@exemplo.com.br",
  },

  social: {
    instagram: "https://instagram.com/",
    /** Hashtag do casamento (sem #). Deixe vazio para esconder. */
    hashtag: "LarissaEThiago2027",
  },

  // -------------------------------------------------------------------------
  // Pagamentos
  // -------------------------------------------------------------------------
  payments: {
    // --- PIX -----------------------------------------------------------------
    /** Chave PIX (e-mail, CPF, telefone ou aleatória) */
    pixKey: "larissaethiago@exemplo.com.br",
    pixName: "Larissa e Thiago",
    /** Cidade do recebedor — exigida pelo padrão PIX (BR Code) */
    pixCity: "FLORIANOPOLIS",
    /** Texto exibido na aba do PIX */
    pixInstructions:
      "Abra o app do seu banco, escolha PIX → Pagar com chave, cole a chave abaixo e informe o valor do presente. Depois, se quiser, nos manda um print no WhatsApp. 😄",

    // --- Cartão e boleto (Mercado Pago) -------------------------------------
    /**
     * Link de pagamento do Mercado Pago, usado quando o presente não tem um
     * `paymentUrl` próprio em `config/gifts.ts`.
     *
     * Como criar: Mercado Pago → Sua empresa → Link de pagamento → gere um link
     * e cole aqui. O mesmo link pode ser usado por todos os convidados, e o
     * Mercado Pago já oferece cartão de crédito, boleto e PIX na própria página.
     */
    mercadoPagoLink: "",

    /** Texto exibido antes de mandar o convidado para o link de pagamento */
    cardInstructions:
      "Você vai para o ambiente seguro do Mercado Pago e escolhe lá a forma de pagamento: cartão de crédito (com parcelamento), boleto ou PIX. Não passamos perto dos seus dados de pagamento.",

    /**
     * Integração oficial via API (Checkout Pro), criando um checkout por
     * presente. Requer MERCADOPAGO_ACCESS_TOKEN. Deixe false para usar apenas
     * os links de pagamento acima.
     */
    mercadoPagoEnabled: false,
  },

  // -------------------------------------------------------------------------
  // Site / SEO
  // -------------------------------------------------------------------------
  site: {
    title: "Larissa & Thiago",
    description:
      "Estamos nos casando! Aqui você encontra a nossa história, os detalhes do grande dia, a lista de presentes e o formulário de confirmação de presença.",
    /** Sem barra no final. Use o domínio próprio em produção. */
    url: "https://www.larissaethiago.com.br",
    locale: "pt-BR",
  },

  // -------------------------------------------------------------------------
  // Liga/desliga funcionalidades
  // -------------------------------------------------------------------------
  features: {
    gifts: true,
    rsvp: true,
    gallery: true,
    guestMessages: true,
    usefulInfo: true,
    music: false,
    easterEggs: true,
  },

  // -------------------------------------------------------------------------
  // Analytics (não injeta script nenhum enquanto `enabled` for false)
  // -------------------------------------------------------------------------
  analytics: {
    enabled: false,
    googleAnalyticsId: "",
  },

  // -------------------------------------------------------------------------
  // Música ambiente (opcional, nunca inicia sozinha)
  // -------------------------------------------------------------------------
  music: {
    /** Coloque o arquivo em /public e referencie aqui. Ex.: /audio/nossa-musica.mp3 */
    src: "",
    title: "Nossa música",
    defaultVolume: 0.35,
  },

  // -------------------------------------------------------------------------
  // Compartilhamento
  // -------------------------------------------------------------------------
  share: {
    message:
      "Estamos muito felizes em compartilhar nosso grande dia com você! ❤️\n\nConfira todas as informações do nosso casamento:",
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
      "Usamos seus dados apenas para organizar o casamento (lugares, buffet e recados). Não compartilhamos com ninguém e apagamos tudo depois da festa.",
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
  { src: "/images/banner/Morte.PNG", alt: "Larissa e Thiago" },
  // Para alternar entre várias fotos, acrescente linhas aqui:
  // { src: "/images/banner/imagem-banner-2.webp", alt: "Mãos entrelaçadas do casal" },
] as const;

// ---------------------------------------------------------------------------
// Nossa história
// ---------------------------------------------------------------------------
export const storyContent = {
  title: "Nossa história",
  subtitle: "Como duas pessoas que odeiam sair de casa acabaram organizando uma festa.",
  paragraphs: [
    "A gente se conheceu por acidente, num aniversário em que nenhum dos dois queria estar. Uma conversa sobre trilha sonora de videogame virou madrugada, madrugada virou rotina, e a rotina virou a melhor parte do dia.",
    "De lá para cá foram apartamentos pequenos, mudanças de cidade, um gato com problemas de personalidade e uma quantidade preocupante de pizza. Nada disso saiu como planejamos — e ainda assim é exatamente onde a gente queria estar.",
    "Agora queremos dividir o próximo capítulo com as pessoas que fizeram parte de todos os anteriores. Ou seja: você.",
  ],
  images: [
    { src: "/images/casal/imagem-casal-1.webp", alt: "Retrato do casal sorrindo" },
    { src: "/images/casal/imagem-casal-2.webp", alt: "O casal caminhando na praia" },
  ],
};

export const timeline: TimelineEvent[] = [
  {
    year: "2019",
    title: "O primeiro encontro",
    description:
      "Uma festa de aniversário, duas pessoas encostadas na parede fugindo da conversa social e um papo sobre trilhas sonoras que durou até o sol nascer.",
    image: "/images/historia/imagem-historia-1.webp",
  },
  {
    year: "2020",
    title: "A primeira viagem",
    description:
      "Três dias na serra, uma barraca montada errado e a certeza de que dava para conviver com alguém 24 horas por dia sem cometer nenhum crime.",
    image: "/images/historia/imagem-historia-2.webp",
  },
  {
    year: "2022",
    title: "A primeira casa",
    description:
      "Um apartamento minúsculo, móveis montados no chão da sala e a descoberta de que dividir cobertas é uma negociação diária.",
    image: "/images/historia/imagem-historia-3.webp",
  },
  {
    year: "2023",
    title: "O pedido",
    description:
      "Sem drone, sem placa, sem plateia. Só uma cozinha bagunçada, um jantar queimado e um sim antes da pergunta terminar.",
    image: "/images/historia/imagem-historia-4.webp",
  },
  {
    year: "2027",
    title: "O grande dia",
    description:
      "A parte em que a gente assina papéis, chora um pouco e come bem acompanhado de todo mundo que amamos.",
    image: "/images/historia/imagem-historia-5.webp",
  },
];

// ---------------------------------------------------------------------------
// Galeria
// ---------------------------------------------------------------------------
export const galleryImages = [
  { src: "/images/galeria/imagem-galeria-01.webp", alt: "Ensaio do casal ao amanhecer" },
  { src: "/images/galeria/imagem-galeria-02.webp", alt: "Detalhe das alianças" },
  { src: "/images/galeria/imagem-galeria-03.webp", alt: "O casal rindo durante o ensaio" },
  { src: "/images/galeria/imagem-galeria-04.webp", alt: "Passeio de mãos dadas no calçadão" },
  { src: "/images/galeria/imagem-galeria-05.webp", alt: "Pedido de casamento na cozinha" },
  { src: "/images/galeria/imagem-galeria-06.webp", alt: "Viagem à serra em 2020" },
  { src: "/images/galeria/imagem-galeria-07.webp", alt: "Aniversário em família" },
  { src: "/images/galeria/imagem-galeria-08.webp", alt: "O gato do casal dormindo no sofá" },
  { src: "/images/galeria/imagem-galeria-09.webp", alt: "Pôr do sol na praia" },
  { src: "/images/galeria/imagem-galeria-10.webp", alt: "Brinde entre amigos" },
  { src: "/images/galeria/imagem-galeria-11.webp", alt: "Detalhe da decoração escolhida" },
  { src: "/images/galeria/imagem-galeria-12.webp", alt: "Retrato em preto e branco do casal" },
];

// ---------------------------------------------------------------------------
// Informações úteis
// ---------------------------------------------------------------------------
export const usefulInfo = {
  title: "Informações úteis",
  subtitle: "Para você chegar tranquilo e aproveitar sem preocupação.",
  items: [
    {
      icon: "🛏️",
      title: "Hospedagem",
      description:
        "Reservamos condições especiais em hotéis próximos ao local do casamento. Mencione o nome do casal na reserva.",
      details: [
        "Hotel Ilha Verde — 10 min do local — (48) 3333-1111",
        "Pousada Maré Alta — 15 min do local — (48) 3333-2222",
        "Hostel Centro — opção econômica — (48) 3333-3333",
      ],
    },
    {
      icon: "👔",
      title: "Trajes",
      description: "Esporte fino. Nada de gravata obrigatória, nada de chinelo.",
      details: [
        "Elas: vestido midi ou longo. Evite branco e off-white. 🙏",
        "Eles: calça social e camisa. Blazer é bem-vindo, mas opcional.",
        "Vai ter grama e cascalho no caminho — pense duas vezes no salto fino.",
      ],
    },
    {
      icon: "🚗",
      title: "Estacionamento",
      description:
        "Estacionamento gratuito no próprio local, com manobrista a partir das 15h30.",
      details: ["Cerca de 80 vagas no local.", "Chegue com folga: a entrada é por uma via só."],
    },
    {
      icon: "💅",
      title: "Salão e beleza",
      description: "Indicações de quem cuida da gente e conhece o cronograma do dia.",
      details: [
        "Studio Ateliê da Noiva — (48) 3333-4444",
        "Espaço Bem-me-quer — (48) 3333-5555",
      ],
    },
    {
      icon: "🚐",
      title: "Transporte",
      description:
        "Vai haver van saindo do centro para o local às 15h, e retorno ao centro à 1h.",
      details: [
        "Aplicativos funcionam bem na região até por volta das 2h.",
        "Se beber, não dirija. Sério. A gente quer você no próximo aniversário.",
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
    "Precisamos saber quem vem para organizar os lugares e o buffet. Confirme até 30 dias antes do casamento, por favor.",
  successAttending: {
    title: "Obrigado, {nome}! ❤️",
    lines: [
      "Sua presença foi registrada.",
      "Estamos muito felizes em ter você com a gente nesse momento.",
    ],
  },
  successNotAttending: {
    title: "Sentiremos sua falta! ❤️",
    lines: ["Obrigado por nos avisar.", "Fica combinado um encontro depois da festa."],
  },
};

// ---------------------------------------------------------------------------
// Easter eggs (frases sorteadas em cliques discretos)
// ---------------------------------------------------------------------------
export const easterEggPhrases = [
  "Ok, você achou um easter egg. Isso não te dá desconto no presente.",
  "A noiva escolheu a decoração. O noivo escolheu a comida. Todos saíram ganhando.",
  "Sim, vai ter brigadeiro.",
  "O gato não foi convidado. Ele se convidou.",
  "Se você chegou aqui clicando em tudo, a gente gosta de você.",
  "Spoiler: a primeira dança vai ser um desastre lindo.",
];

export type WeddingConfig = typeof weddingConfig;
