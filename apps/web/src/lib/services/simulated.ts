/** Stored or returned by `pollHealth` when values are placeholders, not live vendor APIs. */
export function isSimulatedMetricPayload(
  raw: Record<string, unknown> | null | undefined,
): boolean {
  return raw?.mock === true;
}
