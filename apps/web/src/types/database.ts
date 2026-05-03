/** Role of the current user in a workspace (from `workspace_members` when listing for the session user). */
export type WorkspaceMemberRole = "owner" | "editor" | "viewer";

/** Row in `workspace_members` (for invites / member management UI). */
export type WorkspaceMember = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  created_at: string;
};

/** Public profile; `id` matches `auth.users.id`. */
export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  id: string;
  name: string;
  /** Current user's role when rows are loaded via membership join. */
  my_role?: WorkspaceMemberRole;
  /** Minutes between health polls for this workspace (DB default 5 after migration). */
  poll_interval_minutes?: number;
  last_health_poll_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Integration = {
  id: string;
  project_id: string;
  service: "neon";
  api_key_enc: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  last_checked: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationCheck = {
  id: string;
  integration_id: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  response_code: number | null;
  error_message: string | null;
  checked_at: string;
};

/** Stored credential blob: legacy plain secret, or JSON `{ v, secret, neonProjectId }` (encrypted as one string). */
export type IntegrationCredentialV1 = {
  v: 1;
  secret: string;
  neonProjectId?: string;
};

export type IntegrationMetric = {
  id: string;
  integration_id: string;
  polled_at: string;
  latency_ms: number | null;
  metrics: ServiceMetrics;
  raw_payload: Record<string, unknown> | null;
};

export type IntegrationIncident = {
  id: string;
  integration_id: string;
  opened_at: string;
  resolved_at: string | null;
  severity: "info" | "warning" | "critical";
  title: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type NeonServiceMetrics = {
  service: "neon";
  projectId: string;
  activeBranches: number;
  computeUsedHours: number;
  storageBytes: number;
  lastBackupAt: string;
};

export type ServiceMetrics = NeonServiceMetrics;

export type NeonEndpointState =
  | "active"
  | "suspended"
  | "provisioning"
  | "unknown";
export type NeonBranchState = "ready" | "init" | "deleted";
export type NeonComputeState = "active" | "suspended";
export type NeonOperationStatus =
  | "finished"
  | "failed"
  | "running"
  | "scheduling";

export type NeonSnapshot = {
  id: string;
  integration_id: string;
  polled_at: string;
  endpoint_state: NeonEndpointState;
  endpoint_count: number;
  autosuspend_delay_s: number | null;
  last_active_at: string | null;
  compute_time_seconds: number;
  active_time_seconds: number;
  cpu_used_sec: number;
  data_storage_bytes_hour: number;
  data_transfer_bytes: number;
  written_data_bytes: number;
  branch_count: number;
  main_branch_id: string | null;
  latency_ms: number | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
};

export type NeonBranch = {
  id: string;
  snapshot_id: string;
  integration_id: string;
  neon_branch_id: string;
  name: string;
  parent_id: string | null;
  is_default: boolean;
  state: NeonBranchState;
  compute_state: NeonComputeState | null;
  created_at_neon: string | null;
  last_reset_at: string | null;
  logical_size_bytes: number | null;
  created_at: string;
};

export type NeonOperation = {
  id: string;
  integration_id: string;
  neon_operation_id: string;
  action: string;
  status: NeonOperationStatus;
  branch_id: string | null;
  endpoint_id: string | null;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  created_at: string;
};

export type NeonCredentials = {
  apiKey: string;
  projectId: string;
};

export type OverviewProjectSummary = {
  id: string;
  name: string;
  integrationCount: number;
  worstStatus: Integration["status"];
  lastChecked: string | null;
};

export type OverviewServiceHealth = {
  service: Integration["service"];
  total: number;
  healthy: number;
};

export type OverviewRecentCheck = {
  integrationId: string;
  projectId: string;
  polledAt: string;
  latencyMs: number | null;
  service: Integration["service"];
  status: Integration["status"];
  projectName: string;
};

export type OverviewChecksTrendPoint = {
  dayKey: string;
  checks: number;
  healthy: number;
};

export type OverviewIncident = {
  id: string;
  integrationId: string;
  title: string;
  severity: "minor" | "major" | "critical";
  status: "open";
  startedAt: string;
  sourceUrl: string | null;
  service: Integration["service"];
  projectName: string;
};

export type WorkspaceOverview = {
  projects: OverviewProjectSummary[];
  integrations: Array<Integration & { projectName: string }>;
  activeIncidents: OverviewIncident[];
  recentChecks: OverviewRecentCheck[];
  checksTrend7d: OverviewChecksTrendPoint[];
  serviceHealth: OverviewServiceHealth[];
  stats: {
    totalProjects: number;
    totalIntegrations: number;
    activeIncidentCount: number;
    availability24h: number;
    availability7d: number;
    totalChecks7d: number;
    checks24h: number;
    checks24hHealthy: number;
    checks7dHealthy: number;
    lastPolledAt: string | null;
  };
};
