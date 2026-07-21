// Shared admin-password gate used by every admin-only server function
// (members.functions.ts, enrollments.functions.ts). Single source of truth
// so the password can't drift between files.
// ⚠️ TODO: This is a hardcoded shared-secret placeholder. Replace with real
// admin authentication (Supabase Auth + role check) before this handles
// real customer data at scale.
export const ADMIN_PASSWORD = "kidsnook2024";

export function assertAdmin(password: string) {
  if (password !== ADMIN_PASSWORD) throw new Error("Incorrect admin password.");
}
