"use server";

import { revalidatePath } from "next/cache";

import { upsertMyProfile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";
import {
  type UpdateProfileInput,
  updateProfileSchema,
} from "@/lib/validations/profile";

export async function updateProfileAction(input: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success)
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };

  const body = parsed.data as UpdateProfileInput;
  const displayName = body.display_name.trim() || null;
  const avatarUrl = body.avatar_url.trim() || null;
  const result = await upsertMyProfile({
    display_name: displayName,
    avatar_url: avatarUrl,
  });

  if (!result.error) {
    revalidatePath("/settings/account");
  }
  return result;
}
