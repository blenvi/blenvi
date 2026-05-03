"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@blenvi/ui/components/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { formatBytes, formatDuration } from "@/lib/utils/format-metric";
import type { NeonSnapshot } from "@/types/database";

const chartConfig = {
  computeHours: {
    label: "Compute hours",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type Props = {
  history: NeonSnapshot[];
  snapshot: NeonSnapshot | null;
};

export function NeonConsumptionPanel({ history, snapshot }: Props) {
  const rows = [...history]
    .sort(
      (a, b) =>
        new Date(a.polled_at).getTime() - new Date(b.polled_at).getTime(),
    )
    .map((row) => ({
      ts: new Date(row.polled_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      computeHours: Number((row.compute_time_seconds / 3600).toFixed(2)),
    }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Consumption</CardTitle>
          <CardDescription>
            Compute usage trend from the latest snapshots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[260px] w-full"
            initialDimension={{ width: 900, height: 260 }}
          >
            <AreaChart
              accessibilityLayer
              data={rows}
              margin={{ top: 8, right: 12, left: 12, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="ts"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                tick={{ fontSize: 11 }}
                tickFormatter={(value: number) => `${value.toFixed(2)}h`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="computeHours"
                type="monotone"
                stroke="var(--color-computeHours)"
                fill="var(--color-computeHours)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total compute this period</CardDescription>
            <CardTitle>
              {formatDuration(snapshot?.compute_time_seconds ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total written data</CardDescription>
            <CardTitle>
              {formatBytes(snapshot?.written_data_bytes ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total transfer</CardDescription>
            <CardTitle>
              {formatBytes(snapshot?.data_transfer_bytes ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
