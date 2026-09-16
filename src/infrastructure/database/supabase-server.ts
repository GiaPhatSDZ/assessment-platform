import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseAdminConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );
  }

  return cachedClient;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return cachedAdminClient;
}
