import { SidebarInset, SidebarProvider } from "@blenvi/ui/components/sidebar";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AppSidebar } from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { WorkspaceBootstrap } from "@/components/layout/workspace-bootstrap";
import { getWorkspaces } from "@/lib/db/workspaces";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveWorkspace } from "@/lib/workspace-context";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: workspaces } = await getWorkspaces();
  const workspaceList = workspaces ?? [];
  const activeWorkspace = await resolveActiveWorkspace(workspaceList);

  return (
    <SidebarProvider>
      <WorkspaceBootstrap
        workspaces={workspaceList}
        activeWorkspace={activeWorkspace}
      />
      <AppSidebar email={user.email ?? "user@blenvi.dev"} />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
