import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignIn fallback={<div className="animate-pulse">Loading...</div>} />;
}
