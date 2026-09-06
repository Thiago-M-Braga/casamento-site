/**
 * Tipagem mínima das tabelas usadas pelo site.
 * Mantenha em sincronia com `supabase/migrations`.
 *
 * Se preferir gerar automaticamente:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 */

export type GuestRow = {
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

export type GuestInsert = Omit<GuestRow, "id" | "created_at">;

export type GuestMessageRow = {
  id: string;
  created_at: string;
  guest_name: string;
  message: string;
  approved: boolean;
};

export type GuestMessageInsert = Omit<GuestMessageRow, "id" | "created_at" | "approved"> & {
  approved?: boolean;
};

/**
 * LEGADO — a tabela `payments` foi criada na migration 0001 para receber o
 * webhook do Mercado Pago. O site usa links do PagBank, então nada escreve
 * nela hoje. Mantida no banco e aqui apenas para não quebrar histórico; os
 * presentes recebidos vivem em `gift_payments`.
 */
export type PaymentRow = {
  id: string;
  created_at: string;
  updated_at: string;
  gift_id: string | null;
  external_payment_id: string | null;
  payer_name: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
};

export type PaymentInsert = Omit<PaymentRow, "id" | "created_at" | "updated_at">;

export type GiftPaymentRow = {
  id: string;
  created_at: string;
  gift_id: string | null;
  gift_title: string | null;
  amount: number;
  payer_name: string | null;
  anonymous: boolean;
  method: string;
  message: string | null;
  receipt_path: string | null;
  confirmed: boolean;
};

export type GiftPaymentInsert = Omit<GiftPaymentRow, "id" | "created_at" | "confirmed"> & {
  confirmed?: boolean;
};

/**
 * Fotos enviadas pelos próprios convidados no dia do casamento.
 * O arquivo vive no bucket público `fotos-convidados`; aqui fica só o caminho.
 */
export type GuestPhotoRow = {
  id: string;
  created_at: string;
  storage_path: string;
  /** Null quando o convidado preferiu não se identificar. */
  guest_name: string | null;
  caption: string | null;
  /** Visível na galeria pública. */
  approved: boolean;
  width: number | null;
  height: number | null;
  byte_size: number | null;
  mime_type: string | null;
};

export type GuestPhotoInsert = Omit<GuestPhotoRow, "id" | "created_at" | "approved"> & {
  approved?: boolean;
};

export type Database = {
  public: {
    Tables: {
      guests: {
        Row: GuestRow;
        Insert: GuestInsert;
        Update: Partial<GuestInsert>;
        Relationships: [];
      };
      guest_messages: {
        Row: GuestMessageRow;
        Insert: GuestMessageInsert;
        Update: Partial<GuestMessageInsert>;
        Relationships: [];
      };
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: Partial<PaymentInsert>;
        Relationships: [];
      };
      gift_payments: {
        Row: GiftPaymentRow;
        Insert: GiftPaymentInsert;
        Update: Partial<GiftPaymentRow>;
        Relationships: [];
      };
      guest_photos: {
        Row: GuestPhotoRow;
        Insert: GuestPhotoInsert;
        Update: Partial<GuestPhotoRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
