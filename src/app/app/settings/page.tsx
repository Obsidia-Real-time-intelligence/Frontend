"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Section, FormRow } from "@/components/strategy/section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ProfileResponse = {
  email: string;
  display_name: string;
  tg_chat_id: string;
  discord_webhook: string;
  email_alerts: boolean;
  plan: string;
};

type Status = { kind: "idle" | "saving" | "ok" | "err"; msg?: string };

const idle: Status = { kind: "idle" };

export default function SettingsPage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Free");
  const [name, setName] = useState("");
  const [tg, setTg] = useState("");
  const [discord, setDiscord] = useState("");

  const [profileStatus, setProfileStatus] = useState<Status>(idle);
  const [channelsStatus, setChannelsStatus] = useState<Status>(idle);
  const [testStatus, setTestStatus] = useState<Status>(idle);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ProfileResponse) => {
        setEmail(data.email ?? "");
        setPlan(data.plan ?? "Free");
        setName(data.display_name ?? "");
        setTg(data.tg_chat_id ?? "");
        setDiscord(data.discord_webhook ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function patchProfile(
    body: Record<string, string | boolean>,
    setStatus: (s: Status) => void
  ) {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "err", msg: data.error ?? "Save failed" });
        return;
      }
      setStatus({ kind: "ok", msg: "Saved" });
      setTimeout(() => setStatus(idle), 2500);
    } catch (e) {
      setStatus({ kind: "err", msg: (e as Error).message });
    }
  }

  async function sendTest() {
    setTestStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/alerts/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTestStatus({ kind: "err", msg: data.error ?? "Test failed" });
        return;
      }
      const parts: string[] = [];
      if (data.telegram && data.telegram !== "skipped")
        parts.push(`telegram=${data.telegram}`);
      if (data.discord && data.discord !== "skipped")
        parts.push(`discord=${data.discord}`);
      setTestStatus({
        kind: "ok",
        msg: parts.length ? `Sent (${parts.join(", ")})` : "Sent",
      });
      setTimeout(() => setTestStatus(idle), 4000);
    } catch (e) {
      setTestStatus({ kind: "err", msg: (e as Error).message });
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "Permanently delete your account, all strategies, alerts, and trades? This cannot be undone."
    );
    if (!confirmed) return;
    const typed = window.prompt('Type "DELETE" to confirm.');
    if (typed !== "DELETE") return;

    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Delete failed");
        setDeleting(false);
        return;
      }
      router.push("/");
    } catch (e) {
      alert((e as Error).message);
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, alert delivery, and billing."
      />

      <div className="space-y-4 max-w-3xl">
        <Section title="Profile">
          <FormRow label="Display name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={!loaded}
            />
          </FormRow>
          <FormRow label="Email">
            <Input value={email} disabled placeholder={loaded ? "" : "Loading…"} />
          </FormRow>
          <div className="flex items-center justify-end gap-3">
            <StatusText status={profileStatus} />
            <Button
              size="sm"
              disabled={!loaded || profileStatus.kind === "saving"}
              onClick={() => patchProfile({ display_name: name }, setProfileStatus)}
            >
              {profileStatus.kind === "saving" ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </Section>

        <Section
          title="Alert delivery"
          description="Where to send your strategy alerts in real time."
        >
          <FormRow
            label="Telegram chat ID"
            hint="Message @ObsidiaBot, then paste the chat ID it returns."
          >
            <Input
              value={tg}
              onChange={(e) => setTg(e.target.value)}
              placeholder="-1001234567890"
              disabled={!loaded}
            />
          </FormRow>
          <FormRow label="Discord webhook URL">
            <Input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="https://discord.com/api/webhooks/…"
              disabled={!loaded}
            />
          </FormRow>
          <div className="flex items-center justify-end gap-3">
            <StatusText status={channelsStatus.kind !== "idle" ? channelsStatus : testStatus} />
            <Button
              variant="secondary"
              size="sm"
              disabled={!loaded || testStatus.kind === "saving"}
              onClick={sendTest}
            >
              {testStatus.kind === "saving" ? "Sending…" : "Send test"}
            </Button>
            <Button
              size="sm"
              disabled={!loaded || channelsStatus.kind === "saving"}
              onClick={() =>
                patchProfile(
                  { tg_chat_id: tg, discord_webhook: discord },
                  setChannelsStatus
                )
              }
            >
              {channelsStatus.kind === "saving" ? "Saving…" : "Save channels"}
            </Button>
          </div>
        </Section>

        <Section
          title="Billing"
          description="Your current plan and invoice history."
        >
          <FormRow label="Current plan">
            <div className="flex items-center justify-between">
              <Badge variant={plan === "Free" ? "primary" : "success"}>{plan}</Badge>
              <Button asChild size="sm">
                <Link href="/pricing">{plan === "Free" ? "Upgrade" : "Change plan"}</Link>
              </Button>
            </div>
          </FormRow>
          <FormRow
            label="Next renewal"
            hint={
              plan === "Free"
                ? "You won't be charged until you upgrade."
                : "Managed via your billing portal."
            }
          >
            <span className="text-sm text-[var(--color-muted-foreground)]">—</span>
          </FormRow>
        </Section>

        <Section
          title="Danger zone"
          description="Irreversible account actions."
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">
                Delete account
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                Permanently delete your account and all data. Cannot be undone.
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}

function StatusText({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  if (status.kind === "saving")
    return (
      <span className="text-xs text-[var(--color-muted-foreground)]">…</span>
    );
  return (
    <span
      className={`text-xs ${
        status.kind === "ok"
          ? "text-[var(--color-success)]"
          : "text-[var(--color-danger)]"
      }`}
    >
      {status.msg ?? (status.kind === "ok" ? "Saved" : "Failed")}
    </span>
  );
}
