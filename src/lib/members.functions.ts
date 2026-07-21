import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth.server";

// All member/parent/booking data now lives in the EXTERNAL Supabase project
// (source of truth). These tables are RLS-locked (no anon policies) exactly as
// before, so every read/write here goes through the server-only service-role
// client. This preserves the previous security posture: the public can never
// touch these tables directly through the Data API — only these vetted server
// functions can, and admin RPCs verify the admin password in app code.
// ⚠️ TODO: The admin password is currently a hardcoded constant (see
// admin-auth.server.ts). Replace it with real admin authentication/roles later.

const opt = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const nn = (v?: string) => (v && v.trim() ? v.trim() : null);

const parentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  email: opt(255),
  emergency_contact: opt(120),
  relationship: opt(80),
  home_address: opt(255),
  emergency_contact_name: opt(120),
  emergency_contact_relationship: opt(80),
  emergency_contact_phone: opt(40),
  emergency_contact_alt_phone: opt(40),
});

const childSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  dob: opt(20),
  sex: opt(20),
  allergies: opt(500),
  medical_conditions: opt(1000),
  doctor_name: opt(120),
  doctor_phone: opt(40),
  service_preferences: opt(200),
  notes: opt(1000),
});

const registrationSchema = z.object({ parent: parentSchema, child: childSchema });

const bookingDetailsSchema = z.object({
  service: z.string().trim().min(1).max(120),
  booking_date: z.string().trim().max(20).optional().or(z.literal("")),
  booking_time: z.string().trim().max(20).optional().or(z.literal("")),
  waiver_accepted: z.boolean(),
});

type ParentInput = z.infer<typeof parentSchema>;
type ChildInput = z.infer<typeof childSchema>;

// Compose the single emergency_contact text column the external `parents`
// table exposes from the richer set of fields collected by the form.
function composeEmergencyContact(p: ParentInput): string | null {
  const parts = [
    p.emergency_contact_name,
    p.emergency_contact_relationship,
    p.emergency_contact_phone,
    p.emergency_contact_alt_phone,
  ]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return nn(p.emergency_contact);
}

async function nextMembershipNumber(
  admin: import("@supabase/supabase-js").SupabaseClient,
): Promise<string> {
  const { count, error } = await admin.from("children").select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  const n = (count ?? 0) + 1;
  return `KN-${String(n).padStart(6, "0")}`;
}

// Creates the child + linked parent rows and returns the membership number.
async function createMemberRecords(parent: ParentInput, child: ChildInput): Promise<string> {
  const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
  const admin = externalSupabaseAdmin();

  const membership_number = await nextMembershipNumber(admin);
  const childId = crypto.randomUUID();

  const { error: childErr } = await admin.from("children").insert({
    id: childId,
    membership_number,
    first_name: child.first_name,
    last_name: child.last_name,
    dob: nn(child.dob),
    sex: nn(child.sex),
    allergies: nn(child.allergies),
  });
  if (childErr) throw new Error(childErr.message);

  const { error: parentErr } = await admin.from("parents").insert({
    id: crypto.randomUUID(),
    child_id: childId,
    name: parent.name,
    phone: parent.phone,
    email: nn(parent.email),
    emergency_contact: composeEmergencyContact(parent),
  });
  if (parentErr) throw new Error(parentErr.message);

  return membership_number;
}

// ---------- Registration ----------
export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    const membershipNumber = await createMemberRecords(data.parent, data.child);
    // 📱 TODO: Integrate SMS/email delivery here to send the Membership Number.
    return { membershipNumber };
  });

// ---------- Member lookup ----------
type LookupResult =
  | { found: false }
  | {
      found: true;
      child: { id: string; first_name: string; last_name: string; membership_number: string };
      parent: { name: string } | null;
    };

export const lookupMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ membership_number: z.string().trim().min(1).max(20) }).parse(data),
  )
  .handler(async ({ data }): Promise<LookupResult> => {
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const admin = externalSupabaseAdmin();

    const { data: child, error } = await admin
      .from("children")
      .select("id, first_name, last_name, membership_number")
      .eq("membership_number", data.membership_number)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!child) return { found: false };

    const { data: parent } = await admin
      .from("parents")
      .select("name")
      .eq("child_id", child.id)
      .maybeSingle();

    return {
      found: true,
      child: {
        id: child.id,
        first_name: child.first_name,
        last_name: child.last_name,
        membership_number: child.membership_number,
      },
      parent: parent ? { name: parent.name } : null,
    };
  });

// ---------- Existing member booking ----------
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    bookingDetailsSchema
      .extend({ membership_number: z.string().trim().min(1).max(20) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const admin = externalSupabaseAdmin();

    const { data: child, error: lookupErr } = await admin
      .from("children")
      .select("id, first_name, last_name, membership_number")
      .eq("membership_number", data.membership_number)
      .maybeSingle();
    if (lookupErr) throw new Error(lookupErr.message);
    if (!child) throw new Error("Membership Number not found.");

    const { data: parent } = await admin
      .from("parents")
      .select("name")
      .eq("child_id", child.id)
      .maybeSingle();

    const { error } = await admin.from("bookings").insert({
      id: crypto.randomUUID(),
      membership_number: child.membership_number,
      child_name: `${child.first_name} ${child.last_name}`.trim(),
      parent_name: parent?.name ?? null,
      service: data.service,
      booking_date: nn(data.booking_date),
      booking_time: nn(data.booking_time),
      waiver_accepted: data.waiver_accepted,
      status: "Pending",
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email confirmation of the booking here.
    return { ok: true as const, membershipNumber: child.membership_number };
  });

// ---------- New client: register + book ----------
export const registerAndBook = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    registrationSchema.extend({ booking: bookingDetailsSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const membershipNumber = await createMemberRecords(data.parent, data.child);

    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const admin = externalSupabaseAdmin();
    const { error } = await admin.from("bookings").insert({
      id: crypto.randomUUID(),
      membership_number: membershipNumber,
      child_name: `${data.child.first_name} ${data.child.last_name}`.trim(),
      parent_name: data.parent.name,
      service: data.booking.service,
      booking_date: nn(data.booking.booking_date),
      booking_time: nn(data.booking.booking_time),
      waiver_accepted: data.booking.waiver_accepted,
      status: "Pending",
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email delivery of the Membership Number + booking here.
    return { membershipNumber };
  });

// ---------- Admin ----------
export type AdminOverview = {
  totalMembers: number;
  totalBookings: number;
  recentRegistrations: {
    id: string;
    membership_number: string;
    name: string;
    parent: string;
    phone: string;
    created_at: string;
  }[];
  recentBookings: {
    id: string;
    membership_number: string;
    service: string;
    booking_date: string | null;
    booking_time: string | null;
    status: string;
    created_at: string;
  }[];
};

export type AdminMember = {
  id: string;
  membership_number: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  sex: string | null;
  allergies: string | null;
  created_at: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  emergency_contact: string;
};

export type AdminBooking = {
  id: string;
  membership_number: string;
  child_name: string;
  parent_name: string;
  parent_phone: string;
  service: string;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
  waiver_accepted: boolean;
  created_at: string;
};

async function loadParentsByChild(
  admin: import("@supabase/supabase-js").SupabaseClient,
  childIds: string[],
) {
  const map = new Map<
    string,
    { name: string; phone: string; email: string; emergency_contact: string }
  >();
  if (!childIds.length) return map;
  const { data } = await admin
    .from("parents")
    .select("child_id, name, phone, email, emergency_contact")
    .in("child_id", childIds);
  for (const p of data ?? []) {
    if (p.child_id) {
      map.set(p.child_id, {
        name: p.name ?? "",
        phone: p.phone ?? "",
        email: p.email ?? "",
        emergency_contact: p.emergency_contact ?? "",
      });
    }
  }
  return map;
}

export const adminGetOverview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }): Promise<AdminOverview> => {
    assertAdmin(data.password);
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const admin = externalSupabaseAdmin();

    const [membersCount, bookingsCount] = await Promise.all([
      admin.from("children").select("*", { count: "exact", head: true }),
      admin.from("bookings").select("*", { count: "exact", head: true }),
    ]);

    const { data: children, error: childErr } = await admin
      .from("children")
      .select("id, membership_number, first_name, last_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (childErr) throw new Error(childErr.message);

    const parents = await loadParentsByChild(
      admin,
      (children ?? []).map((c) => c.id),
    );

    const { data: bookings, error: bkErr } = await admin
      .from("bookings")
      .select("id, membership_number, service, booking_date, booking_time, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (bkErr) throw new Error(bkErr.message);

    return {
      totalMembers: membersCount.count ?? 0,
      totalBookings: bookingsCount.count ?? 0,
      recentRegistrations: (children ?? []).map((c) => {
        const p = parents.get(c.id);
        return {
          id: c.id,
          membership_number: c.membership_number,
          name: `${c.first_name} ${c.last_name}`.trim(),
          parent: p?.name ?? "",
          phone: p?.phone ?? "",
          created_at: c.created_at ?? "",
        };
      }),
      recentBookings: (bookings ?? []).map((b) => ({
        id: b.id,
        membership_number: b.membership_number,
        service: b.service,
        booking_date: b.booking_date,
        booking_time: b.booking_time,
        status: b.status ?? "Pending",
        created_at: b.created_at ?? "",
      })),
    };
  });

export const adminListMembers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }): Promise<AdminMember[]> => {
    assertAdmin(data.password);
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const admin = externalSupabaseAdmin();

    const { data: children, error } = await admin
      .from("children")
      .select("id, membership_number, first_name, last_name, dob, sex, allergies, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const parents = await loadParentsByChild(
      admin,
      (children ?? []).map((c) => c.id),
    );

    return (children ?? []).map((c) => {
      const p = parents.get(c.id);
      return {
        id: c.id,
        membership_number: c.membership_number,
        first_name: c.first_name,
        last_name: c.last_name,
        dob: c.dob,
        sex: c.sex,
        allergies: c.allergies,
        created_at: c.created_at ?? "",
        parent_name: p?.name ?? "",
        parent_phone: p?.phone ?? "",
        parent_email: p?.email ?? "",
        emergency_contact: p?.emergency_contact ?? "",
      };
    });
  });

export const adminListBookings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }): Promise<AdminBooking[]> => {
    assertAdmin(data.password);
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const admin = externalSupabaseAdmin();

    const { data: bookings, error } = await admin
      .from("bookings")
      .select(
        "id, membership_number, child_name, parent_name, service, booking_date, booking_time, status, waiver_accepted, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return (bookings ?? []).map((b) => ({
      id: b.id,
      membership_number: b.membership_number,
      child_name: b.child_name ?? "",
      parent_name: b.parent_name ?? "",
      parent_phone: "",
      service: b.service,
      booking_date: b.booking_date,
      booking_time: b.booking_time,
      status: b.status ?? "Pending",
      waiver_accepted: b.waiver_accepted ?? false,
      created_at: b.created_at ?? "",
    }));
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        password: z.string(),
        id: z.string().uuid(),
        status: z.enum(["Pending", "Confirmed", "Cancelled"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { externalSupabaseAdmin } = await import("@/lib/external-supabase.server");
    const { error } = await externalSupabaseAdmin()
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
