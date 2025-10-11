"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  calculateHammerPrice,
  calculateBuyerPremium,
} from "@/lib/utils/auction";
import { createClient } from "@/utils/supabase/client";

export interface BidHistoryItem {
  id: string;
  bidAmount: number;
  buyerPremiumRate?: number;
  createdAt: Date;
  userId: string;
  isCurrentUser: boolean;
}

interface BidHistoryProps {
  bids: BidHistoryItem[];
  artworkId: string;
  currentUserId?: string;
}

export function BidHistory({ bids: initialBids, artworkId, currentUserId }: BidHistoryProps) {
  const [bids, setBids] = useState<BidHistoryItem[]>(initialBids);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to bids table changes for this artwork
    const channel = supabase
      .channel(`bids:${artworkId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `artwork_id=eq.${artworkId}`,
        },
        async (payload) => {
          // Fetch the new bid with user info
          const { data: newBid } = await supabase
            .from('bids')
            .select('id, bid_amount, buyer_premium_rate, created_at, user_id')
            .eq('id', payload.new.id)
            .single();

          if (newBid) {
            const bidItem: BidHistoryItem = {
              id: newBid.id,
              bidAmount: newBid.bid_amount,
              buyerPremiumRate: newBid.buyer_premium_rate || undefined,
              createdAt: new Date(newBid.created_at),
              userId: newBid.user_id,
              isCurrentUser: currentUserId === newBid.user_id,
            };

            // Add new bid to the beginning and limit to 10 items
            setBids((prevBids) => [bidItem, ...prevBids].slice(0, 10));
          }
        }
      )
      .subscribe();

    // Listen for custom bid-placed event for immediate UI update
    const handleBidPlaced = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { artworkId: eventArtworkId, bidAmount } = customEvent.detail;

      // Only handle events for this artwork
      if (eventArtworkId !== artworkId) return;

      // Fetch the latest bids to ensure we have the most up-to-date data
      const { data: latestBids } = await supabase
        .from('bids')
        .select('id, bid_amount, buyer_premium_rate, created_at, user_id')
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (latestBids) {
        const bidItems: BidHistoryItem[] = latestBids.map((bid) => ({
          id: bid.id,
          bidAmount: bid.bid_amount,
          buyerPremiumRate: bid.buyer_premium_rate || undefined,
          createdAt: new Date(bid.created_at),
          userId: bid.user_id,
          isCurrentUser: currentUserId === bid.user_id,
        }));
        setBids(bidItems);
      }
    };

    window.addEventListener('bid-placed', handleBidPlaced);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('bid-placed', handleBidPlaced);
    };
  }, [artworkId, currentUserId]);

  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">입찰 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            아직 입찰 내역이 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const maskUserId = (userId: string, isCurrentUser: boolean) => {
    if (isCurrentUser) return "나";
    // Mask user ID: show first 4 chars + ***
    return userId.substring(0, 4) + "***";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">입찰 내역</CardTitle>
        <p className="text-sm text-muted-foreground">
          최근 {bids.length}개의 입찰 내역
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {bids.map((bid, index) => (
          <div key={bid.id}>
            {index > 0 && <Separator className="my-3" />}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {maskUserId(bid.userId, bid.isCurrentUser)}
                  </span>
                  {bid.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      내 입찰
                    </Badge>
                  )}
                  {index === 0 && (
                    <Badge variant="default" className="text-xs">
                      최고가
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(bid.createdAt)}
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="font-semibold">{formatPrice(bid.bidAmount)}</p>
                {bid.buyerPremiumRate && bid.buyerPremiumRate > 0 && (
                  <p className="text-xs text-muted-foreground">
                    작품가{" "}
                    {formatPrice(
                      calculateHammerPrice(
                        bid.bidAmount,
                        bid.buyerPremiumRate
                      )
                    )}{" "}
                    + 수수료{" "}
                    {formatPrice(
                      calculateBuyerPremium(
                        calculateHammerPrice(
                          bid.bidAmount,
                          bid.buyerPremiumRate
                        ),
                        bid.buyerPremiumRate
                      )
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
