"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { DataTable } from "@/components/data-table/data-table";
import type { MetricDefinition } from "@/lib/services/types";
import { formatMetricValue } from "@/lib/utils/format-metric";
import type { IntegrationMetric } from "@/types/database";

type Props = {
  rows: IntegrationMetric[];
  defs: MetricDefinition[];
  historyError: string | null;
};

export function MetricHistoryTable({ rows, defs, historyError }: Props) {
  const columns = useMemo<ColumnDef<IntegrationMetric>[]>(() => {
    const base: ColumnDef<IntegrationMetric>[] = [
      {
        accessorKey: "polled_at",
        header: "Polled",
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {new Date(row.original.polled_at).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "latency_ms",
        header: "Latency",
        cell: ({ row }) => {
          const ms = row.original.latency_ms;
          return ms != null ? `${ms} ms` : "—";
        },
      },
    ];

    const metricCols: ColumnDef<IntegrationMetric>[] = defs.map((d) => ({
      id: d.key,
      header: d.label,
      cell: ({ row }) => {
        const raw = (row.original.metrics as Record<string, unknown>)[d.key];
        return (
          <span className="whitespace-nowrap">
            {formatMetricValue(d.unit, raw)}
          </span>
        );
      },
    }));

    return [...base, ...metricCols];
  }, [defs]);

  if (historyError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-6 text-sm text-destructive">
        Could not load metric history: {historyError}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No metric history yet. Run a poll from the project dashboard or wait for the scheduled job."
        tableClassName="min-w-[640px]"
      />
    </div>
  );
}
