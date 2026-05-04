"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityLinks } from "@/components/shell/community-links";
import { createClient } from "@/lib/supabase/client";
import { Bell, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  email?: string | null;
  plan?: "Free" | "Pro" | "Trader" | "Quant";
  unreadAlerts?: number;
}

export function TopBar({
  email = "you@obsidia.fi",
  plan = "Free",
  unreadAlerts = 0,
}: TopBarProps) {
  const router = useRouter();
  const initial = (email ?? "?").charAt(0).toUpperCase();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)]/85 backdrop-blur px-4 md:px-6">
      {/* search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-subtle-foreground)]" />
        <input
          type="text"
          placeholder="Search strategies, symbols, alerts…"
          className="h-8 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] pl-8 pr-3 text-xs text-foreground placeholder:text-[var(--color-subtle-foreground)] focus:border-primary focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <CommunityLinks compact />
        <div className="hidden sm:block w-px h-5 bg-[var(--color-border)] mx-1" />
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-4" />
          {unreadAlerts > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
              {unreadAlerts > 9 ? "9+" : unreadAlerts}
            </span>
          )}
        </Button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
          <Badge variant={plan === "Free" ? "default" : "primary"}>{plan}</Badge>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-elevated)] border border-[var(--color-border)] text-[11px] font-semibold uppercase text-foreground">
              {initial}
            </div>
            <span className="text-xs text-[var(--color-muted-foreground)] max-w-[12ch] truncate">
              {email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={signOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
