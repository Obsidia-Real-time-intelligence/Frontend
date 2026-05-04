/**
 * Server-side Telegram delivery for Next.js route handlers.
 * Mirrors src/services/telegram.py — kept here to avoid a python round-trip
 * for simple notifications like waitlist signup.
 *
 * Env: TELEGRAM_BOT_TOKEN (server-only, NOT NEXT_PUBLIC_)
 *      TELEGRAM_ADMIN_CHAT_ID (server-only)
 */

const API_BASE = "https://api.telegram.org";

export async function sendTelegram(
  chatId: string,
  text: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`Telegram non-200 (${res.status}): ${body.slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Telegram send failed:", e);
    return false;
  }
}

export async function notifyAdmin(text: string): Promise<boolean> {
  const chatId =
    process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chatId) return false;
  return sendTelegram(chatId, text);
}
