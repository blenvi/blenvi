import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
}>) {
  const slug = (await params).slug || [];

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <DashboardSidebar activeTeamId={slug[0]} activeProjectId={slug[1]} variant="inset" />
      <SidebarInset>
        <SiteHeader route={slug[2]} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
