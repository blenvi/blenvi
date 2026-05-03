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
import { cn } from "@blenvi/ui/lib/utils";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  formatCount,
  formatPercent,
} from "@/components/dashboard/metric-format";
import type { OverviewChecksTrendPoint } from "@/types/database";

const chartConfig = {
  checks: {
    label: "Checks",
    color: "var(--chart-2)",
  },
  healthy: {
    label: "Healthy",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type MetricKey = keyof typeof chartConfig;

type Props = {
  trend: OverviewChecksTrendPoint[];
  checks24h: number;
  availability24h: number;
  className?: string;
};

export function OverviewActivityChart({
  trend,
  checks24h,
  availability24h,
  className,
}: Props) {
  const [activeChart, setActiveChart] = React.useState<MetricKey>("checks");

  const chartData = React.useMemo(
    () =>
      trend.map((row) => ({
        dayKey: row.dayKey,
        checks: row.checks,
        healthy: row.healthy,
      })),
    [trend],
  );

  const totals = React.useMemo(
    () => ({
      checks: chartData.reduce((acc, row) => acc + row.checks, 0),
      healthy: chartData.reduce((acc, row) => acc + row.healthy, 0),
    }),
    [chartData],
  );

  return (
    <Card className={cn("py-0 @container/card", className)}>
      <CardHeader className="flex flex-col gap-0 p-0 sm:flex-row ">
        <div className="flex flex-1 flex-col justify-center gap-1 px-5 pt-4 pb-3 sm:px-6 sm:py-5">
          <CardTitle>Checks trend</CardTitle>
          <CardDescription>
            Daily poll volume from integration metrics (last 7 UTC days)
          </CardDescription>
          <p className="text-xs font-normal text-muted-foreground">
            Last 24h: {formatCount(checks24h)} checks ·{" "}
            {formatPercent(availability24h)} healthy
          </p>
        </div>
        <div className="flex sm:min-w-0 border-b border-r sm:border-r-0">
          {(["checks", "healthy"] as const).map((key) => (
            <button
              key={key}
              type="button"
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-border px-5 py-4 text-left even:border-l even:border-border sm:border-t-0 sm:border-l sm:px-8 sm:py-6 data-[active=true]:bg-muted/50"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs font-normal text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg font-medium leading-none tabular-nums sm:text-2xl">
                {totals[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 pb-4 sm:px-6 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          initialDimension={{ width: 900, height: 250 }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="dayKey"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                if (typeof value !== "string") return String(value);
                return new Date(`${value}T12:00:00.000Z`).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                );
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    if (typeof value !== "string") return String(value);
                    return new Date(
                      `${value}T12:00:00.000Z`,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
