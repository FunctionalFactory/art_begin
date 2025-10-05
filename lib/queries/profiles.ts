import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/lib/types";

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(
  userId: string
): Promise<Database.Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile by user ID:", error);
    return null;
  }

  return data;
}

/**
 * Get profile by username
 */
export async function getProfileByUsername(
  username: string
): Promise<Database.Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile by username:", error);
    return null;
  }

  return data;
}

/**
 * Update profile
 */
export async function updateProfile(
  userId: string,
  profileData: {
    username?: string;
    display_name?: string;
    bio?: string;
    profile_image?: string;
    role?: "buyer" | "artist";
  }
): Promise<{ success: boolean; data?: Database.Profile; error?: string }> {
  const supabase = await createClient();

  // Check if username is already taken (if username is being updated)
  if (profileData.username) {
    const existingProfile = await getProfileByUsername(profileData.username);
    if (existingProfile && existingProfile.id !== userId) {
      return {
        success: false,
        error: "이 사용자명은 이미 사용 중입니다.",
      };
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "프로필 업데이트 중 오류가 발생했습니다.",
    };
  }

  return {
    success: true,
    data,
  };
}
