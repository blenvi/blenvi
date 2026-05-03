"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";

import { AvailabilityBar } from "@/components/integrations/availability-bar";

type Row = {
  name: string;
  percent: number;
};

type Props = {
  rows: Row[];
};

export function AvailabilityByIntegration({ rows }: Props) {
  return (
    <Card>
      <CardHeader className="border-b border-border [.border-b]:pb-4">
        <CardTitle>Availability by integration (7d)</CardTitle>
        <CardDescription>Healthy probes ÷ total checks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-4">
        {rows.length === 0 ? (
          <p className="text-sm font-normal italic text-muted-foreground">
            No integration data for this period.
          </p>
        ) : (
          rows.map((row) => (
            <AvailabilityBar
              key={row.name}
              name={row.name}
              percent={row.percent}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
