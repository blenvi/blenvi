"use client";

import { Card, CardContent } from "@blenvi/ui/components/card";
import { cn } from "@blenvi/ui/lib/utils";
import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

import { ROUTE_PATHS } from "@/constants";
import { severitySurfaceClass, statusTextClass } from "@/lib/ui/status-styles";
import type { Integration } from "@/types/database";

type AlertItem = {
  projectId: string;
  projectName: string;
  service: Integration["service"];
};

export function WorkspaceAlertBar({
  downItems,
  degradedItems,
}: {
  downItems: AlertItem[];
  degradedItems: AlertItem[];
}) {
  if (downItems.length === 0 && degradedItems.length === 0) return null;

  const topDown = downItems.slice(0, 3);
  const firstDegraded = degradedItems[0];

  return (
    <div className="space-y-2.5">
      {topDown.length > 0 ? (
        <Card
          className={cn(
            "gap-0 py-0 shadow-none ring-0",
            severitySurfaceClass.critical,
          )}
        >
          <CardContent className="py-3 sm:py-3.5">
            <div className="flex items-start gap-2">
              <AlertCircleIcon
                className={`mt-0.5 size-3.5 shrink-0 ${statusTextClass.down}`}
              />
              <p className={`text-sm font-normal ${statusTextClass.down}`}>
                {topDown
                  .map((row) => `${row.projectName} (${row.service})`)
                  .join(", ")}{" "}
                {downItems.length > 3 ? "and more are down." : "are down."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {firstDegraded ? (
        <Card
          className={cn(
            "gap-0 py-0 shadow-none ring-0",
            severitySurfaceClass.warning,
          )}
        >
          <CardContent className="py-3 sm:py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangleIcon
                  className={`mt-0.5 size-3.5 shrink-0 ${statusTextClass.degraded}`}
                />
                <p
                  className={`text-sm font-normal ${statusTextClass.degraded}`}
                >
                  {firstDegraded.service} integration in{" "}
                  {firstDegraded.projectName} has been degraded.
                </p>
              </div>
              <Link
                href={ROUTE_PATHS.project(firstDegraded.projectId)}
                className={`shrink-0 text-sm font-medium underline-offset-4 hover:underline ${statusTextClass.degraded}`}
              >
                View project -&gt;
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
