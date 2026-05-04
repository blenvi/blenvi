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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { TimeBucketPoint } from "@/services/db/integration-analytics";

const chartConfig = {
  healthy: {
    label: "Healthy",
    color: "var(--status-healthy)",
  },
  degraded: {
    label: "Degraded",
    color: "var(--status-degraded)",
  },
  down: {
    label: "Down",
    color: "var(--status-down)",
  },
  unknown: {
    label: "Unknown",
    color: "var(--status-unknown)",
  },
} satisfies ChartConfig;

type Props = {
  buckets: TimeBucketPoint[];
};

export function CheckVolumeChart({ buckets }: Props) {
  const data = buckets.map((bucket) => ({
    hour: bucket.label,
    healthy: bucket.healthy,
    degraded: bucket.degraded,
    down: bucket.down,
    unknown: bucket.unknown,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check volume (24h)</CardTitle>
        <CardDescription>Stacked outcomes per hour</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
          initialDimension={{ width: 500, height: 220 }}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            barCategoryGap={4}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent className="w-[150px]" />}
            />
            <Bar dataKey="healthy" stackId="a" fill="var(--color-healthy)" />
            <Bar dataKey="degraded" stackId="a" fill="var(--color-degraded)" />
            <Bar dataKey="down" stackId="a" fill="var(--color-down)" />
            <Bar
              dataKey="unknown"
              stackId="a"
              fill="var(--color-unknown)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
