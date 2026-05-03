import { cookies } from "next/headers";

import type { Workspace } from "@/types/database";
import { ACTIVE_WORKSPACE_COOKIE } from "./workspace-cookies";

export {
  ACTIVE_PROJECT_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
} from "./workspace-cookies";

export async function getActiveWorkspaceId() {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null;
}

export async function resolveActiveWorkspace(workspaces: Workspace[]) {
  const activeWorkspaceId = await getActiveWorkspaceId();
  if (!activeWorkspaceId) return workspaces[0] ?? null;

  return (
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0] ??
    null
  );
}
