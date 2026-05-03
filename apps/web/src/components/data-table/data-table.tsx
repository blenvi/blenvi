"use client";

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
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  bodyRowClassName?: string;
  /** When false, column headers are omitted (e.g. list-style layout). */
  showHeader?: boolean;
  /** Stable row id for keys and selection (e.g. paginated client data). */
  getRowId?: (originalRow: TData, index: number) => string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No results.",
  className,
  tableClassName,
  headerRowClassName,
  bodyRowClassName,
  showHeader = true,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(getRowId ? { getRowId } : {}),
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-[0.5px] border-border bg-background",
        className,
      )}
    >
      <Table className={tableClassName}>
        {showHeader ? (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className={cn(
                  "border-border bg-muted/40 hover:bg-muted/40",
                  headerRowClassName,
                )}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-medium">
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
        ) : null}
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn("border-border/80", bodyRowClassName)}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
