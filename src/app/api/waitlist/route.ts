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

    console.log(
      `[waitlist] → fanning out notifications  email=${normalized}  source=${sourceLabel}  total=${total}`
    );

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
    ]).then((results) => {
      const labels = ["welcome-email", "admin-email", "telegram", "discord"];
      const summary = results.map((r, i) => {
        if (r.status === "fulfilled") return `${labels[i]}=${r.value ? "ok" : "skipped/failed"}`;
        return `${labels[i]}=ERROR(${(r.reason as Error)?.message ?? r.reason})`;
      });
      console.log(`[waitlist] ← fanout done: ${summary.join("  ")}`);
    });

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
