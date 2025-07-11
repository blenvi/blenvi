import IntegrationPage from '@/components/pages/integration';
import OverviewPage from '@/components/pages/overview-page';
import TeamPage from '@/components/pages/team-page';
import WorkflowPage from '@/components/pages/workflow-page';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default async function DashboardPage({
  params,
}: Readonly<{
  params: Promise<{ slug?: string[] }>;
}>) {
  const slug = (await params).slug || [];

  const teamId = slug[0];
  const projectId = slug[1];
  const route = slug[2];
  const integrationSlug = slug[3];

  // Validate IDs
  if (!teamId || !projectId) {
    return notFound();
  }

  switch (route) {
    case undefined:
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <OverviewPage />
        </Suspense>
      );
    case 'team':
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <TeamPage />
        </Suspense>
      );
    case 'workflow':
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <WorkflowPage />
        </Suspense>
      );
    case 'integration':
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <IntegrationPage integrationSlug={integrationSlug} />
        </Suspense>
      );
    default:
      return notFound();
  }
}
