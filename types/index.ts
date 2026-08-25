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
  /** Link de pagamento reutilizável (Mercado Pago, PicPay, etc.) */
  paymentUrl?: string;
  active: boolean;
  featured?: boolean;
  /** Presente "misterioso" — esconde o título até o clique (easter egg) */
  mystery?: boolean;
};

export type GiftPriceRange = "todos" | "ate-100" | "100-500" | "500-mais";

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
// Pagamentos
// ---------------------------------------------------------------------------

export type PaymentStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "refunded"
  | "cancelled"
  | "unknown";

export type PaymentRecord = {
  id: string;
  gift_id: string | null;
  external_payment_id: string | null;
  payer_name: string | null;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Respostas de API
// ---------------------------------------------------------------------------

export type ApiResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: never } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type FormState = "idle" | "loading" | "success" | "error";
