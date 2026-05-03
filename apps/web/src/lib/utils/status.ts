import type { MetricDefinition } from "@/lib/services/types";
import type { Integration } from "@/types/database";

const RANK: Record<Integration["status"], number> = {
  down: 4,
  degraded: 3,
  unknown: 2,
  healthy: 1,
};

export function getWorstStatus(
  statuses: Integration["status"][],
): Integration["status"] {
  if (statuses.length === 0) return "unknown";
  return statuses.reduce((worst, s) => (RANK[s] > RANK[worst] ? s : worst));
}

export type ThresholdSeverity = "ok" | "warn" | "critical";

export function getThresholdSeverity(
  def: MetricDefinition,
  rawValue: unknown,
): ThresholdSeverity | null {
  if (def.is_read_only) return null;
  if (typeof rawValue !== "number" || Number.isNaN(rawValue)) return null;
  const { thresholds } = def;
  if (!thresholds) return "ok";

  const higher = def.higherIsBetter ?? true;
  const crit = thresholds.critical;
  const warn = thresholds.warn;

  if (higher) {
    if (crit !== undefined && rawValue <= crit) return "critical";
    if (warn !== undefined && rawValue <= warn) return "warn";
  } else {
    if (crit !== undefined && rawValue >= crit) return "critical";
    if (warn !== undefined && rawValue >= warn) return "warn";
  }
  return "ok";
}

export const statusBadgeVariant: Record<
  Integration["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "default",
  degraded: "secondary",
  down: "destructive",
  unknown: "outline",
};

export const thresholdToneClass: Record<ThresholdSeverity, string> = {
  ok: "text-foreground",
  warn: "text-amber-600 dark:text-amber-400",
  critical: "text-destructive",
};
