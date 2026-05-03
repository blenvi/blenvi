/** When `pollHealth` still returns placeholder provider metrics (`raw_payload.mock`). */
export function SimulatedDataBanner() {
  return (
    <div
      className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100"
      role="status"
    >
      <span className="font-medium">Demo resource metrics. </span>
      Connection counts, balances, and similar numbers are placeholders until
      each provider is integrated in code. Availability, check history, and
      probe status use your real stored data.
    </div>
  );
}
