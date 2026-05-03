import { LegalPage } from "@/components/landing/legal-page";

export const metadata = {
  title: "Risk Disclosure — Obsidia",
  description: "What you need to understand about the risks of using Obsidia.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Risk Disclosure" lastUpdated="May 3, 2026">
      <p>
        <strong>Read this carefully before trading.</strong> Crypto trading
        involves substantial risk. You can lose money. You can lose all of your
        money. Obsidia is a research and signal platform — it does not protect
        you from losses, and using its signals will not make you profitable.
      </p>

      <h2>What Obsidia is</h2>
      <ul>
        <li>A backtesting engine that runs your strategies against historical data with realistic fees and slippage.</li>
        <li>An alerts engine that notifies you when your saved strategies match the latest bar.</li>
        <li>An AI brief layer that synthesizes market context for each alert.</li>
      </ul>

      <h2>What Obsidia is NOT</h2>
      <ul>
        <li>A broker, exchange, or custodian. We never hold your funds.</li>
        <li>A registered investment advisor or financial planner.</li>
        <li>A guarantee of any outcome.</li>
        <li>An auto-trader (unless you explicitly opt into Drift/Jupiter execution and approve each trade).</li>
      </ul>

      <h2>Past performance ≠ future results</h2>
      <p>
        Every backtest result, leaderboard position, and "verified" strategy is
        based on <em>historical</em> price action. Markets evolve. Liquidity
        changes. Fee schedules change. Strategies that worked for 24 months can
        stop working in month 25 — we've seen this happen to <a href="/blog/24mo-verdict">our own strategies</a>.
      </p>

      <h2>Backtest disclaimers</h2>
      <ul>
        <li>We use real Jupiter Perps fees (0.14% RT) by default. Your actual venue may charge more.</li>
        <li>Slippage is modeled at 0.05% per fill — fast-moving markets exceed this regularly.</li>
        <li>Backtests assume fills at next-bar open. In practice, you may experience adverse fills, partial fills, or no fill.</li>
        <li>We don't model funding rate costs on holds beyond 8 hours yet.</li>
        <li>We don't model exchange outages, maintenance windows, or API rate limits.</li>
      </ul>

      <h2>Marketplace strategies</h2>
      <p>
        Strategies published by other users are not endorsed by Obsidia. The
        <strong> Verified</strong> badge means the strategy passed our
        no-lookahead audit on a fixed historical period — it does not indicate
        future profitability or fitness for any individual trader's risk tolerance.
        Always run your own backtest before subscribing.
      </p>

      <h2>AI brief disclaimers</h2>
      <p>
        Claude-generated briefs are educational synthesis. They can be wrong.
        They can hallucinate. They can miss obvious context. They should be
        treated as a starting point for your own analysis, not as a trade
        recommendation. The confidence score (0-10) reflects the AI's read
        and is not an outcome probability.
      </p>

      <h2>Leverage warning</h2>
      <p>
        Several Obsidia features (sizing config, marketplace strategies,
        execution integrations) support leverage. <strong>Leverage amplifies
        losses, not just gains.</strong> A 10x leveraged trade with a 10% adverse
        move liquidates your position entirely. We've shown this in our
        backtests — see the <a href="/blog/10x-leverage-math">10x leverage math</a> post.
      </p>

      <h2>You are responsible for</h2>
      <ul>
        <li>Understanding the strategies you save and run.</li>
        <li>Sizing positions based on your own risk tolerance.</li>
        <li>Managing your exchange/wallet security.</li>
        <li>Tax compliance in your jurisdiction.</li>
        <li>Not trading with money you can't afford to lose.</li>
      </ul>

      <h2>If you're not sure</h2>
      <p>
        Use paper-trading. Obsidia's free tier includes paper-trading on every
        strategy. Run for 30+ days before committing real capital. If a strategy
        loses money on paper, it'll lose money for real.
      </p>

      <h2>Help is available</h2>
      <p>
        If trading is causing you financial harm or compulsive behavior, please
        contact a problem-gambling support line. In the US:{" "}
        <a href="tel:1-800-522-4700">1-800-522-4700</a> (24/7, free, confidential).
      </p>
    </LegalPage>
  );
}
