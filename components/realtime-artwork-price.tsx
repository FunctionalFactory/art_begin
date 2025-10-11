"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface RealtimeArtworkPriceProps {
  artworkId: string;
  initialPrice: number;
  initialBidCount: number;
  formatPrice: (price: number) => string;
}

export function RealtimeArtworkPrice({
  artworkId,
  initialPrice,
  initialBidCount,
  formatPrice,
}: RealtimeArtworkPriceProps) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidCount, setBidCount] = useState(initialBidCount);

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

    return () => {
      supabase.removeChannel(channel);
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
