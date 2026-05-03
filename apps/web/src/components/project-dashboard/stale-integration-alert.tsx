"use client";

import { Card, CardContent } from "@blenvi/ui/components/card";
import { cn } from "@blenvi/ui/lib/utils";
import { AlertTriangle } from "lucide-react";

import { severitySurfaceClass, statusTextClass } from "@/lib/ui/status-styles";
import type { Integration } from "@/types/database";

type Props = {
  stale: Integration[];
  thresholdMinutes: number;
};

export function StaleIntegrationAlert({ stale, thresholdMinutes }: Props) {
  const names = stale.map((i) => i.service).join(", ");

  if (stale.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground">
            All integrations were checked in the last {thresholdMinutes}{" "}
            minutes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "gap-0 py-0 shadow-none ring-0",
        severitySurfaceClass.warning,
      )}
    >
      <CardContent className="flex items-start gap-2.5 py-3 sm:py-3.5">
        <AlertTriangle
          className={`mt-0.5 size-3.5 shrink-0 ${statusTextClass.degraded}`}
          aria-hidden
        />
        <p className={`text-xs ${statusTextClass.degraded}`}>
          {stale.length} integration{stale.length === 1 ? "" : "s"} haven&apos;t
          been checked in the last {thresholdMinutes} minutes: {names}
        </p>
      </CardContent>
    </Card>
  );
}
