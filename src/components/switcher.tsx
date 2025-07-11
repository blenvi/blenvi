'use client';

import { type FC, memo, useMemo } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { IconPlus, IconSelector } from '@tabler/icons-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

type Project = {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
};

type Item = {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
  project?: Project[];
};

interface SwitcherProps {
  items: Item[];
  activeTeamId?: string;
  activeProjectId?: string;
}

const DropdownItem: FC<{
  item: Item;
  index: number;
  onClick: () => void;
}> = memo(({ item, index, onClick }) => (
  <DropdownMenuItem onClick={onClick} className="gap-2 p-2">
    <div className="flex size-6 items-center justify-center rounded-sm border">
      <item.logo className="size-4 shrink-0" />
    </div>
    {item.name}
    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
  </DropdownMenuItem>
));

DropdownItem.displayName = 'DropdownItem';

export function Switcher({ items, activeTeamId, activeProjectId }: Readonly<SwitcherProps>) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const activeItem = useMemo(() => {
    return (
      items.find(item => (item.project ? item.id === activeTeamId : item.id === activeProjectId)) ||
      items[0]
    );
  }, [items, activeTeamId, activeProjectId]);

  if (!activeTeamId && !activeProjectId) {
    return null;
  }

  const handleItemSelection = (item: Item) => {
    const pathSegments = pathname.split('/');

    if (item.project && item.project.length > 0) {
      pathSegments[2] = item.id;
      pathSegments[3] = item.project[0].id;
    } else {
      pathSegments[3] = item.id;
    }

    router.push(pathSegments.join('/'));
  };

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
                <span className="truncate font-semibold">{activeItem.name}</span>
                <span className="truncate text-xs">{activeItem.plan}</span>
              </div>
              <IconSelector className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {activeItem.project ? 'Teams' : 'Projects'}
            </DropdownMenuLabel>
            {items.map((item, index) => (
              <DropdownItem
                key={item.id}
                item={item}
                index={index}
                onClick={() => handleItemSelection(item)}
              />
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
