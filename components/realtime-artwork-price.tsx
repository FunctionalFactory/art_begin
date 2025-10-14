"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface RealtimeArtworkPriceProps {
  artworkId: string;
  initialPrice: number;
  initialBidCount: number;
}

export function RealtimeArtworkPrice({
  artworkId,
  initialPrice,
  initialBidCount,
}: RealtimeArtworkPriceProps) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidCount, setBidCount] = useState(initialBidCount);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to artworks table changes
    const channel = supabase
      .channel(`artwork:${artworkId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${artworkId}`,
        },
        (payload) => {
          console.log('[RealtimeArtworkPrice] Received UPDATE event:', payload);
          if (payload.new.current_price) {
            setCurrentPrice(payload.new.current_price);
          }
          if (typeof payload.new.bid_count === 'number') {
            setBidCount(payload.new.bid_count);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[RealtimeArtworkPrice] Successfully subscribed to artwork:', artworkId);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('[RealtimeArtworkPrice] Channel error (Realtime may not be enabled):', err || 'No error details');
          console.info('[RealtimeArtworkPrice] Falling back to custom events for updates');
        } else if (status === 'TIMED_OUT') {
          console.warn('[RealtimeArtworkPrice] Subscription timed out, falling back to custom events');
        } else if (status === 'CLOSED') {
          console.info('[RealtimeArtworkPrice] Channel closed');
        }
      });

    // Listen for custom bid-placed event for immediate UI update
    const handleBidPlaced = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { artworkId: eventArtworkId, currentPrice: newPrice, bidCount: newBidCount } = customEvent.detail;

      // Only handle events for this artwork
      if (eventArtworkId !== artworkId) return;

      console.log('[RealtimeArtworkPrice] Received bid-placed event:', { newPrice, newBidCount });

      // Update state immediately with data from the server response
      if (newPrice) {
        setCurrentPrice(newPrice);
      }
      if (typeof newBidCount === 'number') {
        setBidCount(newBidCount);
      }
    };

    window.addEventListener('bid-placed', handleBidPlaced);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('bid-placed', handleBidPlaced);
    };
  }, [artworkId]);

  // Determine if this is the starting price (no bids yet) or current bid
  const isStartingPrice = bidCount === 0;
  const priceLabel = isStartingPrice ? "경매 시작가" : "현재가";

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {priceLabel}
        </p>
        <p className="text-3xl font-bold text-primary">
          {formatPrice(currentPrice)}
        </p>
        {!isStartingPrice && (
          <p className="text-xs text-muted-foreground mt-1">
            (구매자 수수료 별도)
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground mb-1">입찰 수</p>
        <p className="text-2xl font-semibold">{bidCount}</p>
      </div>
    </div>
  );
}
