import { Hero } from '@/components/landing';

export default function Home() {
  const teamId = '550e8400-e29b-41d4-a716-446655440000';
  const projectId = '67e55044-10b1-426f-9247-bb680e5fe0c8';
  return <Hero teamId={teamId} projectId={projectId} />;
}
