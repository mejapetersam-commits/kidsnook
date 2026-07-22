import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { externalSupabase } from "@/lib/external-supabase.server";

// Data access against the EXTERNAL Supabase project (source of truth).
// These server functions run on the server, read the external client, and
// return plain DTOs to the app. RLS on the external project applies (anon).

// The tables exposed by the external project's public schema.
const externalTable = z.enum(["bookings", "children", "enrollments", "parents", "services"]);

// Generic read from a known table in the external project's public schema.
export const externalSelect = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z
      .object({
        table: externalTable,
        columns: z.string().trim().max(500).optional(),
        limit: z.number().int().min(1).max(1000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await externalSupabase()
      .from(data.table)
      .select(data.columns ?? "*")
      .limit(data.limit ?? 100);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

// Connectivity check: confirms a given table is reachable and returns its count.
export const externalTableCheck = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ table: externalTable }).parse(data))
  .handler(async ({ data }) => {
    const { count, error } = await externalSupabase()
      .from(data.table)
      .select("*", { count: "exact", head: true });
    if (error) return { table: data.table, ok: false as const, error: error.message };
    return { table: data.table, ok: true as const, count: count ?? 0 };
  });
