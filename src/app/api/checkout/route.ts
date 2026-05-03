import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Stripe Checkout Session creator (stub).
 *
 * Wire up to Stripe by:
 *   1. npm i stripe
 *   2. Set STRIPE_SECRET_KEY + STRIPE_PRICE_PRO + STRIPE_PRICE_TRADER env vars
 *   3. Replace the redirect below with `stripe.checkout.sessions.create`
 *      and return the session.url for redirection.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const plan = searchParams.get("plan");

  if (!plan || !["pro", "trader", "quant"].includes(plan)) {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(`/api/checkout?plan=${plan}`)}`
    );
  }

  // TODO: Replace with real Stripe Checkout Session creation.
  return NextResponse.redirect(`${origin}/app/settings?upgrade=${plan}`);
}
