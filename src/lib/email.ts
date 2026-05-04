import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cached) return cached;

  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const secure =
    (process.env.EMAIL_SERVER_SECURE ?? "true").toLowerCase() !== "false";

  if (!host || !port || !user || !pass) return null;

  cached = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return cached;
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const transport = getTransport();
  const from = process.env.EMAIL_FROM;
  if (!transport || !from) {
    console.warn("Email not sent — SMTP env vars missing");
    return false;
  }
  try {
    await transport.sendMail({ from, ...opts });
    return true;
  } catch (e) {
    console.warn("Email send failed:", e);
    return false;
  }
}

export async function sendWaitlistConfirmation(email: string): Promise<boolean> {
  const tgInvite = process.env.NEXT_PUBLIC_TELEGRAM_INVITE || "";
  const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE || "";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://obsidia-sol.vercel.app";

  const communityHtml =
    tgInvite || discordInvite
      ? `
  <div style="margin: 28px 0; padding: 20px; background: #f7f8fa; border-radius: 8px;">
    <div style="font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px;">
      Join the community while you wait
    </div>
    <p style="font-size: 13px; line-height: 1.5; color: #555; margin: 0 0 14px;">
      Trade ideas, strategy walkthroughs, and early-access drops happen here first.
    </p>
    ${
      tgInvite
        ? `<a href="${tgInvite}" style="display: inline-block; margin: 0 8px 8px 0; padding: 10px 16px; background: #229ED9; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">Join Telegram</a>`
        : ""
    }
    ${
      discordInvite
        ? `<a href="${discordInvite}" style="display: inline-block; margin: 0 8px 8px 0; padding: 10px 16px; background: #5865F2; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">Join Discord</a>`
        : ""
    }
  </div>`
      : "";

  const communityText =
    tgInvite || discordInvite
      ? `\n\n— Join the community while you wait —\n${
          tgInvite ? `Telegram: ${tgInvite}\n` : ""
        }${discordInvite ? `Discord:  ${discordInvite}\n` : ""}`
      : "";

  return send({
    to: email,
    subject: "You're on the Obsidia waitlist 🎉",
    text:
      `Welcome to Obsidia.\n\n` +
      `You're confirmed on the waitlist. We're rolling out access in batches and will email you the moment your seat opens.\n\n` +
      `What you'll unlock when you're in:\n` +
      `  • Bring-your-own strategies with a no-code DSL builder\n` +
      `  • Backtest 24 months of real OHLCV with real fees and slippage\n` +
      `  • Live alerts via Telegram, Discord, and email — with AI rationale\n` +
      `  • A marketplace of audited strategies from top traders\n` +
      `  • One-click paper trading + execution on Drift / Jupiter Perps\n` +
      communityText +
      `\nFollow along: ${appUrl}\n\n— The Obsidia team`,
    html: `<!doctype html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111; background: #fff;">
  <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 12px;">Welcome to Obsidia.</h1>
  <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 20px;">
    You're confirmed on the waitlist. We're rolling out access in batches and
    will email you the moment your seat opens.
  </p>

  <div style="margin: 24px 0; padding: 18px 20px; border: 1px solid #eee; border-radius: 8px;">
    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 10px;">
      What you'll unlock
    </div>
    <ul style="font-size: 14px; line-height: 1.7; color: #333; margin: 0; padding: 0 0 0 18px;">
      <li>Bring-your-own strategies with a no-code DSL builder</li>
      <li>Backtest 24 months of real OHLCV — real fees, real slippage</li>
      <li>Live alerts via Telegram, Discord, and email — with AI rationale</li>
      <li>A marketplace of audited strategies from top traders</li>
      <li>One-click paper trading + execution on Drift / Jupiter Perps</li>
    </ul>
  </div>

  ${communityHtml}

  <p style="font-size: 13px; color: #888; margin: 32px 0 0;">— The Obsidia team</p>
  <p style="font-size: 11px; color: #aaa; margin: 12px 0 0;">
    You're getting this because you joined the waitlist at <a href="${appUrl}" style="color: #888;">obsidia.app</a>. We'll only email you with product updates.
  </p>
</body></html>`,
  });
}

export async function notifyAdminEmail(subject: string, body: string): Promise<boolean> {
  const adminTo = process.env.EMAIL_ADMIN_TO || process.env.EMAIL_FROM;
  if (!adminTo) return false;
  return send({
    to: adminTo,
    subject,
    text: body,
    html: `<pre style="font-family: ui-monospace, SFMono-Regular, monospace; font-size: 13px; white-space: pre-wrap;">${body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre>`,
  });
}
