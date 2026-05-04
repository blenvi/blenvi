import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

import type { Result } from "./types";

function mapError(message: string) {
  return message || "Something went wrong";
}

export async function getMyProfile(): Promise<Result<Profile>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { data: null, error: mapError("Failed to load profile") };

  if (!data) {
    const empty: Profile = {
      id: user.id,
      display_name: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { data: empty, error: null };
  }

  return { data: data as Profile, error: null };
}

export async function upsertMyProfile(
  patch: Pick<Profile, "display_name" | "avatar_url">,
): Promise<Result<Profile>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Not authenticated" };

  const row = {
    id: user.id,
    display_name: patch.display_name ?? null,
    avatar_url: patch.avatar_url ?? null,
  };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: row.display_name,
        avatar_url: row.avatar_url,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error)
      return { data: null, error: mapError("Failed to update profile") };
    return { data: data as Profile, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: row.id,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: mapError("Failed to create profile") };
  return { data: data as Profile, error: null };
}
