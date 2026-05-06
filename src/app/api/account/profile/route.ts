import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, tg_chat_id, discord_webhook, email_alerts, plan")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("profile GET", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  return NextResponse.json({
    email: user.email,
    display_name: data?.display_name ?? "",
    tg_chat_id: data?.tg_chat_id ?? "",
    discord_webhook: data?.discord_webhook ?? "",
    email_alerts: data?.email_alerts ?? true,
    plan: data?.plan ?? "Free",
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, string | boolean> = {};

  if (typeof body.display_name === "string")
    updates.display_name = body.display_name.trim().slice(0, 80);
  if (typeof body.tg_chat_id === "string")
    updates.tg_chat_id = body.tg_chat_id.trim();
  if (typeof body.discord_webhook === "string") {
    const url = body.discord_webhook.trim();
    if (url && !url.startsWith("https://discord.com/api/webhooks/")) {
      return NextResponse.json(
        { error: "Discord webhook must start with https://discord.com/api/webhooks/" },
        { status: 400 }
      );
    }
    updates.discord_webhook = url;
  }
  if (typeof body.email_alerts === "boolean") updates.email_alerts = body.email_alerts;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, ...updates }, { onConflict: "user_id" });

  if (error) {
    console.error("profile PATCH", error);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
