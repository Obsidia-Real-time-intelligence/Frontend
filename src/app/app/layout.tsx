import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/topbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Lookup plan badge — falls back to Free
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan = (profile?.plan ?? "Free") as
    | "Free"
    | "Pro"
    | "Trader"
    | "Quant";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Sidebar />
      <div className="md:pl-60">
        <TopBar email={user.email} plan={plan} />
        <main className="px-4 md:px-6 py-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
