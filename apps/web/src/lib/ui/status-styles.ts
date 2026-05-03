import type { Integration } from "@/types/database";

export type StatusTone = Integration["status"];
export type SeverityTone = "critical" | "warning" | "neutral";

export const statusTextClass: Record<StatusTone, string> = {
  healthy: "text-status-healthy-foreground",
  degraded: "text-status-degraded-foreground",
  down: "text-status-down-foreground",
  unknown: "text-status-unknown-foreground",
};

export const statusBackgroundClass: Record<StatusTone, string> = {
  healthy: "bg-status-healthy-muted",
  degraded: "bg-status-degraded-muted",
  down: "bg-status-down-muted",
  unknown: "bg-status-unknown-muted",
};

export const statusDotClass: Record<StatusTone, string> = {
  healthy: "bg-status-healthy",
  degraded: "bg-status-degraded",
  down: "bg-status-down",
  unknown: "bg-status-unknown",
};

export const statusBorderClass: Record<StatusTone, string> = {
  healthy: "border-status-healthy",
  degraded: "border-status-degraded-border",
  down: "border-status-down-border",
  unknown: "border-border",
};

export const severitySurfaceClass: Record<SeverityTone, string> = {
  critical: "border-[0.5px] border-status-down-border bg-status-down-muted",
  warning:
    "border-[0.5px] border-status-degraded-border bg-status-degraded-muted",
  neutral: "border-[0.5px] border-border bg-muted/50",
};

export function availabilityTone(pct: number): StatusTone {
  if (pct >= 99) return "healthy";
  if (pct >= 90) return "degraded";
  return "down";
}

export function availabilityTextClass(pct: number): string {
  if (!Number.isFinite(pct)) return "text-foreground";
  return statusTextClass[availabilityTone(pct)];
}
