"use client";

import { useRouter } from "next/navigation";
import { StrategyBuilderForm } from "@/components/strategy/strategy-builder-form";
import { useCreateStrategy, useRunBacktest } from "@/lib/api";

export default function StrategyBuilderPage() {
  const router = useRouter();
  const create = useCreateStrategy();
  const runBacktest = useRunBacktest();

  return (
    <StrategyBuilderForm
      mode="create"
      cancelHref="/app/strategies"
      isSaving={create.isPending}
      isBacktesting={runBacktest.isPending}
      onSave={async ({ dsl }) => {
        const created = await create.mutateAsync(dsl);
        router.push(`/app/strategies/${created.id}`);
      }}
      onBacktest={async ({ dsl }) => {
        const result = await runBacktest.mutateAsync({ dsl });
        sessionStorage.setItem("obsidia.lastBacktest", JSON.stringify(result));
        sessionStorage.setItem("obsidia.lastBacktestDsl", JSON.stringify(dsl));
        router.push("/app/strategies/new/results");
      }}
    />
  );
}
