import { Separator } from "@blenvi/ui/components/separator";
import { SidebarTrigger } from "@blenvi/ui/components/sidebar";
import { Breadcrumbs } from "@/components/layouts/breadcrumbs";

export default function Header() {
  return (
    <header className="bg-background/60 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 backdrop-blur-md md:h-14">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumbs />
      </div>
    </header>
  );
}
