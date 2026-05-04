import { Badge } from "@blenvi/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";

import { formatRelative } from "@/components/features/dashboard/metric-format";
import type { NeonOperation } from "@/types/database";

const ACTION_LABELS: Record<string, string> = {
  start_compute: "Compute started",
  suspend_compute: "Compute suspended",
  create_branch: "Branch created",
  delete_branch: "Branch deleted",
  apply_migration: "Migration applied",
  create_endpoint: "Endpoint created",
  delete_endpoint: "Endpoint deleted",
};

function titleCaseFallback(action: string) {
  return action
    .split("_")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}

function statusVariant(status: NeonOperation["status"]) {
  if (status === "finished") return "default" as const;
  if (status === "failed") return "destructive" as const;
  if (status === "running") return "secondary" as const;
  return "outline" as const;
}

type Props = {
  operations: NeonOperation[];
};

export function NeonOperationsPanel({ operations }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations</CardTitle>
        <CardDescription>
          Recent Neon control-plane operations, newest first
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {operations.length === 0 ? (
          <p className="text-sm font-normal italic text-muted-foreground">
            No operations recorded yet.
          </p>
        ) : (
          operations.map((operation) => (
            <div
              key={operation.id}
              className="rounded-lg border border-border px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {ACTION_LABELS[operation.action] ??
                    titleCaseFallback(operation.action)}
                </p>
                <Badge variant={statusVariant(operation.status)}>
                  {operation.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {operation.duration_ms != null
                    ? `${operation.duration_ms} ms`
                    : "-"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {operation.branch_id
                  ? `branch ${operation.branch_id}`
                  : "No branch"}{" "}
                -{" "}
                {operation.started_at
                  ? formatRelative(operation.started_at)
                  : "No start timestamp"}
              </p>
              {operation.status === "failed" && operation.error ? (
                <p className="mt-1 text-xs text-destructive">
                  {operation.error}
                </p>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
