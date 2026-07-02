import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// NOTE: Access control lives in the database (SECURITY DEFINER functions).
// The member/parent/booking tables are fully locked (RLS, no public policies);
// only the vetted RPC functions below can touch them. Admin RPCs verify the
// admin password inside the database.
// ⚠️ TODO: The admin password is currently hardcoded in the database function
// `_admin_password()`. Replace it with real admin authentication/roles later.

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const parentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().max(255).optional().or(z.literal("")),
  emergency_contact: z.string().trim().max(120).optional().or(z.literal("")),
});

const childSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  dob: z.string().trim().max(20).optional().or(z.literal("")),
  sex: z.string().trim().max(20).optional().or(z.literal("")),
  allergies: z.string().trim().max(500).optional().or(z.literal("")),
});

const registrationSchema = z.object({ parent: parentSchema, child: childSchema });

const bookingDetailsSchema = z.object({
  service: z.string().trim().min(1).max(120),
  booking_date: z.string().trim().max(20).optional().or(z.literal("")),
  booking_time: z.string().trim().max(20).optional().or(z.literal("")),
  waiver_accepted: z.boolean(),
});

// ---------- Registration ----------
export const registerMember = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: mnum, error } = await db().rpc("app_register_member", {
      p_parent: data.parent,
      p_child: data.child,
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email delivery here to send the Membership Number.
    return { membershipNumber: mnum as string };
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
  .handler(async ({ data }) => {
    const { data: res, error } = await db().rpc("app_lookup_member", {
      p_mnum: data.membership_number,
    });
    if (error) throw new Error(error.message);
    return res as unknown as LookupResult;
  });

// ---------- Existing member booking ----------
export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    bookingDetailsSchema.extend({ membership_number: z.string().trim().min(1).max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: mnum, error } = await db().rpc("app_create_booking", {
      p_mnum: data.membership_number,
      p_service: data.service,
      p_date: data.booking_date ?? "",
      p_time: data.booking_time ?? "",
      p_waiver: data.waiver_accepted,
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email confirmation of the booking here.
    return { ok: true as const, membershipNumber: mnum as string };
  });

// ---------- New client: register + book ----------
export const registerAndBook = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    registrationSchema.extend({ booking: bookingDetailsSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { data: mnum, error } = await db().rpc("app_register_and_book", {
      p_parent: data.parent,
      p_child: data.child,
      p_service: data.booking.service,
      p_date: data.booking.booking_date ?? "",
      p_time: data.booking.booking_time ?? "",
      p_waiver: data.booking.waiver_accepted,
    });
    if (error) throw new Error(error.message);
    // 📱 TODO: Integrate SMS/email delivery of the Membership Number + booking here.
    return { membershipNumber: mnum as string };
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

export const adminGetOverview = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: res, error } = await db().rpc("app_admin_overview", { p_password: data.password });
    if (error) throw new Error(error.message);
    return res as unknown as AdminOverview;
  });

export const adminListMembers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: res, error } = await db().rpc("app_admin_members", { p_password: data.password });
    if (error) throw new Error(error.message);
    return res as unknown as AdminMember[];
  });

export const adminListBookings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: res, error } = await db().rpc("app_admin_bookings", { p_password: data.password });
    if (error) throw new Error(error.message);
    return res as unknown as AdminBooking[];
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
    const { error } = await db().rpc("app_admin_update_booking", {
      p_password: data.password,
      p_id: data.id,
      p_status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
