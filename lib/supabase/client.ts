"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl, isSupabaseConfigured } from "./config";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Cliente para o navegador (chave anônima + RLS).
 * Retorna null quando o Supabase ainda não foi configurado.
 *
 * Observação: o site não precisa deste cliente para funcionar — RSVP e
 * mensagens passam por Route Handlers no servidor. Ele existe para leituras
 * públicas futuras (ex.: mural de mensagens aprovadas em tempo real).
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;

  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  return browserClient;
}
