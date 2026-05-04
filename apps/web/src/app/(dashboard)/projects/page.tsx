"use client";

import { Button } from "@blenvi/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@blenvi/ui/components/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getProjectsAction } from "@/actions/projects";
import PageContainer from "@/components/layouts/page-container";
import { ROUTE_PATHS } from "@/constants";
import { setClientCookie } from "@/lib/client-cookies";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export default function ProjectsPage() {
  const router = useRouter();
  const {
    activeWorkspace,
    projects,
    setProjects,
    setActiveProject,
    setLoading,
    isLoading,
  } = useWorkspaceStore();

  useEffect(() => {
    const load = async () => {
      if (!activeWorkspace) return;
      setLoading(true);
      const result = await getProjectsAction(activeWorkspace.id);
      if (result.data) setProjects(result.data);
      setLoading(false);
    };
    void load();
  }, [activeWorkspace, setLoading, setProjects]);

  if (!activeWorkspace) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a workspace to view projects.
      </p>
    );
  }

  return (
    <PageContainer
      pageTitle="Projects"
      pageDescription={`Workspace: ${activeWorkspace.name}`}
      pageHeaderAction={
        <Button onClick={() => router.push(ROUTE_PATHS.newProject)}>
          New project
        </Button>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading projects...</p>
        ) : null}

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              No projects yet.
            </p>
            <Button onClick={() => router.push(ROUTE_PATHS.newProject)}>
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardAction>
                    {" "}
                    <Button
                      onClick={() => {
                        setActiveProject(project);
                        setClientCookie("blenvi-active-project", project.id, {
                          path: "/",
                          maxAge: 31536000,
                        });
                        router.push(ROUTE_PATHS.project(project.id));
                      }}
                    >
                      Open
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {project.description?.slice(0, 120) ?? "No description"}
                  </p>
                  <p>
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
