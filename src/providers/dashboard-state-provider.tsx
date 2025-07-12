'use client';

import { useEffect } from 'react';

import { useWorkspaceStore } from '@/stores/workspace';

export default function DashboardStateProvider({
  teamId,
  projectId,
  children,
}: Readonly<{
  teamId?: string;
  projectId?: string;
  children: React.ReactNode;
}>) {
  const { initialize } = useWorkspaceStore();

  // Initialize the store with URL params on component mount
  useEffect(() => {
    initialize(teamId, projectId);
  }, [teamId, projectId, initialize]);

  return <>{children}</>;
}
