import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp fallback={<div className="animate-pulse">Loading...</div>} />;
}
