import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// All application data now lives in the EXTERNAL Supabase project (source of
// truth). Public reads (services) go through the anon client; writes to the
// RLS-locked `enrollments` table go through the server-only service-role
// client. The managed Lovable Cloud database is no longer used for app data.

export type Service = { id: string; name: string; description: string | null };

// ---------- Services (read from the external `services` table) ----------
export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { externalSupabase } = await import("@/lib/external-supabase.server");
  const { data, error } = await externalSupabase()
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

const nn = (v?: string) => (v && v.trim() ? v.trim() : null);

export const createEnrollment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => enrollmentSchema.parse(data))
  .handler(async ({ data }) => {
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const { error } = await externalSupabaseAdmin()
      .from("enrollments")
      .insert({
        id: crypto.randomUUID(),
        child_full_name: data.child_full_name,
        child_dob: data.child_dob,
        child_gender: nn(data.child_gender),
        child_nickname: nn(data.child_nickname),
        parent_full_name: data.parent_full_name,
        parent_relationship: data.parent_relationship,
        parent_phone: data.parent_phone,
        parent_email: data.parent_email,
        home_address: data.home_address,
        ec1_name: data.ec1_name,
        ec1_relationship: data.ec1_relationship,
        ec1_phone: data.ec1_phone,
        ec2_name: nn(data.ec2_name),
        ec2_relationship: nn(data.ec2_relationship),
        ec2_phone: nn(data.ec2_phone),
        allergies: data.allergies,
        medications: nn(data.medications),
        medical_conditions: nn(data.medical_conditions),
        doctor_name: nn(data.doctor_name),
        doctor_phone: nn(data.doctor_phone),
        services: data.services,
        preferred_start_date: data.preferred_start_date,
        dropoff_time: nn(data.dropoff_time),
        consent: data.consent,
      });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email confirmation of the enrollment here.
    return { ok: true as const };
  });
