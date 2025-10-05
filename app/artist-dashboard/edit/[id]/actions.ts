"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getArtistByUserId,
  updateArtwork,
  deleteArtwork,
  getArtworkById,
} from "@/lib/queries";

export async function updateArtworkAction(formData: FormData) {
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

  // Get artist record
  const artist = await getArtistByUserId(user.id);

  if (!artist) {
    return {
      success: false,
      error: "작가 프로필이 필요합니다.",
    };
  }

  // Get artwork ID
  const artworkId = formData.get("artwork_id") as string;

  if (!artworkId) {
    return {
      success: false,
      error: "작품 ID가 필요합니다.",
    };
  }

  // Verify ownership
  const artwork = await getArtworkById(artworkId);

  if (!artwork || artwork.artist_id !== artist.id) {
    return {
      success: false,
      error: "작품을 수정할 권한이 없습니다.",
    };
  }

  // Extract form data
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("image_url") as string;
  const category = formData.get("category") as string;
  const saleType = formData.get("sale_type") as "auction" | "fixed";
  const fixedPrice = formData.get("fixed_price") as string | null;
  const currentPrice = formData.get("current_price") as string | null;
  const auctionEndTime = formData.get("auction_end_time") as string | null;

  // Validation
  if (!title || !imageUrl || !category || !saleType) {
    return {
      success: false,
      error: "필수 항목을 모두 입력해주세요.",
    };
  }

  if (saleType === "fixed" && !fixedPrice) {
    return {
      success: false,
      error: "즉시 구매 가격을 입력해주세요.",
    };
  }

  if (saleType === "auction" && (!currentPrice || !auctionEndTime)) {
    return {
      success: false,
      error: "경매 시작 가격과 종료 시간을 입력해주세요.",
    };
  }

  // Prepare artwork data
  const artworkData: Partial<{
    title: string;
    description: string;
    image_url: string;
    category: string;
    sale_type: "auction" | "fixed";
    fixed_price: number;
    current_price: number;
    auction_end_time: string;
  }> = {
    title,
    description: description || "",
    image_url: imageUrl,
    category,
    sale_type: saleType,
  };

  if (saleType === "fixed" && fixedPrice) {
    artworkData.fixed_price = parseInt(fixedPrice, 10);
    // Clear auction fields
    artworkData.current_price = 0;
    artworkData.auction_end_time = "";
  }

  if (saleType === "auction") {
    if (currentPrice) {
      artworkData.current_price = parseInt(currentPrice, 10);
    }
    if (auctionEndTime) {
      artworkData.auction_end_time = new Date(auctionEndTime).toISOString();
    }
    // Clear fixed price
    artworkData.fixed_price = 0;
  }

  // Update artwork
  const result = await updateArtwork(artworkId, artworkData);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  // Revalidate paths
  revalidatePath("/artist-dashboard");
  revalidatePath(`/artwork/${artworkId}`);
  revalidatePath("/explore");
  revalidatePath("/");

  // Redirect to dashboard
  redirect("/artist-dashboard");
}

export async function deleteArtworkAction(formData: FormData) {
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

  // Get artist record
  const artist = await getArtistByUserId(user.id);

  if (!artist) {
    return {
      success: false,
      error: "작가 프로필이 필요합니다.",
    };
  }

  // Get artwork ID
  const artworkId = formData.get("artwork_id") as string;

  if (!artworkId) {
    return {
      success: false,
      error: "작품 ID가 필요합니다.",
    };
  }

  // Verify ownership
  const artwork = await getArtworkById(artworkId);

  if (!artwork || artwork.artist_id !== artist.id) {
    return {
      success: false,
      error: "작품을 삭제할 권한이 없습니다.",
    };
  }

  // Delete artwork
  const result = await deleteArtwork(artworkId);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  // Revalidate paths
  revalidatePath("/artist-dashboard");
  revalidatePath("/explore");
  revalidatePath("/");

  // Redirect to dashboard
  redirect("/artist-dashboard");
}
