// Server-only client for the EXTERNAL Supabase project (source of truth).
//
// This intentionally does NOT use the Lovable Cloud managed backend. The
// Cloud integration files (client.ts, client.server.ts, .env, types.ts) are
// auto-generated and locked to the managed project, so this separate client
// reads the external project's credentials from secrets instead.
//
// Credentials come from secrets (server-only env vars):
//   EXTERNAL_SUPABASE_URL       e.g. https://xxxx.supabase.co
//   EXTERNAL_SUPABASE_ANON_KEY  the project's publishable/anon key (RLS applies)
//
// The .server.ts suffix keeps this out of the client bundle. Read env inside
// the factory so values resolve per-request on the Worker runtime.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | undefined;

export function externalSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.EXTERNAL_SUPABASE_URL;
  const anonKey = process.env.EXTERNAL_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [
      ...(!url ? ["EXTERNAL_SUPABASE_URL"] : []),
      ...(!anonKey ? ["EXTERNAL_SUPABASE_ANON_KEY"] : []),
    ];
    throw new Error(
      `Missing external Supabase secret(s): ${missing.join(", ")}. Add them via Lovable secrets.`,
    );
  }

  _client = createClient(url, anonKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
