"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { IconPlus, IconSelector } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Switcher({
  items,
  activeTeamId,
  activeProjectId,
}: Readonly<{
  items: {
    id: string;
    name: string;
    logo: React.ElementType;
    plan: string;
    project?: {
      id: string;
      name: string;
      logo: React.ElementType;
      plan: string;
    }[];
  }[];
  activeTeamId?: string;
  activeProjectId?: string;
}>) {
  const { isMobile } = useSidebar();
  const [activeItem, setActiveItem] = useState(
    () =>
      items.find((item) =>
        item.project ? item.id === activeTeamId : item.id === activeProjectId
      ) || items[0]
  );
  const router = useRouter();
  if (!activeTeamId && !activeProjectId) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeItem.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeItem.name}
                </span>
                <span className="truncate text-xs">{activeItem.plan}</span>
              </div>
              <IconSelector className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {items.map((item, index) => (
              <DropdownMenuItem
                key={item.name}
                onClick={() => {
                  setActiveItem(item);
                  if (item.project) {
                    router.push(
                      `/dashboard/${item.id}/${item.project?.[0]?.id}`
                    );
                  } else {
                    router.push(`/dashboard/${activeTeamId}/${item.id}`);
                  }
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <item.logo className="size-4 shrink-0" />
                </div>
                {item.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <IconPlus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
