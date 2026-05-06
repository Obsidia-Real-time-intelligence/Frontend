import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("account/delete: SUPABASE_SERVICE_ROLE_KEY not set");
    return NextResponse.json(
      { error: "Account deletion is not configured. Contact support." },
      { status: 500 }
    );
  }

  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // FK on profiles.user_id has `on delete cascade`, so deleting the auth user
  // wipes the profile + dependent rows transitively.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("account/delete admin", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
