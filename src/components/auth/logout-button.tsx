"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton(props: React.ComponentProps<typeof Button>) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Button
      size={props.size}
      variant={props.variant}
      onClick={logout}
      {...props}
    >
      Logout
    </Button>
  );
}
