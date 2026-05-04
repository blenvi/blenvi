/** Presentation-only formatters for dashboard metrics (no lib/db changes). */

import { availabilityTextClass } from "@/lib/ui/status-styles";

export function availabilityValueClass(pct: number): string {
  return availabilityTextClass(pct);
}

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = v >= 10 || i === 0 ? 0 : 1;
  return `${v.toFixed(digits)} ${units[i]}`;
}

export function formatCents(n: number, currency = "USD"): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(n / 100);
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}

export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat().format(n);
}

export function formatMs(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}s`;
  return `${Math.round(n)}ms`;
}

export function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diffSec = Math.floor((Date.now() - t) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(diffSec / 86400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export type DashboardMetricUnit =
  | "bytes"
  | "cents"
  | "count"
  | "ms"
  | "percent"
  | "ratio"
  | "boolean"
  | "iso8601";

export function formatMetricValue(
  value: unknown,
  unit: DashboardMetricUnit,
): string {
  if (value === null || value === undefined) return "—";
  switch (unit) {
    case "bytes":
      return typeof value === "number" ? formatBytes(value) : "—";
    case "cents":
      return typeof value === "number" ? formatCents(value) : "—";
    case "count":
      return typeof value === "number" ? formatCount(value) : String(value);
    case "ms":
      return typeof value === "number" ? formatMs(value) : String(value);
    case "percent":
      return typeof value === "number" ? `${value.toFixed(1)}%` : String(value);
    case "ratio":
      return typeof value === "number"
        ? `${(value * 100).toFixed(2)}%`
        : String(value);
    case "boolean":
      return value === true ? "Yes" : value === false ? "No" : "—";
    case "iso8601":
      return typeof value === "string" ? formatRelative(value) : "—";
    default:
      return String(value);
  }
}
