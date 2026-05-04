"use client";

import { useEffect } from "react";

import { setClientCookie } from "@/lib/client-cookies";
import {
  ACTIVE_PROJECT_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
} from "@/lib/workspace-cookies";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import type { Project, Workspace } from "@/types/database";

export function ProjectContextSync({
  project,
  workspace,
}: {
  project: Project;
  workspace: Workspace;
}) {
  const { setActiveProject, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    setActiveWorkspace(workspace);
    setActiveProject(project);
    setClientCookie(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
      path: "/",
      maxAge: 31536000,
    });
    setClientCookie(ACTIVE_PROJECT_COOKIE, project.id, {
      path: "/",
      maxAge: 31536000,
    });
  }, [project, setActiveProject, setActiveWorkspace, workspace]);

  return null;
}
