import type {
  NeonBranchState,
  NeonComputeState,
  NeonEndpointState,
  NeonOperationStatus,
} from "@/types/database";

export type NeonApiProject = {
  id: string;
  name: string;
  region_id: string;
  pg_version: number;
  created_at: string;
  updated_at: string;
  store_passwords: boolean;
  provisioner: "k8s-pod" | "k8s-neonvm";
  default_endpoint_settings: {
    autosuspend_duration_seconds: number;
  };
};

export type NeonApiEndpoint = {
  id: string;
  project_id: string;
  branch_id: string;
  type: string;
  current_state: "active" | "idle" | "stopped";
  pending_state: "active" | "idle" | null;
  settings: {
    autosuspend_duration_seconds: number;
    pg_settings: Record<string, string>;
  };
  host: string;
  created_at: string;
  updated_at: string;
  last_active: string | null;
};

export type NeonApiConsumptionPeriod = {
  period_id: string;
  date: string;
  consumption: {
    compute_time_seconds: number;
    active_time_seconds: number;
    cpu_used_sec: number;
    data_storage_bytes_hour: number;
    data_transfer_bytes: number;
    written_data_bytes: number;
  };
};

export type NeonApiConsumption = {
  project_id: string;
  periods: NeonApiConsumptionPeriod[];
};

export type NeonApiBranch = {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  default: boolean;
  current_state: NeonBranchState;
  creation_source: string;
  primary: boolean;
  logical_size: number | null;
  created_at: string;
  updated_at: string;
  endpoints?: Array<{
    id: string;
    current_state: "active" | "idle" | "stopped";
  }>;
};

export type NeonApiOperation = {
  id: string;
  project_id: string;
  branch_id: string | null;
  endpoint_id: string | null;
  action: string;
  status: NeonOperationStatus;
  failures_count: number;
  error?: string;
  created_at: string;
  updated_at: string;
};

export type NeonProjectResponse = { project: NeonApiProject };
export type NeonEndpointsResponse = { endpoints: NeonApiEndpoint[] };
export type NeonBranchesResponse = { branches: NeonApiBranch[] };
export type NeonOperationsResponse = { operations: NeonApiOperation[] };
export type NeonConsumptionHistoryResponse = {
  projects: NeonApiConsumption[];
};

export type NormalizedEndpointState = NeonEndpointState;
export type NormalizedComputeState = NeonComputeState;
