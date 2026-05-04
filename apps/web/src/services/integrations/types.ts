import type { Integration, ServiceMetrics } from "@/types/database";

export type MetricUnit =
  | "bytes"
  | "cents"
  | "count"
  | "ms"
  | "percent"
  | "ratio"
  | "boolean"
  | "iso8601";

export type MetricDefinition = {
  key: string;
  label: string;
  unit: MetricUnit;
  /** When false, lower numeric values are better (e.g. latency). */
  higherIsBetter?: boolean;
  /** If true, metric is informational only for severity (never drives critical alone). */
  is_read_only?: boolean;
  thresholds?: { warn?: number; critical?: number };
};

export type PollResult<T extends ServiceMetrics = ServiceMetrics> = {
  status: Integration["status"];
  metrics: T;
  raw_payload: Record<string, unknown> | null;
  response_code?: number | null;
  error_message?: string | null;
};
