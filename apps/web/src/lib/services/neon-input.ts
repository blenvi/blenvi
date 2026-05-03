/** Neon Console HTTP API uses an API key — not your Postgres connection string or DB password. */
export function looksLikePostgresConnectionString(input: string): boolean {
  const s = input.trim().toLowerCase();
  return s.startsWith("postgresql://") || s.startsWith("postgres://");
}

export function validateNeonConsoleCredentials(
  apiKey: string,
  projectId: string,
): string | null {
  const key = apiKey.trim();
  const pid = projectId.trim();
  if (!key || !pid) return "Neon API key and project ID are required.";
  if (looksLikePostgresConnectionString(key)) {
    return (
      "That value looks like a database connection string. Use a Neon Console API key instead " +
      "(Dashboard → Account settings → API keys). The poller calls console.neon.tech, not Postgres directly."
    );
  }
  return null;
}
