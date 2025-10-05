"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types";

export interface UpdateOrderStatusResult {
  success: boolean;
  message: string;
}

/**
 * Update order status (only artist who owns the artwork can update)
 */
export async function updateArtistOrderStatus(
  orderId: string,
  newStatus: Database.Order["status"]
): Promise<UpdateOrderStatusResult> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get order details with artwork information
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      artwork:artworks (
        id,
        artist_id,
        artist:artists (
          user_id
        )
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return {
      success: false,
      message: "주문을 찾을 수 없습니다.",
    };
  }

  // Check if user owns the artwork
  const artwork = order.artwork as any;
  if (!artwork || !artwork.artist || artwork.artist.user_id !== user.id) {
    return {
      success: false,
      message: "이 주문의 상태를 변경할 권한이 없습니다.",
    };
  }

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) {
    console.error("Error updating order status:", updateError);
    return {
      success: false,
      message: "상태 업데이트 중 오류가 발생했습니다.",
    };
  }

  // Revalidate relevant pages
  revalidatePath("/artist-dashboard");
  revalidatePath("/my-page");

  return {
    success: true,
    message: "주문 상태가 업데이트되었습니다.",
  };
}
