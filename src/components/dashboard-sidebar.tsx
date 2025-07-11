'use client';

import * as React from 'react';

import { NavIntegrations } from '@/components/nav-integrations';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { mockData, navMain, navSecondary } from '@/constants';

import { Switcher } from './switcher';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTeamId: string;
  activeProjectId: string;
}

export function DashboardSidebar({
  activeTeamId,
  activeProjectId,
  ...props
}: Readonly<DashboardSidebarProps>) {
  const activeTeamProject = mockData.teams.find(team => team.id === activeTeamId);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Switcher activeTeamId={activeTeamId} items={mockData.teams} />
        <Switcher
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          items={activeTeamProject?.project || []}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain activeProjectId={activeProjectId} activeTeamId={activeTeamId} items={navMain} />
        <NavIntegrations
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          items={
            activeTeamProject?.project.find(project => project.id === activeProjectId)
              ?.integrations || []
          }
        />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={mockData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
