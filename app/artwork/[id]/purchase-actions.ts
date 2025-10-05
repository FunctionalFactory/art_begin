"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface PurchaseResult {
  success: boolean;
  message: string;
  orderId?: string;
}

/**
 * Purchase an artwork with immediate payment (fixed price)
 */
export async function purchaseArtwork(artworkId: string): Promise<PurchaseResult> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get artwork details
  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", artworkId)
    .single();

  if (artworkError || !artwork) {
    return {
      success: false,
      message: "작품을 찾을 수 없습니다.",
    };
  }

  // Validate artwork is available for purchase
  if (artwork.status !== "active") {
    return {
      success: false,
      message: "이미 판매된 작품입니다.",
    };
  }

  if (artwork.sale_type !== "fixed") {
    return {
      success: false,
      message: "즉시 구매가 불가능한 작품입니다. 경매에 입찰해주세요.",
    };
  }

  if (!artwork.fixed_price || artwork.fixed_price <= 0) {
    return {
      success: false,
      message: "가격 정보가 올바르지 않습니다.",
    };
  }

  // Start transaction: update artwork status and create order
  try {
    // Update artwork status to sold
    const { error: updateError } = await supabase
      .from("artworks")
      .update({ status: "sold" })
      .eq("id", artworkId)
      .eq("status", "active"); // Only update if still active (prevent race condition)

    if (updateError) {
      console.error("Error updating artwork status:", updateError);
      return {
        success: false,
        message: "구매 처리 중 오류가 발생했습니다.",
      };
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        artwork_id: artworkId,
        order_type: "purchase",
        price: artwork.fixed_price,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      // Rollback: set artwork back to active
      await supabase
        .from("artworks")
        .update({ status: "active" })
        .eq("id", artworkId);

      return {
        success: false,
        message: "주문 생성 중 오류가 발생했습니다.",
      };
    }

    // Revalidate relevant pages
    revalidatePath(`/artwork/${artworkId}`);
    revalidatePath("/my-page");
    revalidatePath("/explore");

    return {
      success: true,
      message: "구매가 완료되었습니다! 주문 내역에서 확인하세요.",
      orderId: order.id,
    };
  } catch (error) {
    console.error("Unexpected error during purchase:", error);
    return {
      success: false,
      message: "예상치 못한 오류가 발생했습니다.",
    };
  }
}
