import { createClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/services/db/profiles";

import { AccountSettingsForm } from "./account-settings-form";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await getMyProfile();

  return (
    <AccountSettingsForm
      email={user?.email ?? ""}
      initialDisplayName={profile?.display_name ?? ""}
      initialAvatarUrl={profile?.avatar_url ?? ""}
    />
  );
}
