"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@blenvi/ui/components/sidebar";
import {
  BookOpenIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavProject } from "./nav-project";
import { ProjectSwitcher } from "./project-switcher";
import { UserMenu } from "./user-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";

const workspaceItems = [
  { label: "Overview", href: "/overview", icon: LayoutDashboardIcon },
  { label: "Projects", href: "/projects", icon: FolderKanbanIcon },
  { label: "Team", href: "/team", icon: UsersIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

export function AppSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const docsUrl = process.env.NEXT_PUBLIC_DOCS_URL;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {workspaceItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    item.href.startsWith("/settings")
                      ? pathname.startsWith("/settings")
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                  }
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <ProjectSwitcher />
        </SidebarGroup>
        <NavProject />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {docsUrl ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href={docsUrl} target="_blank" rel="noreferrer">
                  <BookOpenIcon />
                  <span>Docs</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/changelog"}>
              <Link href="/changelog">
                <ScrollTextIcon />
                <span>Changelog</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserMenu email={email} />
      </SidebarFooter>
    </Sidebar>
  );
}
