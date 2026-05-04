"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@blenvi/ui/components/sidebar";
import {
  BellIcon,
  LayoutDashboardIcon,
  LogsIcon,
  PlugIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  NEON_INTEGRATION_SECTIONS,
  neonIntegrationSectionPath,
  ROUTE_PATHS,
} from "@/constants";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export function NavProject() {
  const pathname = usePathname();
  const { activeProject } = useWorkspaceStore();

  if (!activeProject) return null;

  const projectId = activeProject.id;
  const base = ROUTE_PATHS.project(projectId);
  const items = [
    {
      label: "Dashboard",
      href: base,
      icon: LayoutDashboardIcon,
    },
    {
      label: "Alerts",
      href: ROUTE_PATHS.projectAlerts(projectId),
      icon: BellIcon,
    },
    { label: "Logs", href: ROUTE_PATHS.projectLogs(projectId), icon: LogsIcon },
    {
      label: "Settings",
      href: ROUTE_PATHS.projectSettings(projectId),
      icon: SettingsIcon,
    },
  ];
  const integrationsRootHref = ROUTE_PATHS.projectIntegrations(projectId);
  const integrationGroups = [
    {
      label: "Neon",
      pages: NEON_INTEGRATION_SECTIONS.map((section) => ({
        label: section.label,
        href: neonIntegrationSectionPath(projectId, section.value),
      })),
    },
  ];

  function navActive(href: string): boolean {
    if (href === base) {
      return pathname === base;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const integrationsActive = pathname.startsWith(`${integrationsRootHref}`);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={navActive(item.href)}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={integrationsActive}>
            <Link href={integrationsRootHref}>
              <PlugIcon />
              <span>Integrations</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {integrationGroups.map((group) => (
              <Fragment key={group.label}>
                <SidebarMenuSubItem>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {group.label}
                  </div>
                </SidebarMenuSubItem>
                {group.pages.map((page) => (
                  <SidebarMenuSubItem key={page.href}>
                    <SidebarMenuSubButton
                      asChild
                      size="sm"
                      isActive={pathname === page.href}
                    >
                      <Link href={page.href}>
                        <span>{page.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </Fragment>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
