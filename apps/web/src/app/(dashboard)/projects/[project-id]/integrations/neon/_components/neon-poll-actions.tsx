"use client";

import { Button } from "@blenvi/ui/components/button";
import { ActivityIcon, DatabaseZapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PollMode = "soft" | "hard";

type Props = {
  integrationId: string;
};

export function NeonPollActions({ integrationId }: Props) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<PollMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPoll(mode: PollMode) {
    setActiveMode(mode);
    setError(null);

    const response = await fetch(`/api/integrations/${integrationId}/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(body.error ?? "Refresh failed. Try again later.");
      setActiveMode(null);
      return;
    }

    router.refresh();
    setActiveMode(null);
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={activeMode !== null}
          onClick={() => runPoll("soft")}
        >
          <ActivityIcon className="size-3.5" />
          {activeMode === "soft" ? "Checking..." : "Soft check"}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={activeMode !== null}
          onClick={() => runPoll("hard")}
        >
          <DatabaseZapIcon className="size-3.5" />
          {activeMode === "hard" ? "Refreshing..." : "Hard refresh"}
        </Button>
      </div>
      {error ? (
        <p className="max-w-72 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
