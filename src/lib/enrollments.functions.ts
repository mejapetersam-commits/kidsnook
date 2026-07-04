import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public data access uses the publishable-key client. The `services` table has
// a public read policy; the `enrollments` table is RLS-locked and is only
// written via the SECURITY DEFINER `app_create_enrollment` wrapper.
function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type Service = { id: string; name: string; description: string | null };

// ---------- Services (dynamic, kept in sync via the DB) ----------
export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await db()
    .from("services")
    .select("id, name, description")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
});

// ---------- Enrollment submission ----------
const opt = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const enrollmentSchema = z.object({
  child_full_name: z.string().trim().min(1).max(160),
  child_dob: z.string().trim().min(1).max(20),
  child_gender: opt(40),
  child_nickname: opt(80),
  parent_full_name: z.string().trim().min(1).max(160),
  parent_relationship: z.string().trim().min(1).max(40),
  parent_phone: z.string().trim().min(1).max(40),
  parent_email: z.string().trim().email().max(255),
  home_address: z.string().trim().min(1).max(500),
  ec1_name: z.string().trim().min(1).max(160),
  ec1_relationship: z.string().trim().min(1).max(80),
  ec1_phone: z.string().trim().min(1).max(40),
  ec2_name: opt(160),
  ec2_relationship: opt(80),
  ec2_phone: opt(40),
  allergies: z.string().trim().min(1).max(1000),
  medications: opt(1000),
  medical_conditions: opt(1000),
  doctor_name: opt(160),
  doctor_phone: opt(40),
  services: z.array(z.string().trim().min(1).max(160)).min(1).max(30),
  preferred_start_date: z.string().trim().min(1).max(20),
  dropoff_time: opt(20),
  consent: z.literal(true),
});

export const createEnrollment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => enrollmentSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await db().rpc("app_create_enrollment", {
      p_data: data as unknown as Record<string, unknown>,
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email confirmation of the enrollment here.
    return { ok: true as const };
  });
