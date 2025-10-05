import { createClient } from "@/utils/supabase/server";
import type { Database, OrderWithArtwork, OrderWithDetails } from "@/lib/types";

/**
 * Get all orders for a specific user (buyer perspective)
 */
export async function getUserOrders(
  userId: string
): Promise<OrderWithArtwork[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      artwork:artworks (
        *,
        artist:artists (*)
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }

  return data as OrderWithArtwork[];
}

/**
 * Get all sales for a specific artist (seller perspective)
 */
export async function getArtistSales(
  artistId: string
): Promise<OrderWithDetails[]> {
  const supabase = await createClient();

  // First get all artworks by this artist
  const { data: artworks, error: artworksError } = await supabase
    .from("artworks")
    .select("id")
    .eq("artist_id", artistId);

  if (artworksError || !artworks) {
    console.error("Error fetching artist artworks:", artworksError);
    return [];
  }

  const artworkIds = artworks.map((a) => a.id);

  if (artworkIds.length === 0) {
    return [];
  }

  // Get all orders for these artworks
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      artwork:artworks (
        *,
        artist:artists (*)
      )
    `
    )
    .in("artwork_id", artworkIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching artist sales:", error);
    return [];
  }

  // Get buyer emails for each order
  const ordersWithDetails = await Promise.all(
    (data as OrderWithArtwork[]).map(async (order) => {
      const { data: userData } = await supabase.auth.admin.getUserById(
        order.user_id
      );

      return {
        ...order,
        buyer_email: userData?.user?.email,
      };
    })
  );

  return ordersWithDetails as OrderWithDetails[];
}

/**
 * Create a new order
 */
export async function createOrder(orderData: {
  userId: string;
  artworkId: string;
  orderType: "purchase" | "auction";
  price: number;
}): Promise<Database.Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: orderData.userId,
      artwork_id: orderData.artworkId,
      order_type: orderData.orderType,
      price: orderData.price,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return null;
  }

  return data as Database.Order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Database.Order["status"]
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    return false;
  }

  return true;
}

/**
 * Call the process_expired_auctions function to finalize completed auctions
 */
export async function processExpiredAuctions(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("process_expired_auctions");

  if (error) {
    console.error("Error processing expired auctions:", error);
    return 0;
  }

  return data || 0;
}
