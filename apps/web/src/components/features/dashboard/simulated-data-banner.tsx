/** When `pollHealth` still returns placeholder provider metrics (`raw_payload.mock`). */
export function SimulatedDataBanner() {
  return (
    <div
      className="rounded-lg border border-status-degraded-border bg-status-degraded-muted px-3 py-2.5 text-sm text-status-degraded-foreground"
      role="status"
    >
      <span className="font-medium">Demo resource metrics. </span>
      Connection counts, balances, and similar numbers are placeholders until
      each provider is integrated in code. Availability, check history, and
      probe status use your real stored data.
    </div>
  );
}
