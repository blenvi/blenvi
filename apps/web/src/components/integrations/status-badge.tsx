"use client";

import { Badge } from "@blenvi/ui/components/badge";
import { statusBadgeVariant } from "@/lib/utils/status";
import type { Integration } from "@/types/database";
import { type Icon, Icons } from "../icons";

type Status = Integration["status"];

const STYLES: Record<Status, { icon: Icon; label: string }> = {
  healthy: {
    icon: Icons.statusHealthy,
    label: "Healthy",
  },
  degraded: {
    icon: Icons.statusDegraded,
    label: "Degraded",
  },
  down: {
    icon: Icons.statusDown,
    label: "Down",
  },
  unknown: {
    icon: Icons.statusUnknown,
    label: "Unknown",
  },
};

type Props = {
  status: Status;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: Props) {
  const s = STYLES[status];
  const text = label ?? s.label;
  return (
    <Badge variant={statusBadgeVariant[status]} className={className}>
      <s.icon />
      {text}
    </Badge>
  );
}
