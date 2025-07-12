'use client';

import * as React from 'react';
import { useEffect } from 'react';

import { NavIntegrations } from '@/components/nav-integrations';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { mockData, navMain, navSecondary } from '@/constants';
import { useWorkspaceStore } from '@/stores/workspace';

import { Switcher } from './switcher';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTeamId?: string;
  activeProjectId?: string;
}

export function DashboardSidebar({
  activeTeamId,
  activeProjectId,
  ...props
}: Readonly<DashboardSidebarProps>) {
  // Get store data and initialize with URL params
  const { teams, projects, selectedTeam, initialize } = useWorkspaceStore();

  // Initialize the store with URL params on component mount
  useEffect(() => {
    if (activeTeamId) {
      initialize(activeTeamId, activeProjectId);
    }
  }, [activeTeamId, activeProjectId, initialize]);

  // Find projects for the active team
  const teamProjects = selectedTeam?.id ? projects[selectedTeam.id] || [] : [];

  // Find integrations for the active project
  const projectIntegrations =
    selectedTeam?.project?.find(project => project.id === activeProjectId)?.integrations || [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Switcher activeTeamId={activeTeamId} items={teams} />
        <Switcher
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          items={teamProjects}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain activeProjectId={activeProjectId} activeTeamId={activeTeamId} items={navMain} />
        <NavIntegrations
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          items={projectIntegrations}
        />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={mockData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
