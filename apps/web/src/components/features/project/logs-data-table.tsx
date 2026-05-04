"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { DataTable } from "@/components/ui/data-table";
import { statusBackgroundClass, statusTextClass } from "@/lib/ui/status-styles";
import type { ProjectCheck } from "@/services/db/integration-checks";

type Row = ProjectCheck;

const statusClass: Record<string, string> = {
  healthy: `${statusBackgroundClass.healthy} ${statusTextClass.healthy}`,
  degraded: `${statusBackgroundClass.degraded} ${statusTextClass.degraded}`,
  down: `${statusBackgroundClass.down} ${statusTextClass.down}`,
  unknown: `${statusBackgroundClass.unknown} ${statusTextClass.unknown}`,
};

export function LogsDataTable({ rows }: { rows: Row[] }) {
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "checked_at",
        header: "Time",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {new Date(row.original.checked_at).toLocaleString()}
          </span>
        ),
      },
      {
        id: "service",
        header: "Service",
        cell: ({ row }) => (
          <span className="font-medium capitalize">
            {row.original.integrations?.service ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[s] ?? statusClass.unknown}`}
            >
              {s}
            </span>
          );
        },
      },
      {
        accessorKey: "response_code",
        header: "HTTP",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.response_code ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "error_message",
        header: "Detail",
        cell: ({ row }) => (
          <span className="max-w-md truncate text-xs text-muted-foreground">
            {row.original.error_message ?? "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="No checks match these filters."
    />
  );
}
