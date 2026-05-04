"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StrategyBuilderForm,
  dslToInitial,
} from "@/components/strategy/strategy-builder-form";
import {
  useStrategy,
  useUpdateStrategy,
  useRunBacktest,
} from "@/lib/api";
import type { StrategyDSL } from "@/lib/types";

export default function StrategyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: strategy, isLoading } = useStrategy(id);
  const update = useUpdateStrategy();
  const runBacktest = useRunBacktest();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-[var(--color-muted-foreground)]">
        <Loader2 className="size-4 animate-spin mr-2" />
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Strategy not found.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/app/strategies">
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
      </div>
    );
  }

  const isSystem =
    typeof strategy.dsl_json === "object" &&
    strategy.dsl_json !== null &&
    (strategy.dsl_json as { kind?: string }).kind === "system";

  const initial = dslToInitial(strategy.dsl_json, {
    symbol: strategy.symbol,
    timeframe: strategy.timeframe,
    name: strategy.name,
    description: strategy.description,
  });

  const banner = isSystem ? (
    <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4 flex items-start gap-3">
      <Sparkles className="size-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
      <div>
        <div className="text-sm font-medium text-foreground">
          System strategy — converted for editing
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-1 leading-relaxed">
          This strategy was originally powered by an internal engine. You're
          now editing a DSL representation. Saving will switch the strategy
          to the rule-based engine; running a backtest tests the new rules
          against historical data.
        </p>
      </div>
    </div>
  ) : null;

  return (
    <StrategyBuilderForm
      mode="edit"
      cancelHref={`/app/strategies/${strategy.id}`}
      initial={initial}
      isSaving={update.isPending}
      isBacktesting={runBacktest.isPending}
      banner={banner}
      onSave={async ({ name, description, dsl }) => {
        await update.mutateAsync({
          id: strategy.id,
          name,
          description: description || null,
          dsl: dsl as StrategyDSL,
        });
        router.push(`/app/strategies/${strategy.id}`);
      }}
      onBacktest={async ({ dsl }) => {
        const result = await runBacktest.mutateAsync({
          strategy_id: strategy.id,
          dsl: dsl as StrategyDSL,
        });
        sessionStorage.setItem("obsidia.lastBacktest", JSON.stringify(result));
        sessionStorage.setItem(
          "obsidia.lastBacktestDsl",
          JSON.stringify(dsl)
        );
        router.push("/app/strategies/new/results");
      }}
    />
  );
}
