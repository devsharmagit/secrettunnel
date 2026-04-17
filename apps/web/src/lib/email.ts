import { Resend } from "resend";

const DEFAULT_FROM = "SecretTunnel <onboarding@resend.dev>";

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export async function sendVerificationEmail(input: {
  email: string;
  name?: string | null;
  token: string;
}) {
  const verificationUrl = `${getAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(input.token)}`;
  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.info("Email verification link:", verificationUrl);
      return;
    }

    throw new Error("Email service is not configured.");
  }

  const greeting = input.name?.trim() ? `Hi ${input.name.trim()},` : "Hi,";
  const safeGreeting = escapeHtml(greeting);
  const safeVerificationUrl = escapeHtml(verificationUrl);
  const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM;

  const { error } = await resend.emails.send({
    from,
    to: [input.email],
    subject: "Verify your SecretTunnel email",
    html: `
      <div style="margin:0;padding:0;background:#f6f3ee;font-family:Inter,Arial,sans-serif;color:#211f1d;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ee;margin:0;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e7dfd3;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(39,34,26,0.08);">
                <tr>
                  <td style="padding:28px 28px 22px;border-bottom:1px solid #efe8dd;background:#fffaf2;">
                    <p style="margin:0;color:#b9871e;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">SecretTunnel</p>
                    <h1 style="margin:16px 0 0;color:#211f1d;font-size:28px;line-height:1.2;font-weight:700;">Verify your email</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px;">
                    <p style="margin:0 0 14px;color:#403b36;font-size:16px;line-height:1.6;">${safeGreeting}</p>
                    <p style="margin:0 0 24px;color:#403b36;font-size:16px;line-height:1.6;">Confirm this email address to finish creating your SecretTunnel account.</p>
                    <a href="${safeVerificationUrl}" style="display:inline-block;background:#d4a84b;color:#17130b;text-decoration:none;font-size:15px;font-weight:700;padding:13px 18px;border-radius:8px;">Verify email</a>
                    <div style="margin:28px 0 0;padding:16px;border:1px solid #efe8dd;background:#fbf8f2;border-radius:8px;">
                      <p style="margin:0 0 10px;color:#6e655b;font-size:13px;line-height:1.6;">This link expires in 24 hours. If the button does not work, paste this URL into your browser:</p>
                      <p style="margin:0;color:#8a6a2a;font-size:12px;line-height:1.6;word-break:break-all;">${safeVerificationUrl}</p>
                    </div>
                    <p style="margin:22px 0 0;color:#8b8176;font-size:12px;line-height:1.6;">If you did not create a SecretTunnel account, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
    text: `${greeting}\n\nConfirm this email address to finish creating your SecretTunnel account.\n\nVerify email: ${verificationUrl}\n\nThis link expires in 24 hours.`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
