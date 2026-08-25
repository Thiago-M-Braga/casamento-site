import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "./config";
import type { Database } from "./types";

/**
 * Clientes server-side. Este arquivo NUNCA deve ser importado por um
 * Client Component (a service role key não pode chegar ao navegador).
 */

/** Cliente público (respeita RLS). Use para leituras públicas no servidor. */
export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cliente administrativo (ignora RLS).
 * Use apenas em Route Handlers/Server Actions para escrever RSVP, mensagens
 * e pagamentos, ou para ler dados no painel `/admin`.
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!isSupabaseAdminConfigured()) return null;

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
