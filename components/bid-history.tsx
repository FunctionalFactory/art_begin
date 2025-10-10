import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  calculateHammerPrice,
  calculateBuyerPremium,
} from "@/lib/utils/auction";

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
}

export function BidHistory({ bids }: BidHistoryProps) {
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
