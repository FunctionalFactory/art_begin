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
          if (payload.new.current_price) {
            setCurrentPrice(payload.new.current_price);
          }
          if (typeof payload.new.bid_count === 'number') {
            setBidCount(payload.new.bid_count);
          }
        }
      )
      .subscribe();

    // Listen for custom bid-placed event for immediate UI update
    const handleBidPlaced = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { artworkId: eventArtworkId, currentPrice: newPrice, bidCount: newBidCount } = customEvent.detail;

      // Only handle events for this artwork
      if (eventArtworkId !== artworkId) return;

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

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          현재가 (수수료 포함)
        </p>
        <p className="text-3xl font-bold text-primary">
          {formatPrice(currentPrice)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground mb-1">입찰 수</p>
        <p className="text-2xl font-semibold">{bidCount}</p>
      </div>
    </div>
  );
}
