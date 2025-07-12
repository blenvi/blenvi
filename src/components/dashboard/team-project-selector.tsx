'use client';

import Link from 'next/link';

import {
  IconAlertCircle,
  IconChevronRight,
  IconCircleCheck,
  IconFolderOpen,
  IconUsers,
} from '@tabler/icons-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkspaceStore, Team, Project } from '@/stores/workspace';

export default function TeamProjectSelector() {
  // Get state and actions from Zustand store
  const { teams, projects, selectedTeam, selectedProject, selectTeam, selectProject } =
    useWorkspaceStore();

  const handleTeamSelect = (team: Team) => {
    selectTeam(team.id);
  };

  const handleProjectSelect = (project: Project) => {
    selectProject(project.id);
  };

  const renderTeamSelection = () => {
    if (teams.length === 0) {
      return (
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            No teams available. Contact your administrator to get access to a team.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {teams.map(team => (
          <Card
            key={team.id}
            className={`hover:bg-primary/5 cursor-pointer transition-colors ${
              selectedTeam?.id === team.id && 'border-primary bg-primary/5'
            }`}
            onClick={() => handleTeamSelect(team)}
            aria-pressed={selectedTeam?.id === team.id}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTeamSelect(team);
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {team.name}
                    {selectedTeam?.id === team.id && (
                      <IconCircleCheck className="text-primary h-4 w-4" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">{team.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <IconUsers className="h-3 w-3" />
                  <span>{team.project?.length || 0} projects</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {team.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderProjectSelection = () => {
    if (!selectedTeam) {
      return (
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a team first to view available projects.
          </AlertDescription>
        </Alert>
      );
    }

    const teamProjects = selectedTeam ? projects[selectedTeam.id] || [] : [];

    if (teamProjects.length === 0) {
      return (
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            No projects found in {selectedTeam.name}. Create a new project to get started.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {teamProjects.map(project => (
          <Card
            key={project.id}
            className={`hover:bg-primary/5 cursor-pointer transition-colors ${
              selectedProject?.id === project.id && 'border-primary bg-primary/5'
            }`}
            onClick={() => handleProjectSelect(project)}
            tabIndex={0}
            aria-pressed={selectedProject?.id === project.id}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProjectSelect(project);
              }
            }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {project.name}
                {selectedProject?.id === project.id && (
                  <IconCircleCheck className="text-primary h-4 w-4" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{project.status}</Badge>
                  {project.framework && (
                    <Badge variant="secondary" className="text-xs">
                      {project.framework}
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">{project.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 lg:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="scroll-m-20 text-3xl font-medium tracking-tight">Select Your Workspace</h1>
        <p className="leading-7 [&:not(:first-child)]:mt-2">
          Select a team and project to start working. You can create new teams and projects if
          needed.
        </p>
      </div>

      <div className="space-y-8">
        {/* Team Selection */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <IconUsers className="text-muted-foreground h-5 w-5" />
            <h2 className="text-xl font-semibold">Select Team</h2>
          </div>

          {renderTeamSelection()}
        </section>

        {/* Project Selection */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <IconFolderOpen className="text-muted-foreground h-5 w-5" />
            <h2 className="text-xl font-semibold">Select Project</h2>
            {selectedTeam && (
              <span className="text-muted-foreground text-sm">from {selectedTeam.name}</span>
            )}
          </div>

          {renderProjectSelection()}
        </section>

        {/* Continue Button */}
        <div className="flex justify-end border-t pt-6">
          <Button disabled={!selectedTeam || !selectedProject} size="lg" asChild>
            <Link
              href={`/dashboard/${selectedTeam?.id}/${selectedProject?.id}`}
              className="flex items-center justify-center"
            >
              Continue
              <IconChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedTeam || selectedProject) && (
        <div className="bg-muted/50 mt-8 rounded-lg p-4">
          <h3 className="mb-2 font-medium">Current Selection:</h3>
          <div className="text-muted-foreground space-y-1 text-sm">
            {selectedTeam && (
              <div className="flex items-center gap-2">
                Team: <span className="text-foreground font-medium">{selectedTeam.name}</span>
                <Badge variant="outline" className="ml-1">
                  {selectedTeam.plan}
                </Badge>
              </div>
            )}
            {selectedProject && (
              <div className="flex items-center gap-2">
                Project: <span className="text-foreground font-medium">{selectedProject.name}</span>
                <Badge variant="outline" className="ml-1">
                  {selectedProject.plan}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
