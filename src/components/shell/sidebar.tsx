"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CandlestickChart,
  Workflow,
  Store,
  Trophy,
  Bell,
  LineChart,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/markets", label: "Markets", icon: CandlestickChart },
  { href: "/app/strategies", label: "Strategies", icon: Workflow },
  { href: "/app/marketplace", label: "Marketplace", icon: Store },
  { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/app/alerts", label: "Alerts", icon: Bell },
  { href: "/app/trades", label: "Trades", icon: LineChart },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:left-0 z-30 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex h-14 items-center px-5 border-b border-[var(--color-border)]">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--color-card)] text-foreground"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)] hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto h-4 w-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] px-3 py-3">
        <Link
          href="/docs"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:bg-[var(--color-card)]"
        >
          <HelpCircle className="size-3.5" />
          Docs &amp; support
        </Link>
      </div>
    </aside>
  );
}
