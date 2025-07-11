import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { IconBook } from '@tabler/icons-react';
import { ModeToggle } from './theme-toggle';

export function SiteHeader({ route }: Readonly<{ route?: string }>) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium capitalize">{route ?? 'overview'}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <a href="https://blenvi-docs.netlify.app" target="_blank" rel="noopener noreferrer">
              <IconBook className="size-4" />
              <span className="sr-only">Documentation</span>
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
