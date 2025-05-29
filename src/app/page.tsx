import { redirect } from "next/navigation";

export default function Home() {
  const teamId = "1";
  const projectId = "2";
  redirect(`/dashboard/${teamId}/${projectId}`);
}
