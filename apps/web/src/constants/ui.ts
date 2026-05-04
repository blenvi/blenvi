export const INTEGRATION_SERVICES = {
  neon: "neon",
} as const;

export const POLL_MODES = {
  soft: "soft",
  hard: "hard",
} as const;

export const SERVICE_LABELS = {
  neon: "Neon",
} as const;

export const SERVICE_INITIALS = {
  neon: "NE",
} as const;

export const POLLING_LIMITS = {
  provisioningStaleMs: 5 * 60 * 1000,
  healthRequestTimeoutMs: 8_000,
  healthMaxRetries: 2,
  operationsLimit: 50,
  manualPollCooldownMs: 60_000,
  staleIntegrationThresholdMinutes: 30,
  storageHoursPerMonth: 720,
  hoursPerDay: 24,
  minutesPerHour: 60,
  daysPerWeek: 7,
  daysPerMonth: 30,
  defaultWorkspacePollIntervalMinutes: 5,
} as const;

export const TIME_MS = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
} as const;

export const UI_TEXT = {
  auth: {
    notAuthenticated: "Not authenticated",
    forbidden: "Forbidden",
  },
  neon: {
    alreadyConnected: "Neon is already connected to this project.",
    invalidPollMode: "Poll mode must be soft or hard.",
    credentialsRequired: "Neon API key and project ID are required",
    credentialsReadFailed:
      "Stored credentials could not be read. Enter a new API key.",
    credentialsDecryptFailed: "Failed to decrypt Neon credentials",
  },
  polling: {
    softChecking: "Checking...",
    softCheck: "Soft check",
    hardRefreshing: "Refreshing...",
    hardRefresh: "Hard refresh",
    rateLimited: "Rate limited. Retry after 60 seconds.",
  },
} as const;
