import { Badge } from "@blenvi/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@blenvi/ui/components/table";

import { formatRelative } from "@/components/features/dashboard/metric-format";
import { formatBytes } from "@/lib/utils/format-metric";
import type { NeonBranch } from "@/types/database";

function computeLabel(state: NeonBranch["compute_state"]) {
  if (state === "active") return "Active";
  if (state === "suspended") return "Suspended";
  return "No compute";
}

type Props = {
  branches: NeonBranch[];
};

export function NeonBranchesPanel({ branches }: Props) {
  const sorted = [...branches].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card>
      <CardHeader className="border-b border-border [.border-b]:pb-4">
        <CardTitle>Branches</CardTitle>
        <CardDescription>
          Latest branch snapshot for this integration
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {sorted.length === 0 ? (
          <p className="text-sm font-normal italic text-muted-foreground">
            No branch data yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Compute</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Parent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {row.name}
                      </span>
                      {row.is_default ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.state}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {computeLabel(row.compute_state)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.logical_size_bytes != null
                      ? formatBytes(row.logical_size_bytes)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.created_at_neon
                      ? formatRelative(row.created_at_neon)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.parent_id ?? "root"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
