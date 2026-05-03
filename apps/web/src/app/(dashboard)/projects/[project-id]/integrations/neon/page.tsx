import { redirect } from "next/navigation";

import { neonIntegrationSectionPath } from "@/lib/navigation/neon-integration-nav";

export default async function NeonIntegrationPage({
  params,
}: Readonly<{
  params: Promise<{ "project-id": string }>;
}>) {
  const { "project-id": projectId } = await params;
  redirect(neonIntegrationSectionPath(projectId, "overview"));
}
