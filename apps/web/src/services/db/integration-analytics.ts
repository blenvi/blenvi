import { TIME_MS } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import type { Integration } from "@/types/database";

import type { Result } from "./types";

export type CheckRow = {
  integration_id: string;
  status: string;
  checked_at: string;
  response_code: number | null;
  error_message: string | null;
};

export type TimeBucketPoint = {
  /** Short label for chart axis */
  label: string;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  total: number;
};

export type IntegrationAvailabilityRow = {
  integrationId: string;
  service: string;
  availabilityPct: number;
  checks7d: number;
  healthy7d: number;
  incidents7d: number;
};

export type HttpCodeRow = {
  code: string;
  count: number;
};

export type ErrorSnippet = {
  message: string;
  count: number;
};

export type ProjectAnalytics = {
  checksHourly24h: TimeBucketPoint[];
  checksSixHourly7d: TimeBucketPoint[];
  perIntegration: IntegrationAvailabilityRow[];
  httpCodes7d: HttpCodeRow[];
  topErrors7d: ErrorSnippet[];
  totals24h: {
    checks: number;
    healthy: number;
    degraded: number;
    down: number;
    unknown: number;
    availabilityPct: number;
    incidentCount: number;
  };
  totals7d: {
    checks: number;
    healthy: number;
    degraded: number;
    down: number;
    unknown: number;
    availabilityPct: number;
    incidentCount: number;
  };
  /** True if we stopped paging before EOF (very high volume). */
  historyTruncated: boolean;
};

function mapError(message: string) {
  return message || "Something went wrong";
}

function startOfHour(d: Date) {
  const x = new Date(d);
  x.setMinutes(0, 0, 0);
  return x;
}

function startOfSixHourSlot(d: Date) {
  const x = new Date(d);
  x.setMinutes(0, 0, 0);
  const h = x.getHours();
  x.setHours(Math.floor(h / 6) * 6, 0, 0, 0);
  return x;
}

function hourLabel(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
}

function buildHourlyBuckets24h(rows: CheckRow[]): TimeBucketPoint[] {
  const end = startOfHour(new Date());
  const start = new Date(end.getTime() - TIME_MS.day);
  const keys: string[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += TIME_MS.hour) {
    keys.push(new Date(t).toISOString());
  }
  const map = new Map<string, TimeBucketPoint>();
  for (const k of keys) {
    const d = new Date(k);
    map.set(k, {
      label: hourLabel(d),
      healthy: 0,
      degraded: 0,
      down: 0,
      unknown: 0,
      total: 0,
    });
  }
  const since = start.toISOString();
  for (const row of rows) {
    if (row.checked_at < since) continue;
    const key = startOfHour(new Date(row.checked_at)).toISOString();
    const bucket = map.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    switch (row.status) {
      case "healthy":
        bucket.healthy += 1;
        break;
      case "degraded":
        bucket.degraded += 1;
        break;
      case "down":
        bucket.down += 1;
        break;
      default:
        bucket.unknown += 1;
    }
  }
  return keys.map((k) => {
    const point = map.get(k);
    if (!point) {
      throw new Error("Missing hourly bucket");
    }
    return point;
  });
}

function buildSixHourBuckets7d(rows: CheckRow[]): TimeBucketPoint[] {
  const end = startOfSixHourSlot(new Date());
  const start = new Date(end.getTime() - TIME_MS.week);
  const keys: string[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += 6 * TIME_MS.hour) {
    keys.push(new Date(t).toISOString());
  }
  const map = new Map<string, TimeBucketPoint>();
  for (const k of keys) {
    const d = new Date(k);
    map.set(k, {
      label: hourLabel(d),
      healthy: 0,
      degraded: 0,
      down: 0,
      unknown: 0,
      total: 0,
    });
  }
  const since = start.toISOString();
  for (const row of rows) {
    if (row.checked_at < since) continue;
    const key = startOfSixHourSlot(new Date(row.checked_at)).toISOString();
    const bucket = map.get(key);
    if (!bucket) continue;
    bucket.total += 1;
    switch (row.status) {
      case "healthy":
        bucket.healthy += 1;
        break;
      case "degraded":
        bucket.degraded += 1;
        break;
      case "down":
        bucket.down += 1;
        break;
      default:
        bucket.unknown += 1;
    }
  }
  return keys.map((k) => {
    const point = map.get(k);
    if (!point) {
      throw new Error("Missing six-hour bucket");
    }
    return point;
  });
}

function totalsForWindow(
  rows: CheckRow[],
  sinceIso: string,
): Pick<
  ProjectAnalytics["totals7d"],
  "checks" | "healthy" | "degraded" | "down" | "unknown" | "incidentCount"
> & { availabilityPct: number } {
  let healthy = 0;
  let degraded = 0;
  let down = 0;
  let unknown = 0;
  for (const row of rows) {
    if (row.checked_at < sinceIso) continue;
    switch (row.status) {
      case "healthy":
        healthy += 1;
        break;
      case "degraded":
        degraded += 1;
        break;
      case "down":
        down += 1;
        break;
      default:
        unknown += 1;
    }
  }
  const checks = healthy + degraded + down + unknown;
  const incidentCount = degraded + down;
  return {
    checks,
    healthy,
    degraded,
    down,
    unknown,
    incidentCount,
    availabilityPct:
      checks === 0 ? 0 : Math.round((healthy / checks) * 1000) / 10,
  };
}

async function fetchChecksPaged(
  integrationIds: string[],
  sinceIso: string,
): Promise<Result<{ rows: CheckRow[]; truncated: boolean }>> {
  if (integrationIds.length === 0) {
    return { data: { rows: [], truncated: false }, error: null };
  }

  const supabase = await createClient();
  const pageSize = 1000;
  const all: CheckRow[] = [];
  let from = 0;
  let truncated = false;

  for (;;) {
    const { data, error } = await supabase
      .from("integration_checks")
      .select(
        "integration_id, status, checked_at, response_code, error_message",
      )
      .in("integration_id", integrationIds)
      .gte("checked_at", sinceIso)
      .order("checked_at", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      return { data: null, error: mapError("Failed to load check history") };
    }

    const batch = (data ?? []) as CheckRow[];
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
    if (from >= 20_000) {
      truncated = true;
      break;
    }
  }

  return { data: { rows: all, truncated }, error: null };
}

function serviceById(integrations: Integration[]) {
  const m = new Map<string, string>();
  for (const i of integrations) {
    m.set(i.id, i.service);
  }
  return m;
}

export async function getProjectAnalytics(
  integrations: Integration[],
): Promise<Result<ProjectAnalytics>> {
  const ids = integrations.map((i) => i.id);
  const now = Date.now();
  const since7d = new Date(now - TIME_MS.week).toISOString();
  const since24h = new Date(now - TIME_MS.day).toISOString();

  const fetched = await fetchChecksPaged(ids, since7d);
  if (fetched.error || !fetched.data) {
    return { data: null, error: fetched.error ?? "Failed to load analytics" };
  }

  const { rows, truncated } = fetched.data;
  const svc = serviceById(integrations);

  const perIntegrationMap = new Map<
    string,
    { healthy: number; total: number; incidents: number }
  >();
  for (const id of ids) {
    perIntegrationMap.set(id, { healthy: 0, total: 0, incidents: 0 });
  }

  const httpMap = new Map<string, number>();
  const errMap = new Map<string, number>();

  for (const row of rows) {
    const pid = row.integration_id;
    const agg = perIntegrationMap.get(pid);
    if (agg) {
      agg.total += 1;
      if (row.status === "healthy") agg.healthy += 1;
      if (row.status === "degraded" || row.status === "down") {
        agg.incidents += 1;
      }
    }

    const code =
      row.response_code === null || row.response_code === undefined
        ? "N/A"
        : String(row.response_code);
    httpMap.set(code, (httpMap.get(code) ?? 0) + 1);

    if (row.error_message?.trim()) {
      const key =
        row.error_message.trim().length > 120
          ? `${row.error_message.trim().slice(0, 117)}...`
          : row.error_message.trim();
      errMap.set(key, (errMap.get(key) ?? 0) + 1);
    }
  }

  const perIntegration: IntegrationAvailabilityRow[] = ids.map((id) => {
    const a = perIntegrationMap.get(id);
    if (!a) {
      throw new Error("Missing integration aggregate");
    }
    const availabilityPct =
      a.total === 0 ? 0 : Math.round((a.healthy / a.total) * 1000) / 10;
    return {
      integrationId: id,
      service: svc.get(id) ?? "unknown",
      availabilityPct,
      checks7d: a.total,
      healthy7d: a.healthy,
      incidents7d: a.incidents,
    };
  });

  const httpCodes7d: HttpCodeRow[] = [...httpMap.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topErrors7d: ErrorSnippet[] = [...errMap.entries()]
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const t7 = totalsForWindow(rows, since7d);
  const t24 = totalsForWindow(rows, since24h);

  return {
    data: {
      checksHourly24h: buildHourlyBuckets24h(rows),
      checksSixHourly7d: buildSixHourBuckets7d(rows),
      perIntegration,
      httpCodes7d,
      topErrors7d,
      totals24h: {
        checks: t24.checks,
        healthy: t24.healthy,
        degraded: t24.degraded,
        down: t24.down,
        unknown: t24.unknown,
        availabilityPct: t24.availabilityPct,
        incidentCount: t24.incidentCount,
      },
      totals7d: {
        checks: t7.checks,
        healthy: t7.healthy,
        degraded: t7.degraded,
        down: t7.down,
        unknown: t7.unknown,
        availabilityPct: t7.availabilityPct,
        incidentCount: t7.incidentCount,
      },
      historyTruncated: truncated,
    },
    error: null,
  };
}
