// Sends transactional emails via Resend (https://resend.com). Gracefully
// no-ops (logs a warning, never throws) when RESEND_API_KEY isn't set, so
// registration itself never fails just because email isn't configured yet.
//
// Env vars needed:
//   RESEND_API_KEY — from Resend dashboard → API Keys
//   EMAIL_FROM     — e.g. "KIDS' Nook <noreply@kidsnook.ke>" (domain must be
//                    verified in Resend → Domains first, or sending fails)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function membershipEmailHtml(params: { childName: string; membershipNumber: string }): string {
  const childName = escapeHtml(params.childName);
  const membershipNumber = escapeHtml(params.membershipNumber);
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h1 style="font-size: 22px; margin-bottom: 4px;">Welcome to KIDS' Nook! 🎉</h1>
      <p>Thank you for registering <strong>${childName}</strong> with KIDS' Nook.</p>
      <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <p style="margin: 0; color: #666; font-size: 13px;">Your Membership Number</p>
        <p style="margin: 8px 0 0; font-size: 26px; font-weight: 800; color: #0891b2; letter-spacing: 1px;">${membershipNumber}</p>
      </div>
      <p>Please keep this number handy — you'll need it to book future sessions and activities.</p>
      <p>Our team will be in touch shortly to confirm the next steps.</p>
      <p style="margin-top: 32px; color: #999; font-size: 12px;">KIDS' Nook</p>
    </div>
  `;
}

export async function sendMembershipNumberEmail(params: {
  to: string | null | undefined;
  childName: string;
  membershipNumber: string;
}): Promise<void> {
  const to = params.to?.trim();
  if (!to) return; // parent email is optional on some flows — nothing to send to

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping membership number email");
    return;
  }
  const from = process.env.EMAIL_FROM || "KIDS' Nook <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Welcome to KIDS' Nook — Membership Number ${params.membershipNumber}`,
        html: membershipEmailHtml(params),
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend API error:", res.status, await res.text());
    }
  } catch (err) {
    // Never let an email failure break registration itself.
    console.error("[email] Failed to send membership number email:", err);
  }
}
