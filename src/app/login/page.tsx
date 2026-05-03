import Link from "next/link";
import { Logo } from "@/components/shell/logo";
import { GoogleButton } from "@/components/auth/google-button";
import { ArrowLeft } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
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
        <LoginCard searchParamsP={searchParams} />
      </div>
    </main>
  );
}

async function LoginCard({
  searchParamsP,
}: {
  searchParamsP: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParamsP;
  const next = sp.next ?? "/app/dashboard";

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back.
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Sign in to your Obsidia workspace.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4 shadow-sm">
        <GoogleButton next={next} label="Continue with Google" />

        {sp.error === "oauth_failed" && (
          <p className="text-xs text-[var(--color-danger)] text-center">
            Sign-in failed. Please try again.
          </p>
        )}
      </div>

      <p className="text-xs text-center text-[var(--color-muted-foreground)]">
        Don't have access yet?{" "}
        <Link href="/waitlist" className="text-primary hover:underline">
          Join the waitlist
        </Link>
      </p>
    </div>
  );
}
