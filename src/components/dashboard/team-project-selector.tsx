'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  IconAlertCircle,
  IconChevronRight,
  IconCircleCheck,
  IconFolderOpen,
  IconUsers,
} from '@tabler/icons-react';

// Mock data structure
interface Team {
  id: string;
  name: string;
  description: string;
  role: string;
  memberCount: number;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  lastUpdated: string;
  framework?: string;
}

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    description: 'Main company workspace',
    role: 'Owner',
    memberCount: 12,
  },
  {
    id: '2',
    name: 'Design Team',
    description: 'Creative projects and design systems',
    role: 'Admin',
    memberCount: 5,
  },
  {
    id: '3',
    name: 'Personal',
    description: 'Your personal projects',
    role: 'Owner',
    memberCount: 1,
  },
];

const mockProjects: Record<string, Project[]> = {
  '1': [
    {
      id: 'p1',
      name: 'Marketing Website',
      description: 'Company marketing site built with Next.js',
      status: 'active',
      lastUpdated: '2 hours ago',
      framework: 'Next.js',
    },
    {
      id: 'p2',
      name: 'Dashboard App',
      description: 'Internal analytics dashboard',
      status: 'active',
      lastUpdated: '1 day ago',
      framework: 'React',
    },
    {
      id: 'p3',
      name: 'API Gateway',
      description: 'Microservices API gateway',
      status: 'inactive',
      lastUpdated: '1 week ago',
      framework: 'Node.js',
    },
  ],
  '2': [
    {
      id: 'p4',
      name: 'Design System',
      description: 'Component library and design tokens',
      status: 'active',
      lastUpdated: '3 hours ago',
      framework: 'Storybook',
    },
    {
      id: 'p5',
      name: 'Brand Guidelines',
      description: 'Brand assets and style guide',
      status: 'active',
      lastUpdated: '2 days ago',
    },
  ],
  '3': [
    {
      id: 'p6',
      name: 'Portfolio Site',
      description: 'Personal portfolio website',
      status: 'active',
      lastUpdated: '5 hours ago',
      framework: 'Next.js',
    },
  ],
};

export default function TeamProjectSelector() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [teams] = useState<Team[]>(mockTeams);

  useEffect(() => {
    if (selectedTeam) {
      setIsLoadingProjects(true);
      setSelectedProject(null);
      setTimeout(() => {
        setProjects(mockProjects[selectedTeam.id] || []);
        setIsLoadingProjects(false);
      }, 500);
    } else {
      setProjects([]);
      setSelectedProject(null);
    }
  }, [selectedTeam]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleContinue = () => {
    if (selectedTeam && selectedProject) {
      // Navigate to next step
      console.log('Continuing with:', {
        team: selectedTeam,
        project: selectedProject,
      });
      alert(`Continuing with ${selectedTeam.name} - ${selectedProject.name}`);
    }
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
                  <span>{team.memberCount} members</span>
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

    if (isLoadingProjects) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (projects.length === 0) {
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
        {projects.map(project => (
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
          <Button
            onClick={handleContinue}
            disabled={!selectedTeam || !selectedProject}
            size="lg"
            className="min-w-32"
          >
            Continue
            <IconChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedTeam || selectedProject) && (
        <div className="bg-muted/50 mt-8 rounded-lg p-4">
          <h3 className="mb-2 font-medium">Current Selection:</h3>
          <div className="text-muted-foreground space-y-1 text-sm">
            {selectedTeam && (
              <div>
                Team: <span className="text-foreground font-medium">{selectedTeam.name}</span>
              </div>
            )}
            {selectedProject && (
              <div>
                Project: <span className="text-foreground font-medium">{selectedProject.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
