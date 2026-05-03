"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { deleteClientCookie, setClientCookie } from "@/lib/client-cookies";
import {
  ACTIVE_PROJECT_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
} from "@/lib/workspace-cookies";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Workspace } from "@/types/database";

export function WorkspaceBootstrap({
  activeWorkspace,
  workspaces,
}: {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
}) {
  const pathname = usePathname();
  const { setWorkspaces, setActiveWorkspace, setActiveProject, setProjects } =
    useWorkspaceStore();

  useEffect(() => {
    setWorkspaces(workspaces);

    if (activeWorkspace) {
      setActiveWorkspace(activeWorkspace);
      setClientCookie(ACTIVE_WORKSPACE_COOKIE, activeWorkspace.id, {
        path: "/",
        maxAge: 31536000,
      });
    } else {
      setActiveProject(null);
      setProjects([]);
      deleteClientCookie(ACTIVE_WORKSPACE_COOKIE);
      deleteClientCookie(ACTIVE_PROJECT_COOKIE);
    }
  }, [
    activeWorkspace,
    setActiveProject,
    setActiveWorkspace,
    setProjects,
    setWorkspaces,
    workspaces,
  ]);

  useEffect(() => {
    const isProjectDetailRoute = /^\/projects\/(?!new(?:\/|$))[^/]+/.test(
      pathname,
    );
    if (!isProjectDetailRoute) {
      setActiveProject(null);
      deleteClientCookie(ACTIVE_PROJECT_COOKIE);
    }
  }, [pathname, setActiveProject]);

  return null;
}
