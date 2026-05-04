"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { POLLING_LIMITS } from "@/constants";
import type { Workspace } from "@/types/database";
import type { WorkspaceStore } from "@/types/stores";

const EMPTY_WORKSPACE = {
  my_role: undefined as Workspace["my_role"],
  poll_interval_minutes: POLLING_LIMITS.defaultWorkspacePollIntervalMinutes,
  last_health_poll_at: null as string | null,
  created_at: "",
  updated_at: "",
};

const EMPTY_PROJECT = {
  workspace_id: "",
  description: null,
  created_at: "",
  updated_at: "",
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    immer((set) => ({
      workspaces: [],
      activeWorkspace: null,
      projects: [],
      activeProject: null,
      isLoading: false,
      setWorkspaces: (workspaces) => {
        set((state) => {
          state.workspaces = workspaces;
        });
      },
      setActiveWorkspace: (workspace) => {
        set((state) => {
          state.activeWorkspace = workspace;
        });
      },
      setProjects: (projects) => {
        set((state) => {
          state.projects = projects;
        });
      },
      setActiveProject: (project) => {
        set((state) => {
          state.activeProject = project;
        });
      },
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
      reset: () => {
        set((state) => {
          state.workspaces = [];
          state.activeWorkspace = null;
          state.projects = [];
          state.activeProject = null;
          state.isLoading = false;
        });
      },
    })),
    {
      name: "blenvi-workspace",
      partialize: (state) => ({
        activeWorkspace: state.activeWorkspace
          ? {
              id: state.activeWorkspace.id,
              name: state.activeWorkspace.name,
              ...EMPTY_WORKSPACE,
            }
          : null,
        activeProject: state.activeProject
          ? {
              id: state.activeProject.id,
              name: state.activeProject.name,
              ...EMPTY_PROJECT,
            }
          : null,
      }),
    },
  ),
);
