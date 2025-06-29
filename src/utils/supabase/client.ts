import { SessionAuthObject } from "@clerk/backend";
import { createBrowserClient } from "@supabase/ssr";

export function createClient({ session }: { session: SessionAuthObject }) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => session?.getToken() ?? null,
    }
  );
}
