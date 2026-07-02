import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ⚠️ TODO: Replace this hardcoded admin password with real authentication
// (e.g. Lovable Cloud auth + an admin role) before going to production.
const ADMIN_PASSWORD = "kidsnook2024";

function assertAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }
}

const parentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  emergency_contact: z.string().trim().max(120).optional().or(z.literal("")),
});

const childSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  dob: z.string().trim().max(20).optional().or(z.literal("")),
  sex: z.string().trim().max(20).optional().or(z.literal("")),
  allergies: z.string().trim().max(500).optional().or(z.literal("")),
});

const registrationSchema = z.object({
  parent: parentSchema,
  child: childSchema,
});

async function createMember(input: z.infer<typeof registrationSchema>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: parent, error: parentErr } = await supabaseAdmin
    .from("parents")
    .insert({
      name: input.parent.name,
      phone: input.parent.phone,
      email: input.parent.email || null,
      emergency_contact: input.parent.emergency_contact || null,
    })
    .select()
    .single();
  if (parentErr || !parent) throw new Error(parentErr?.message || "Failed to save parent");

  const { data: child, error: childErr } = await supabaseAdmin
    .from("children")
    .insert({
      parent_id: parent.id,
      first_name: input.child.first_name,
      last_name: input.child.last_name,
      dob: input.child.dob || null,
      sex: input.child.sex || null,
      allergies: input.child.allergies || null,
    })
    .select()
    .single();
  if (childErr || !child) throw new Error(childErr?.message || "Failed to save child");

  return { parent, child };
}

// ---------- Registration ----------
export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    const { child } = await createMember(data);
    // 📱 TODO: Integrate SMS/email delivery here to send the Membership Number
    // to the parent (e.g. via an SMS gateway or email provider).
    return { membershipNumber: child.membership_number };
  });

// ---------- Member lookup (for existing-member booking) ----------
export const lookupMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ membership_number: z.string().trim().min(1).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: child, error } = await supabaseAdmin
      .from("children")
      .select("id, first_name, last_name, membership_number, parent_id, parents(id, name, phone, email)")
      .eq("membership_number", data.membership_number.toUpperCase())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!child) return { found: false as const };
    const parent = Array.isArray(child.parents) ? child.parents[0] : child.parents;
    return {
      found: true as const,
      child: {
        id: child.id,
        first_name: child.first_name,
        last_name: child.last_name,
        membership_number: child.membership_number,
        parent_id: child.parent_id,
      },
      parent: parent
        ? { id: parent.id, name: parent.name, phone: parent.phone, email: parent.email }
        : null,
    };
  });

const bookingDetailsSchema = z.object({
  service: z.string().trim().min(1).max(120),
  booking_date: z.string().trim().max(20).optional().or(z.literal("")),
  booking_time: z.string().trim().max(20).optional().or(z.literal("")),
  waiver_accepted: z.boolean(),
});

// ---------- Existing member booking ----------
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    bookingDetailsSchema
      .extend({ membership_number: z.string().trim().min(1).max(20) })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!data.waiver_accepted) throw new Error("Indemnity waiver must be accepted");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: child, error: lookupErr } = await supabaseAdmin
      .from("children")
      .select("id, parent_id, membership_number")
      .eq("membership_number", data.membership_number.toUpperCase())
      .maybeSingle();
    if (lookupErr) throw new Error(lookupErr.message);
    if (!child) throw new Error("Membership number not found");

    const { error } = await supabaseAdmin.from("bookings").insert({
      membership_number: child.membership_number,
      child_id: child.id,
      parent_id: child.parent_id,
      service: data.service,
      booking_date: data.booking_date || null,
      booking_time: data.booking_time || null,
      waiver_accepted: data.waiver_accepted,
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email confirmation of the booking here.
    return { ok: true, membershipNumber: child.membership_number };
  });

// ---------- New client: register + book in one step ----------
export const registerAndBook = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    registrationSchema.extend({ booking: bookingDetailsSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!data.booking.waiver_accepted) throw new Error("Indemnity waiver must be accepted");
    const { child, parent } = await createMember({ parent: data.parent, child: data.child });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("bookings").insert({
      membership_number: child.membership_number,
      child_id: child.id,
      parent_id: parent.id,
      service: data.booking.service,
      booking_date: data.booking.booking_date || null,
      booking_time: data.booking.booking_time || null,
      waiver_accepted: data.booking.waiver_accepted,
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email delivery of the Membership Number + booking here.
    return { membershipNumber: child.membership_number };
  });

// ---------- Admin ----------
export const adminGetOverview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [membersCount, bookingsCount, recentRegs, recentBookings] = await Promise.all([
      supabaseAdmin.from("children").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("bookings").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("children")
        .select("id, membership_number, first_name, last_name, created_at, parents(name, phone)")
        .order("created_at", { ascending: false })
        .limit(10),
      supabaseAdmin
        .from("bookings")
        .select("id, membership_number, service, booking_date, booking_time, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      totalMembers: membersCount.count ?? 0,
      totalBookings: bookingsCount.count ?? 0,
      recentRegistrations: (recentRegs.data ?? []).map((r) => {
        const p = Array.isArray(r.parents) ? r.parents[0] : r.parents;
        return {
          id: r.id,
          membership_number: r.membership_number,
          name: `${r.first_name} ${r.last_name}`,
          parent: p?.name ?? "",
          phone: p?.phone ?? "",
          created_at: r.created_at,
        };
      }),
      recentBookings: recentBookings.data ?? [],
    };
  });

export const adminListMembers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("children")
      .select(
        "id, membership_number, first_name, last_name, dob, sex, allergies, created_at, parents(name, phone, email, emergency_contact)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const p = Array.isArray(r.parents) ? r.parents[0] : r.parents;
      return {
        id: r.id,
        membership_number: r.membership_number,
        first_name: r.first_name,
        last_name: r.last_name,
        dob: r.dob,
        sex: r.sex,
        allergies: r.allergies,
        created_at: r.created_at,
        parent_name: p?.name ?? "",
        parent_phone: p?.phone ?? "",
        parent_email: p?.email ?? "",
        emergency_contact: p?.emergency_contact ?? "",
      };
    });
  });

export const adminListBookings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, membership_number, service, booking_date, booking_time, status, waiver_accepted, created_at, children(first_name, last_name), parents(name, phone)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const c = Array.isArray(r.children) ? r.children[0] : r.children;
      const p = Array.isArray(r.parents) ? r.parents[0] : r.parents;
      return {
        id: r.id,
        membership_number: r.membership_number,
        child_name: c ? `${c.first_name} ${c.last_name}` : "",
        parent_name: p?.name ?? "",
        parent_phone: p?.phone ?? "",
        service: r.service,
        booking_date: r.booking_date,
        booking_time: r.booking_time,
        status: r.status,
        waiver_accepted: r.waiver_accepted,
        created_at: r.created_at,
      };
    });
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
