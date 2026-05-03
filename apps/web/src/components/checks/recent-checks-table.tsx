"use client";

import { Button } from "@blenvi/ui/components/button";
import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@blenvi/ui/components/dropdown-menu";
import { Input } from "@blenvi/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@blenvi/ui/components/table";
import { cn } from "@blenvi/ui/lib/utils";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";

import { formatRelative } from "@/components/dashboard/metric-format";
import { StatusBadge } from "@/components/integrations/status-badge";
import type { Integration } from "@/types/database";

export type RecentCheckTableRow = {
  id: string;
  integrationId: string;
  projectId?: string | null;
  projectName?: string | null;
  service: Integration["service"];
  status: Integration["status"];
  polledAt: string;
  latencyMs?: number | null;
  responseCode?: number | null;
};

type Props = {
  checks: RecentCheckTableRow[];
  title?: string;
  description?: string;
  action?: ReactNode;
  showProjectColumn?: boolean;
  pageSize?: number;
};

const STATUS_VALUES: Integration["status"][] = [
  "healthy",
  "degraded",
  "down",
  "unknown",
];

const statusFilterFn: FilterFn<RecentCheckTableRow> = (
  row,
  columnId,
  value,
) => {
  const selected = value as string[] | undefined;
  if (!selected?.length) return true;
  return selected.includes(String(row.getValue(columnId)));
};

const globalFilterFn: FilterFn<RecentCheckTableRow> = (
  row,
  _columnId,
  filter,
) => {
  const query = String(filter ?? "")
    .trim()
    .toLowerCase();
  if (!query) return true;
  const check = row.original;
  return (
    check.service.toLowerCase().includes(query) ||
    check.status.toLowerCase().includes(query) ||
    (check.projectName ?? "").toLowerCase().includes(query) ||
    String(check.responseCode ?? "").includes(query)
  );
};

function SortHeader({
  label,
  column,
  className,
}: {
  label: string;
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: () => void;
  };
  className?: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "-ml-2 h-7 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase hover:bg-transparent hover:text-foreground",
        className,
      )}
      onClick={() => column.toggleSorting()}
    >
      {label}
      <ArrowUpDown
        className={cn(
          "ml-1 size-3 shrink-0 opacity-50",
          sorted && "text-foreground opacity-100",
        )}
      />
    </Button>
  );
}

const COLUMN_MENU_LABEL: Record<string, string> = {
  service: "Service",
  projectName: "Project",
  status: "Status",
  polledAt: "Polled",
  responseCode: "HTTP",
  latencyMs: "Latency",
};

export function RecentChecksTable({
  checks,
  title = "Recent checks",
  description = "Latest integration health checks",
  action,
  showProjectColumn = false,
  pageSize = 5,
}: Props) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const hasLatency = checks.some((check) => check.latencyMs !== undefined);
  const hasResponseCode = checks.some(
    (check) => check.responseCode !== undefined,
  );

  const columns = useMemo<ColumnDef<RecentCheckTableRow>[]>(() => {
    const cols: ColumnDef<RecentCheckTableRow>[] = [
      {
        accessorKey: "service",
        enableHiding: false,
        header: ({ column }) => <SortHeader label="Service" column={column} />,
        cell: ({ row }) => {
          const { service, integrationId, projectId } = row.original;
          const label = (
            <span className="font-medium capitalize">{service}</span>
          );
          if (!projectId) return label;
          return (
            <Link
              href={`/projects/${projectId}/integrations/${integrationId}`}
              className="text-foreground underline-offset-2 hover:underline"
            >
              {label}
            </Link>
          );
        },
      },
    ];

    if (showProjectColumn) {
      cols.push({
        accessorKey: "projectName",
        header: ({ column }) => <SortHeader label="Project" column={column} />,
        cell: ({ row }) => {
          const { projectName, projectId } = row.original;
          if (!projectId) {
            return (
              <span className="block max-w-[10rem] truncate text-muted-foreground">
                {projectName ?? "Unknown"}
              </span>
            );
          }
          return (
            <Link
              href={`/projects/${projectId}`}
              className="block max-w-[10rem] truncate text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {projectName ?? "Unknown"}
            </Link>
          );
        },
      });
    }

    cols.push({
      accessorKey: "status",
      header: ({ column }) => <SortHeader label="Status" column={column} />,
      filterFn: statusFilterFn,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    });

    cols.push({
      id: "polledAt",
      accessorFn: (row) => row.polledAt,
      header: ({ column }) => <SortHeader label="Polled" column={column} />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {formatRelative(row.original.polledAt)}
        </span>
      ),
    });

    if (hasResponseCode) {
      cols.push({
        id: "responseCode",
        accessorFn: (row) => row.responseCode ?? -1,
        header: ({ column }) => <SortHeader label="HTTP" column={column} />,
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.responseCode != null
              ? row.original.responseCode
              : "—"}
          </span>
        ),
      });
    }

    if (hasLatency) {
      cols.push({
        id: "latencyMs",
        accessorFn: (row) => row.latencyMs ?? -1,
        header: ({ column }) => <SortHeader label="Latency" column={column} />,
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.latencyMs != null
              ? `${row.original.latencyMs} ms`
              : "—"}
          </span>
        ),
      });
    }

    return cols;
  }, [hasLatency, hasResponseCode, showProjectColumn]);

  const table = useReactTable({
    data: checks,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    getRowId: (row) => row.id,
  });

  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string[] | undefined) ?? [];
  const statusFilterActive = statusFilter.length > 0;
  const filteredRows = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;
  const visibleColumns = table.getVisibleLeafColumns().length;

  return (
    <div>
      <CardHeader className="mb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      {checks.length === 0 ? (
        <p className="px-4 py-6 text-sm font-normal italic text-muted-foreground">
          No checks recorded yet.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search checks..."
              value={globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="h-7 max-w-[min(100%,14rem)] flex-1 text-xs sm:max-w-xs"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 gap-1 border-dashed px-2 text-xs",
                    statusFilterActive && "border-solid",
                  )}
                >
                  <Plus className="size-3.5" />
                  Status
                  {statusFilterActive ? (
                    <span className="ml-0.5 rounded-sm bg-muted px-1 py-px font-normal tabular-nums">
                      {statusFilter.length}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-xs">
                  Filter by status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_VALUES.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    className="text-xs capitalize"
                    checked={statusFilter.includes(status)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...statusFilter, status]
                        : statusFilter.filter((item) => item !== status);
                      table
                        .getColumn("status")
                        ?.setFilterValue(next.length ? next : undefined);
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
                {statusFilterActive ? (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full justify-start px-2 text-xs font-normal"
                      onClick={() =>
                        table.getColumn("status")?.setFilterValue(undefined)
                      }
                    >
                      Clear status
                    </Button>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7 shrink-0"
                aria-label="Refresh"
                onClick={() => router.refresh()}
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <Columns3 className="size-3.5" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs">
                    Toggle columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table.getAllLeafColumns().map((column) => {
                    if (!column.getCanHide()) return null;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="text-xs capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {COLUMN_MENU_LABEL[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Table className="border">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-border bg-muted/40 hover:bg-muted/40"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-border/80">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(visibleColumns, 1)}
                    className="h-16 text-center text-xs text-muted-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              <span className="tabular-nums">{filteredRows}</span> row(s) total.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
              <div className="flex items-center gap-1">
                <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-muted-foreground">
                  Page {pageIndex + 1} of {pageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="hidden size-7 sm:inline-flex"
                  aria-label="First page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.setPageIndex(0)}
                >
                  <ChevronsLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7"
                  aria-label="Previous page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7"
                  aria-label="Next page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="hidden size-7 sm:inline-flex"
                  aria-label="Last page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                >
                  <ChevronsRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
