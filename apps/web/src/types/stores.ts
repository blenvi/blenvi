import type { Project, Workspace } from "./database";

export type WorkspaceStoreState = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
};

export type WorkspaceStoreActions = {
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export type WorkspaceStore = WorkspaceStoreState & WorkspaceStoreActions;
