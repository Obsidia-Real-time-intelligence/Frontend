// Run from project root: node --env-file=.env.local scripts/test-channels.mjs
// Verifies Telegram + Discord + SMTP independently with full error output.
import nodemailer from "nodemailer";

const fail = (msg) => console.log(`❌ ${msg}`);
const ok = (msg) => console.log(`✅ ${msg}`);

console.log("=== Telegram ===");
{
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token) fail("TELEGRAM_BOT_TOKEN not set");
  else if (!chat) fail("TELEGRAM_CHAT_ID not set");
  else {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat,
            text: "🧪 Channel test from Obsidia",
          }),
        }
      );
      const body = await res.text();
      if (res.ok) ok(`sent (${res.status})`);
      else fail(`${res.status}: ${body}`);
    } catch (e) {
      fail(`exception: ${e.message}`);
    }
  }
}

console.log("\n=== Discord ===");
{
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) fail("DISCORD_WEBHOOK_URL not set");
  else {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "🧪 Channel test from Obsidia" }),
      });
      if (res.ok) ok(`sent (${res.status})`);
      else {
        const body = await res.text();
        fail(`${res.status}: ${body}`);
      }
    } catch (e) {
      fail(`exception: ${e.message}`);
    }
  }
}

console.log("\n=== Email (SMTP) ===");
{
  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM;
  const secure =
    (process.env.EMAIL_SERVER_SECURE ?? "true").toLowerCase() !== "false";
  console.log(
    `host=${host} port=${port} secure=${secure} user=${user} pass.length=${pass?.length} from=${from}`
  );
  if (!host || !port || !user || !pass || !from) fail("missing SMTP env vars");
  else {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    try {
      await transport.verify();
      ok("verify() passed — credentials accepted");
      const info = await transport.sendMail({
        from,
        to: user, // send to yourself to confirm delivery
        subject: "🧪 Obsidia channel test",
        text: "If you see this, SMTP is wired up.",
      });
      ok(`sent — messageId=${info.messageId}`);
    } catch (e) {
      fail(`error: ${e.message}`);
      if (e.response) console.log(`   server said: ${e.response}`);
    }
  }
}

process.exit(0);
