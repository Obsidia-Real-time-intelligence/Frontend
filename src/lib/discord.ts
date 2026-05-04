/**
 * Discord webhook delivery for admin alerts.
 *
 * Env: DISCORD_WEBHOOK_URL (server-only)
 *   Get one from: Discord channel → Edit Channel → Integrations → Webhooks → New Webhook → Copy URL
 */

export async function notifyDiscord(content: string): Promise<boolean> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`Discord non-200 (${res.status}): ${body.slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Discord send failed:", e);
    return false;
  }
}
