# Obsidia — Frontend

The honest backtester for Solana traders. **Real fees. No lookahead. AI co-pilot.**

Marketing site + authenticated app at [obsidia.fi](https://obsidia.fi).

---

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind 4** + shadcn-style primitives
- **Supabase** (auth + Postgres) — direct from browser via RLS
- **Recharts** for equity curves, **TradingView Advanced** widget for charts
- **React Query** for data fetching + cache
- **Inter / JetBrains Mono** typography

## Pages

### Marketing
- `/` — landing
- `/waitlist` — email + Google sign-up
- `/login` — Google OAuth
- `/pricing` — Free / Pro / Trader tiers
- `/privacy`, `/terms`, `/disclaimer` — legal

### Authenticated app (`/app/*`)
- `/app/dashboard` — KPIs + SOL terminal + AI brief + alerts
- `/app/markets` and `/app/markets/[symbol]` — full token view, TV chart
- `/app/strategies` + `/new` + `/[id]` — list + DSL builder + detail
- `/app/strategies/new/results` — backtest results (real, from FastAPI)
- `/app/marketplace` + `/[id]` — subscribe to creator strategies
- `/app/leaderboard` — top strategies + creators
- `/app/alerts` + `/[id]` — live signals + AI brief
- `/app/trades` — paper-trade ledger
- `/app/settings` — profile, alert delivery, billing

## Setup

```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# NEXT_PUBLIC_API_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID
npm run dev
```

Then go to [http://localhost:3000](http://localhost:3000).

## Environment variables

| Var | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon public key |
| `NEXT_PUBLIC_API_URL` | client | FastAPI backtest endpoint base URL |
| `TELEGRAM_BOT_TOKEN` | server only | Bot token for waitlist + alert pings |
| `TELEGRAM_ADMIN_CHAT_ID` | server only | Founder chat ID |
| `STRIPE_SECRET_KEY` | server only | Stripe Checkout |

## Deploy

Vercel:

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_URL
# ... rest of secrets
vercel --prod
```

Add `obsidia.fi` and `www.obsidia.fi` as custom domains. Update Supabase Auth → Redirect URLs to include `https://obsidia.fi/auth/callback`.

## Backend

Backend (FastAPI + workers) lives in a separate repo:
[github.com/Obsidia-Real-time-intelligence/Backend](https://github.com/Obsidia-Real-time-intelligence/Backend)

The frontend calls into it for `/api/backtests`. All other reads/writes go directly to Supabase via RLS.

## License

Open source under MIT. See [LICENSE](LICENSE).
