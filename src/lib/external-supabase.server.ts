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
import type { Database } from "@/integrations/external-supabase/types";

let _client: SupabaseClient<Database> | undefined;

export function externalSupabase(): SupabaseClient<Database> {
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

let _admin: SupabaseClient<Database> | undefined;

// Service-role client for the EXTERNAL project. Used server-side ONLY for
// privileged app data operations (writes and reads on RLS-locked tables:
// parents, children, bookings, enrollments). This is the external equivalent
// of the previous SECURITY DEFINER wrappers: the tables stay RLS-locked to
// anon/public, and only these vetted server functions can touch them. Never
// import this into client code — the .server.ts suffix keeps it server-only.
export function externalSupabaseAdmin(): SupabaseClient<Database> {
  if (_admin) return _admin;

  const url = process.env.EXTERNAL_SUPABASE_URL;
  const serviceKey = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    const missing = [
      ...(!url ? ["EXTERNAL_SUPABASE_URL"] : []),
      ...(!serviceKey ? ["EXTERNAL_SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    throw new Error(
      `Missing external Supabase secret(s): ${missing.join(", ")}. Add them via Lovable secrets.`,
    );
  }

  _admin = createClient(url, serviceKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}
