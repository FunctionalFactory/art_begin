"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  updateProfile as updateProfileQuery,
  getArtistByUserId,
  createArtist,
  updateArtist,
} from "@/lib/queries";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "로그인이 필요합니다.",
    };
  }

  // Extract form data
  const username = formData.get("username") as string | null;
  const displayName = formData.get("display_name") as string | null;
  const bio = formData.get("bio") as string | null;
  const profileImage = formData.get("profile_image") as string | null;
  const role = formData.get("role") as "buyer" | "artist" | null;

  // Validate username format if provided
  if (username && username.trim() !== "") {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return {
        success: false,
        error:
          "사용자명은 영문, 숫자, 언더스코어(_), 하이픈(-)만 사용할 수 있습니다.",
      };
    }

    if (username.length < 3 || username.length > 30) {
      return {
        success: false,
        error: "사용자명은 3-30자 사이여야 합니다.",
      };
    }
  }

  // Prepare update data
  const updateData: {
    username?: string;
    display_name?: string;
    bio?: string;
    profile_image?: string;
    role?: "buyer" | "artist";
  } = {};

  if (username && username.trim() !== "") {
    updateData.username = username.trim();
  }
  if (displayName !== null) {
    updateData.display_name = displayName.trim() || undefined;
  }
  if (bio !== null) {
    updateData.bio = bio.trim() || undefined;
  }
  if (profileImage !== null) {
    updateData.profile_image = profileImage.trim() || undefined;
  }
  if (role) {
    updateData.role = role;
  }

  // Update profile
  const result = await updateProfileQuery(user.id, updateData);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  // If role is artist, create or update artist record
  if (updateData.role === "artist") {
    const existingArtist = await getArtistByUserId(user.id);

    if (!existingArtist) {
      // Create new artist record
      const artistUsername = updateData.username || user.email?.split("@")[0] || "artist";
      const artistName = updateData.display_name || artistUsername;

      const artistResult = await createArtist({
        user_id: user.id,
        name: artistName,
        username: artistUsername,
        bio: updateData.bio,
        profile_image: updateData.profile_image,
      });

      if (!artistResult.success) {
        // Don't fail the whole operation, just log the error
        console.error("Failed to create artist record:", artistResult.error);
      }
    } else {
      // Update existing artist record with new profile data
      const artistUpdateData: Partial<{
        name: string;
        username: string;
        bio: string;
        profile_image: string;
      }> = {};

      if (updateData.display_name) {
        artistUpdateData.name = updateData.display_name;
      }
      if (updateData.username) {
        artistUpdateData.username = updateData.username;
      }
      if (updateData.bio !== undefined) {
        artistUpdateData.bio = updateData.bio || "";
      }
      if (updateData.profile_image !== undefined) {
        artistUpdateData.profile_image = updateData.profile_image || "";
      }

      if (Object.keys(artistUpdateData).length > 0) {
        const artistResult = await updateArtist(existingArtist.id, artistUpdateData);

        if (!artistResult.success) {
          console.error("Failed to update artist record:", artistResult.error);
        }
      }
    }
  }

  // Revalidate paths
  revalidatePath("/profile/edit");
  revalidatePath("/my-page");
  revalidatePath("/artist-dashboard");

  return {
    success: true,
    message: "프로필이 업데이트되었습니다.",
  };
}
