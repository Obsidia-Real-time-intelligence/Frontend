"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/shell/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";
import { Check, Loader2, ArrowLeft } from "lucide-react";

type State = "idle" | "submitting" | "success" | "error";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setError(null);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "waitlist_page" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error || "Something went wrong");
      setState("error");
      return;
    }
    setState("success");
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-xs text-[var(--color-muted-foreground)] hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="flex-1 grid place-items-center px-4 py-16">
        <div className="w-full max-w-md">
          {state === "success" ? <SuccessCard email={email} /> : (
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Get early access.
                </h1>
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  We're rolling out access in batches. Join the waitlist or
                  sign in directly with Google.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-5 shadow-sm">
                <GoogleButton next="/app/dashboard" label="Sign up with Google" />

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                    or
                  </span>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@trader.com"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-[var(--color-danger)]">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={state === "submitting" || !email}
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Join waitlist"
                    )}
                  </Button>
                </form>

                <p className="text-[10px] text-center text-[var(--color-muted-foreground)] leading-relaxed">
                  We'll only email you with product updates. No spam, no daily
                  newsletters until you ask for them.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SuccessCard({ email }: { email: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-card)] p-8 text-center space-y-4 shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
        <Check className="size-6 text-[var(--color-success)]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          You're on the list.
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          We'll email <span className="text-foreground tabular">{email}</span> when
          you're cleared in.
        </p>
      </div>
      <div className="pt-2">
        <Link
          href="/"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-3" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
