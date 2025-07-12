import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import DashboardStateProvider from '@/providers/dashboard-state-provider';

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
}>) {
  // Get slug array or default to empty array
  const slug = (await params).slug || [];
  const teamId = slug[0];
  const projectId = slug[1];
  const routeName = slug[2];

  return (
    <DashboardStateProvider teamId={teamId} projectId={projectId}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <DashboardSidebar activeTeamId={teamId} activeProjectId={projectId} variant="inset" />
        <SidebarInset>
          <SiteHeader route={routeName} />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DashboardStateProvider>
  );
}
