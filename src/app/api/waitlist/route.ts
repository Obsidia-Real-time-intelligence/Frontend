import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";
import { notifyDiscord } from "@/lib/discord";
import { sendWaitlistConfirmation, notifyAdminEmail } from "@/lib/email";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const supabase = await createClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: normalized, source: source ?? "landing" });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error("waitlist insert", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    const sourceLabel = source ?? "landing";
    const total = count ?? "?";

    // Fire-and-forget — never block the user response on third-party delivery
    Promise.allSettled([
      sendWaitlistConfirmation(normalized),
      notifyAdminEmail(
        `New waitlist signup: ${normalized}`,
        `Email: ${normalized}\nSource: ${sourceLabel}\nTotal: ${total}`
      ),
      notifyAdmin(
        `🟢 *New waitlist signup*\n` +
          `\`${normalized}\`\n` +
          `_source: ${sourceLabel}_\n` +
          `_total: ${total}_`
      ),
      notifyDiscord(
        `🟢 **New waitlist signup**\n` +
          `\`${normalized}\` · source: ${sourceLabel} · total: ${total}`
      ),
    ]).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("waitlist POST", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });
  return NextResponse.json({ count: count ?? 0 });
}
