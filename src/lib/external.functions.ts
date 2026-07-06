import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Data access against the EXTERNAL Supabase project (source of truth).
// These server functions run on the server, read the external client, and
// return plain DTOs to the app. RLS on the external project applies (anon).

// Generic read from any table in the external project's public schema.
export const externalSelect = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        table: z.string().trim().min(1).max(120),
        columns: z.string().trim().max(500).optional(),
        limit: z.number().int().min(1).max(1000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { externalSupabase } = await import("@/lib/external-supabase.server");
    const query = externalSupabase()
      .from(data.table)
      .select(data.columns ?? "*")
      .limit(data.limit ?? 100);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

// Connectivity check: confirms a given table is reachable and returns its count.
export const externalTableCheck = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ table: z.string().trim().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { externalSupabase } = await import("@/lib/external-supabase.server");
    const { count, error } = await externalSupabase()
      .from(data.table)
      .select("*", { count: "exact", head: true });
    if (error) return { table: data.table, ok: false as const, error: error.message };
    return { table: data.table, ok: true as const, count: count ?? 0 };
  });
