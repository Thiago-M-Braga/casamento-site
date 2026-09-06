/** Tipos compartilhados do projeto. */

// ---------------------------------------------------------------------------
// Presentes
// ---------------------------------------------------------------------------

export type Gift = {
  id: string;
  title: string;
  /** Emoji exibido no card quando não há imagem (ou junto dela) */
  emoji?: string;
  description: string;
  /** Valor em reais (número, não string) */
  value: number;
  image?: string;
  /**
   * Link do PagBank deste presente (reutilizável por vários convidados).
   * O convidado escolhe cartão, PIX ou boleto dentro da página do PagBank.
   */
  paymentUrl?: string;
  active: boolean;
  featured?: boolean;
  /** Presente "misterioso" — esconde o título até o clique (easter egg) */
  mystery?: boolean;
};

export type GiftPriceRange = "todos" | "80-100" | "100-500" | "500-1000" | "1000-mais";

// ---------------------------------------------------------------------------
// Presentes recebidos (avisos de pagamento enviados pelos convidados)
// ---------------------------------------------------------------------------

/** Como o convidado disse que pagou. */
export type GiftPaymentMethod = "link" | "pix" | "outro";

export type GiftPaymentInput = {
  giftId: string | null;
  /** Vazio quando o convidado escolhe ficar anônimo */
  payerName: string;
  anonymous: boolean;
  method: GiftPaymentMethod;
  message?: string;
};

export type GiftPaymentRecord = {
  id: string;
  created_at: string;
  gift_id: string | null;
  gift_title: string | null;
  amount: number;
  payer_name: string | null;
  anonymous: boolean;
  method: GiftPaymentMethod;
  message: string | null;
  /** Caminho do comprovante no Storage. Null quando não foi anexado. */
  receipt_path: string | null;
  /** O casal marcou como conferido */
  confirmed: boolean;
};

// ---------------------------------------------------------------------------
// História
// ---------------------------------------------------------------------------

export type TimelineEvent = {
  year: string;
  title: string;
  description: string;
  image?: string;
};

// ---------------------------------------------------------------------------
// Galeria
// ---------------------------------------------------------------------------

/** Uma foto exibida na galeria, venha ela do casal ou de um convidado. */
export type GalleryPhoto = {
  src: string;
  alt: string;
  /** Nome de quem enviou. Preenchido só nas fotos dos convidados. */
  credit?: string;
};

// ---------------------------------------------------------------------------
// Fotos enviadas pelos convidados
// ---------------------------------------------------------------------------

/** Como o envio de fotos é liberado. Veja `weddingConfig.guestPhotos.mode`. */
export type GuestPhotoMode = "auto" | "aberto" | "fechado";

export type GuestPhotosConfig = {
  mode: GuestPhotoMode;
  /** Hora do dia do casamento em que o envio abre (0–23). */
  opensAtHour: number;
  /** Dias após o casamento em que o envio fecha. */
  closesDaysAfter: number;
  /** Máximo de fotos por envio. */
  maxPerUpload: number;
  /** Exige aprovação do casal antes de a foto aparecer na galeria. */
  requireApproval: boolean;
};

/** Estado do envio de fotos no momento da renderização. */
export type GuestPhotoWindowState =
  /** Funcionalidade desligada em `features.guestPhotos`. */
  | "desligado"
  /** Ainda não chegou o dia. */
  | "antes"
  /** Pode enviar agora. */
  | "aberto"
  /** O prazo passou. */
  | "encerrado";

export type GuestPhotoWindow = {
  state: GuestPhotoWindowState;
  /** Instante (ms) de abertura. Null quando o estado foi forçado na config. */
  opensAt: number | null;
  /** Instante (ms) de fechamento. Null quando o estado foi forçado na config. */
  closesAt: number | null;
};

/** Registro de uma foto de convidado, como vem do banco. */
export type GuestPhoto = {
  id: string;
  created_at: string;
  /** Caminho do arquivo no bucket `fotos-convidados`. */
  storage_path: string;
  /** Null quando o convidado preferiu não se identificar. */
  guest_name: string | null;
  caption: string | null;
  approved: boolean;
};

/** Foto de convidado já pronta para o painel do casal (com URL montada). */
export type AdminGuestPhoto = {
  id: string;
  url: string;
  storagePath: string;
  guestName: string | null;
  caption: string | null;
  createdAt: string;
  approved: boolean;
};

// ---------------------------------------------------------------------------
// Locais
// ---------------------------------------------------------------------------

export type WeddingVenue = {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  time: string;
  mapsUrl: string;
  /** URL de embed do Google Maps (iframe). Opcional. */
  mapsEmbedUrl?: string;
  image?: string;
};

// ---------------------------------------------------------------------------
// RSVP
// ---------------------------------------------------------------------------

export type RsvpInput = {
  name: string;
  attending: boolean;
  adults: number;
  children: number;
  companions?: string;
  childrenNames?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

export type Guest = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  attending: boolean;
  adults: number;
  children: number;
  companions: string | null;
  children_names: string | null;
  notes: string | null;
};

// ---------------------------------------------------------------------------
// Mensagens dos convidados
// ---------------------------------------------------------------------------

export type GuestMessageInput = {
  guestName: string;
  message: string;
};

export type GuestMessage = {
  id: string;
  created_at: string;
  guest_name: string;
  message: string;
  approved: boolean;
};

// ---------------------------------------------------------------------------
// Respostas de API
// ---------------------------------------------------------------------------

export type ApiResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: never } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type FormState = "idle" | "loading" | "success" | "error";
