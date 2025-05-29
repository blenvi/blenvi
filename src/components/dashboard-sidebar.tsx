"use client";

import * as React from "react";
import {
  IconBinoculars,
  IconBrandAuth0,
  IconBrandPrisma,
  IconBrandSupabase,
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconGitFork,
  IconHelp,
  IconSearch,
  IconSettings,
  IconTool,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Switcher } from "./switcher";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatar.svg",
  },
  teams: [
    {
      id: "1",
      name: "Personal Workspace",
      logo: IconUser,
      plan: "Free",
      project: [
        {
          id: "1",
          name: "Project 1",
          logo: IconBinoculars,
          plan: "Free",
        },
        {
          id: "2",
          name: "Project 2",
          logo: IconBinoculars,
          plan: "Free",
        },
        {
          id: "3",
          name: "Project 3",
          logo: IconBinoculars,
          plan: "Free",
        },
      ],
    },
    {
      id: "2",
      name: "Team Workspace",
      logo: IconUsersGroup,
      plan: "Pro",
      project: [
        {
          id: "4",
          name: "Project 4",
          logo: IconBinoculars,
          plan: "Free",
        },
        {
          id: "5",
          name: "Project 5",
          logo: IconBinoculars,
          plan: "Free",
        },
        {
          id: "6",
          name: "Project 6",
          logo: IconBinoculars,
          plan: "Free",
        },
      ],
    },
    {
      id: "3",
      name: "Enterprise Workspace",
      logo: IconUsersGroup,
      plan: "Enterprise",
      project: [
        {
          id: "7",
          name: "Project 7",
          logo: IconBinoculars,
          plan: "Free",
        },
        {
          id: "8",
          name: "Project 8",
          logo: IconBinoculars,
          plan: "Free",
        },
        {
          id: "9",
          name: "Project 9",
          logo: IconBinoculars,
          plan: "Free",
        },
      ],
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/1/2",
      icon: IconBinoculars,
    },
    {
      title: "Team",
      url: "/dashboard/1/2/team",
      icon: IconUsersGroup,
    },
    {
      title: "Workflow",
      url: "/dashboard/1/2/workflow",
      icon: IconGitFork,
    },
    {
      title: "Configure",
      url: "/dashboard/1/2/configure",
      icon: IconTool,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Auth0",
      url: "#",
      icon: IconBrandAuth0,
    },
    {
      name: "Supabase",
      url: "#",
      icon: IconBrandSupabase,
    },
    {
      name: "Prisma",
      url: "#",
      icon: IconBrandPrisma,
    },
  ],
};

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTeamId?: string;
  activeProjectId?: string;
}

export function DashboardSidebar({
  activeTeamId,
  activeProjectId,
  ...props
}: Readonly<DashboardSidebarProps>) {
  const activeTeamProject = data.teams.find((team) => team.id === activeTeamId);
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Switcher activeTeamId={activeTeamId} items={data.teams} />
        <Switcher
          activeProjectId={activeProjectId}
          activeTeamId={activeTeamId}
          items={activeTeamProject?.project || []}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
