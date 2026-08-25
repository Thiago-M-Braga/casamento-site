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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
