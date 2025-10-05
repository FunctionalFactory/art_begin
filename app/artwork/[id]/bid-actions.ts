"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Minimum bid increment in KRW
const MIN_BID_INCREMENT = 10000;

export async function placeBid(artworkId: string, bidAmount: number) {
  const supabase = await createClient();

  // 1. Check authentication
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

  // 2. Verify artwork exists and get details
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", artworkId)
    .single();

  if (artworkError || !artwork) {
    return {
      success: false,
      error: "작품을 찾을 수 없습니다.",
    };
  }

  // 3. Check if artwork is auction type
  if (artwork.sale_type !== "auction") {
    return {
      success: false,
      error: "경매 작품이 아닙니다.",
    };
  }

  // 4. Check auction not ended
  if (artwork.auction_end_time) {
    const endTime = new Date(artwork.auction_end_time);
    const now = new Date();

    if (now > endTime) {
      return {
        success: false,
        error: "경매가 종료되었습니다.",
      };
    }
  }

  // 5. Validate bid amount
  const currentPrice = artwork.current_price || 0;
  const minValidBid = currentPrice + MIN_BID_INCREMENT;

  if (bidAmount < minValidBid) {
    return {
      success: false,
      error: `입찰 금액은 현재가보다 ${MIN_BID_INCREMENT.toLocaleString(
        "ko-KR"
      )}원 이상 높아야 합니다. 최소 입찰가: ${minValidBid.toLocaleString(
        "ko-KR"
      )}원`,
      minBidAmount: minValidBid,
      currentPrice,
    };
  }

  // 6. Insert bid record
  const { error: insertError } = await supabase.from("bids").insert({
    artwork_id: artworkId,
    user_id: user.id,
    bid_amount: bidAmount,
  });

  if (insertError) {
    console.error("Error inserting bid:", insertError);
    return {
      success: false,
      error: "입찰 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }

  // 7. Get updated artwork info (trigger will have updated it)
  const { data: updatedArtwork } = await supabase
    .from("artworks")
    .select("current_price, bid_count, highest_bidder")
    .eq("id", artworkId)
    .single();

  // 8. Revalidate paths to update UI
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/artwork/${artworkId}`);
  revalidatePath("/my-page");

  return {
    success: true,
    message: "입찰이 완료되었습니다!",
    currentPrice: updatedArtwork?.current_price || bidAmount,
    bidCount: updatedArtwork?.bid_count || 0,
    isHighestBidder: updatedArtwork?.highest_bidder === user.id,
  };
}
