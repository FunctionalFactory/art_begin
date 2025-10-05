"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function toggleLike(artworkId: string) {
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
      isLiked: false,
      likesCount: 0,
    };
  }

  // Check if already favorited
  const { data: existingFavorite, error: checkError } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("artwork_id", artworkId)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking favorite:", checkError);
    return {
      success: false,
      error: "오류가 발생했습니다.",
      isLiked: false,
      likesCount: 0,
    };
  }

  const isCurrentlyLiked = !!existingFavorite;

  // Toggle favorite
  if (isCurrentlyLiked) {
    // Remove favorite
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("artwork_id", artworkId);

    if (deleteError) {
      console.error("Error removing favorite:", deleteError);
      return {
        success: false,
        error: "좋아요 취소 중 오류가 발생했습니다.",
        isLiked: true,
        likesCount: 0,
      };
    }
  } else {
    // Add favorite
    const { error: insertError } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        artwork_id: artworkId,
      });

    if (insertError) {
      console.error("Error adding favorite:", insertError);
      return {
        success: false,
        error: "좋아요 추가 중 오류가 발생했습니다.",
        isLiked: false,
        likesCount: 0,
      };
    }
  }

  // Get updated likes count
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("likes")
    .eq("id", artworkId)
    .single();

  if (artworkError) {
    console.error("Error fetching artwork likes:", artworkError);
  }

  const newLikesCount = artwork?.likes ?? 0;
  const newIsLiked = !isCurrentlyLiked;

  // Revalidate paths to update UI
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/artwork/${artworkId}`);
  revalidatePath("/my-page");

  return {
    success: true,
    isLiked: newIsLiked,
    likesCount: newLikesCount,
  };
}
