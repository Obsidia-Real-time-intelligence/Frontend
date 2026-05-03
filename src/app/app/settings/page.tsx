"use client";

import { PageHeader } from "@/components/shell/page-header";
import { Section, FormRow } from "@/components/strategy/section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email] = useState("you@obsidia.fi");
  const [tg, setTg] = useState("");
  const [discord, setDiscord] = useState("");

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
            />
          </FormRow>
          <FormRow label="Email">
            <Input value={email} disabled />
          </FormRow>
          <div className="flex justify-end">
            <Button size="sm">Save profile</Button>
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
            />
          </FormRow>
          <FormRow label="Discord webhook URL">
            <Input
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="https://discord.com/api/webhooks/…"
            />
          </FormRow>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm">
              Send test
            </Button>
            <Button size="sm">Save channels</Button>
          </div>
        </Section>

        <Section
          title="Billing"
          description="Your current plan and invoice history."
        >
          <FormRow label="Current plan">
            <div className="flex items-center justify-between">
              <Badge variant="primary">Free</Badge>
              <Button size="sm">Upgrade</Button>
            </div>
          </FormRow>
          <FormRow
            label="Next renewal"
            hint="You won't be charged until you upgrade."
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
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
