"use client";

import { Button } from "@blenvi/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@blenvi/ui/components/dropdown-menu";
import { ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { getProjectsAction } from "@/actions/projects";
import { deleteClientCookie, setClientCookie } from "@/lib/client-cookies";
import { useWorkspaceStore } from "@/stores/workspace-store";

const ACTIVE_PROJECT_COOKIE = "blenvi-active-project";

export function ProjectSwitcher() {
  const router = useRouter();
  const {
    activeWorkspace,
    projects,
    activeProject,
    setProjects,
    setActiveProject,
  } = useWorkspaceStore();
  const activeWorkspaceId = activeWorkspace?.id;
  const activeProjectId = activeProject?.id;

  useEffect(() => {
    const loadProjects = async () => {
      if (!activeWorkspaceId) return;
      const result = await getProjectsAction(activeWorkspaceId);
      const nextProjects = result.data ?? [];
      setProjects(nextProjects);

      if (
        activeProjectId &&
        !nextProjects.some((project) => project.id === activeProjectId)
      ) {
        setActiveProject(null);
        deleteClientCookie(ACTIVE_PROJECT_COOKIE);
      }
    };
    void loadProjects();
  }, [activeProjectId, activeWorkspaceId, setActiveProject, setProjects]);

  const projectLabel = useMemo(() => {
    if (!activeProject) return "Select project";
    return activeProject.name;
  }, [activeProject]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">{projectLabel}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        {projects.length === 0 ? (
          <DropdownMenuItem disabled>No projects in workspace</DropdownMenuItem>
        ) : null}
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => {
              setActiveProject(project);
              setClientCookie(ACTIVE_PROJECT_COOKIE, project.id, {
                path: "/",
                maxAge: 31536000,
              });
              router.push(`/projects/${project.id}`);
            }}
          >
            {project.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
