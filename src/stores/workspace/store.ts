import { create } from 'zustand';

import { mockData } from '@/constants';

// Helper function to determine role based on plan
const getRoleBasedOnPlan = (plan: string): string => {
  if (plan === 'Free') return 'Owner';
  if (plan === 'Pro') return 'Admin';
  return 'Member';
};

export interface Team {
  id: string;
  name: string;
  plan: string;
  project: Project[];
  description?: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  plan: string;
  integrations: Integration[];
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  lastUpdated?: string;
  framework?: string;
}

export interface Integration {
  name: string;
  slug: string;
  icon: React.FC<{ className?: string }>;
}

interface WorkspaceState {
  // Teams data
  teams: Team[];
  projects: Record<string, Project[]>;

  // Selected entities
  selectedTeamId: string | null;
  selectedProjectId: string | null;

  // Computed properties
  selectedTeam: Team | null;
  selectedProject: Project | null;

  // Actions
  selectTeam: (_teamId: string) => void;
  selectProject: (_projectId: string) => void;
  initialize: (_teamId?: string, _projectId?: string) => void;
}

// Process mock data to enhance with UI-friendly fields
const enhancedTeams = mockData.teams.map(team => ({
  ...team,
  description: `${team.name} (${team.plan} plan)`,
  role: getRoleBasedOnPlan(team.plan),
}));

// Create projects lookup map
const enhancedProjects: Record<string, Project[]> = {};
mockData.teams.forEach(team => {
  enhancedProjects[team.id] = team.project.map(project => ({
    ...project,
    description: `${project.name} (${project.plan})`,
    status: 'active',
    lastUpdated: `${Math.floor(Math.random() * 24)} hours ago`,
    framework: ['Next.js', 'React', 'Node.js', 'TypeScript'][Math.floor(Math.random() * 4)],
  }));
});

// Create the store
export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Initial state
  teams: enhancedTeams,
  projects: enhancedProjects,
  selectedTeamId: null,
  selectedProjectId: null,
  selectedTeam: null,
  selectedProject: null,

  // Actions
  selectTeam: (teamId: string) => {
    const teams = get().teams;
    const selectedTeam = teams.find(team => team.id === teamId) || null;

    set({
      selectedTeamId: teamId,
      selectedTeam,
      selectedProjectId: null,
      selectedProject: null,
    });
  },

  selectProject: (projectId: string) => {
    const { selectedTeamId, projects } = get();
    if (!selectedTeamId) return;

    const teamProjects = projects[selectedTeamId] || [];
    const selectedProject = teamProjects.find(project => project.id === projectId) || null;

    set({ selectedProjectId: projectId, selectedProject });
  },

  initialize: (teamId?: string, projectId?: string) => {
    const { teams, projects } = get();

    // If teamId is provided, select that team
    if (teamId) {
      const selectedTeam = teams.find(team => team.id === teamId) || null;
      set({ selectedTeamId: teamId, selectedTeam });

      // If projectId is provided and belongs to the selected team, select that project
      if (projectId && selectedTeam) {
        const teamProjects = projects[teamId] || [];
        const selectedProject = teamProjects.find(project => project.id === projectId) || null;

        if (selectedProject) {
          set({ selectedProjectId: projectId, selectedProject });
        }
      }
    }
  },
}));
