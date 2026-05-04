import type { MetricUnit } from "@/services/integrations/types";

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

export function formatCents(cents: number): string {
  if (!Number.isFinite(cents)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 48) return `${diffHr}h ago`;
  return new Date(iso).toLocaleString();
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole}s`;
  if (whole < 3600) {
    const m = Math.floor(whole / 60);
    const s = whole % 60;
    return `${m}m ${s}s`;
  }
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatComputeUnits(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  return `${(seconds / 3600).toFixed(2)} compute-hours`;
}

export function formatMetricValue(unit: MetricUnit, value: unknown): string {
  if (value === null || value === undefined) return "—";
  switch (unit) {
    case "bytes":
      return typeof value === "number" ? formatBytes(value) : "—";
    case "cents":
      return typeof value === "number" ? formatCents(value) : "—";
    case "count":
      return typeof value === "number"
        ? new Intl.NumberFormat().format(value)
        : String(value);
    case "ms":
      return typeof value === "number"
        ? `${Math.round(value)} ms`
        : String(value);
    case "percent":
      return typeof value === "number" ? `${value.toFixed(1)}%` : String(value);
    case "ratio":
      return typeof value === "number"
        ? `${(value * 100).toFixed(2)}%`
        : String(value);
    case "boolean":
      return value === true ? "Yes" : value === false ? "No" : "—";
    case "iso8601":
      return typeof value === "string" ? formatRelativeTime(value) : "—";
    default:
      return String(value);
  }
}
