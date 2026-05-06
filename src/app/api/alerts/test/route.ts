import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTelegram } from "@/lib/telegram";

async function sendDiscordWebhook(url: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tg_chat_id, discord_webhook")
    .eq("user_id", user.id)
    .maybeSingle();

  const tgChatId = profile?.tg_chat_id?.trim();
  const discordUrl = profile?.discord_webhook?.trim();

  if (!tgChatId && !discordUrl) {
    return NextResponse.json(
      { error: "No alert channels configured. Save a Telegram chat ID or Discord webhook first." },
      { status: 400 }
    );
  }

  const message =
    "✅ *Obsidia test alert*\n" +
    "Your alert channel is wired up correctly. " +
    "You'll receive strategy alerts here when your live strategies trigger.";

  const tgPromise = tgChatId ? sendTelegram(tgChatId, message) : Promise.resolve(null);
  const discordPromise = discordUrl
    ? sendDiscordWebhook(discordUrl, message.replace(/\*/g, "**"))
    : Promise.resolve(null);

  const [tgResult, discordResult] = await Promise.all([tgPromise, discordPromise]);

  return NextResponse.json({
    ok: true,
    telegram: tgChatId ? (tgResult ? "sent" : "failed") : "skipped",
    discord: discordUrl ? (discordResult ? "sent" : "failed") : "skipped",
  });
}
