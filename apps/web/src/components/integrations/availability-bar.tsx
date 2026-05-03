"use client";

import {
  availabilityTextClass,
  availabilityTone,
  statusDotClass,
} from "@/lib/ui/status-styles";

function barColour(pct: number): string {
  return statusDotClass[availabilityTone(pct)];
}

function textColour(pct: number): string {
  return availabilityTextClass(pct);
}

type Props = {
  name: string;
  percent: number;
};

export function AvailabilityBar({ name, percent }: Props) {
  const w = Math.min(100, Math.max(0, percent));
  return (
    <div className="flex items-center gap-2">
      <span className="w-[60px] text-right text-xs text-muted-foreground">
        {name}
      </span>
      <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColour(percent)}`}
          style={{ width: `${w}%` }}
        />
      </div>
      <span
        className={`min-w-[36px] text-right text-xs font-medium tabular-nums ${textColour(percent)}`}
      >
        {percent}%
      </span>
    </div>
  );
}
