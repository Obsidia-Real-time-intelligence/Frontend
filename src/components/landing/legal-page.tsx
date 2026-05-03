import { MarketingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <MarketingNav />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:py-20 prose-invert">
        <header className="mb-10 pb-6 border-b border-[var(--color-border)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-6 text-sm text-[var(--color-muted-foreground)] leading-relaxed [&_h2]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-primary [&_a]:hover:underline [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1.5">
          {children}
        </div>
      </article>
      <Footer />
    </div>
  );
}
