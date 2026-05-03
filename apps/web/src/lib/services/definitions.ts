import type { Integration } from "@/types/database";
import * as neon from "./neon-service";
import type { MetricDefinition } from "./types";

export function getMetricDefinitions(
  _service: Integration["service"],
): MetricDefinition[] {
  return neon.METRICS_DEFINITION;
}
