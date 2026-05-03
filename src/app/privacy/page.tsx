import { LegalPage } from "@/components/landing/legal-page";

export const metadata = {
  title: "Privacy Policy — Obsidia",
  description: "How Obsidia collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="May 3, 2026">
      <p>
        Obsidia ("we", "us") respects your privacy. This policy explains what
        data we collect when you use our platform, how we use it, and your rights
        over it. By using Obsidia you agree to the practices described here.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — your email address, Google profile
          (name, avatar), and any handle you choose. We use Supabase Auth to
          store and manage credentials.
        </li>
        <li>
          <strong>Strategy data</strong> — the strategies you save, backtest
          results, alerts fired, and paper-trade outcomes.
        </li>
        <li>
          <strong>Delivery preferences</strong> — Telegram chat ID, Discord
          webhook URL, and email-alert opt-in setting (only if you provide them).
        </li>
        <li>
          <strong>Usage telemetry</strong> — page views, button clicks, and API
          requests, gathered via privacy-first analytics. We do not use
          third-party advertising trackers.
        </li>
        <li>
          <strong>Payment data</strong> — handled entirely by Stripe; we never
          see or store your card details. We retain your Stripe customer ID and
          subscription status.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To run strategies you save and deliver alerts you've configured.</li>
        <li>To compute leaderboards and marketplace listings (only for strategies you publish).</li>
        <li>To improve the product — aggregated, anonymized usage patterns.</li>
        <li>To send transactional emails (sign-up confirmations, billing receipts) and, only with explicit opt-in, the daily AI brief newsletter.</li>
      </ul>

      <h2>3. Who we share it with</h2>
      <ul>
        <li>
          <strong>Service providers</strong> — Supabase (auth + database),
          Anthropic (AI brief generation), Stripe (payments), Resend (transactional
          email), Vercel (hosting). Each operates under a data processing
          agreement.
        </li>
        <li>
          <strong>Law enforcement</strong> — only when legally compelled. We
          publish a transparency report annually.
        </li>
        <li>
          <strong>We do not sell your data.</strong> Ever.
        </li>
      </ul>

      <h2>4. Your rights</h2>
      <p>
        You can request export, correction, or deletion of your data at any
        time by emailing <a href="mailto:privacy@obsidia.fi">privacy@obsidia.fi</a>.
        We respond within 30 days. Account deletion permanently removes
        strategies, alerts, and trade history; backups expire after 90 days.
      </p>

      <h2>5. Cookies &amp; local storage</h2>
      <p>
        We use first-party cookies for authentication (Supabase session) and
        local storage for UI preferences. We do not set third-party advertising
        cookies. EU/UK users will see a consent banner if telemetry cookies are
        in scope.
      </p>

      <h2>6. Data retention</h2>
      <ul>
        <li>Active accounts: data retained while account is open.</li>
        <li>Closed accounts: deleted within 30 days of closure.</li>
        <li>Backtest results: retained for analytics; anonymized after 12 months.</li>
        <li>Stripe records: retained 7 years for tax/audit compliance.</li>
      </ul>

      <h2>7. International transfers</h2>
      <p>
        Obsidia operates servers in the US and EU. By using the service you
        consent to data being processed in either region under SCCs/GDPR-compliant
        terms.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We'll email registered users at least 14 days before any material
        change takes effect. Minor edits are dated above and announced in
        the changelog.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions: <a href="mailto:privacy@obsidia.fi">privacy@obsidia.fi</a>.
        General contact: <a href="mailto:hello@obsidia.fi">hello@obsidia.fi</a>.
      </p>
    </LegalPage>
  );
}
