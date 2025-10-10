"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel } from "lucide-react";
import { placeBid } from "@/app/artwork/[id]/bid-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  formatBidBreakdown,
  getBuyerPremiumRate,
  formatPrice,
} from "@/lib/utils/auction";

interface BidFormProps {
  artworkId: string;
  currentPrice: number;
  auctionEndTime: Date | null;
  status?: "active" | "sold" | "upcoming";
}

const MIN_BID_INCREMENT = 10000;

export function BidForm({
  artworkId,
  currentPrice,
  auctionEndTime,
  status = "active",
}: BidFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  const minBidAmount = currentPrice + MIN_BID_INCREMENT;
  const buyerPremiumRate = getBuyerPremiumRate();

  // Calculate bid breakdown for real-time display
  const bidBreakdown = useMemo(() => {
    const amount = parseInt(bidAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      return null;
    }
    return formatBidBreakdown(amount, buyerPremiumRate);
  }, [bidAmount, buyerPremiumRate]);

  // Check if auction has ended
  const isAuctionEnded = auctionEndTime
    ? new Date() > new Date(auctionEndTime)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const amount = parseInt(bidAmount, 10);

    if (isNaN(amount) || amount <= 0) {
      setError("유효한 금액을 입력해주세요.");
      return;
    }

    if (amount < minBidAmount) {
      setError(
        `최소 입찰가는 ${minBidAmount.toLocaleString("ko-KR")}원입니다.`
      );
      return;
    }

    startTransition(async () => {
      const result = await placeBid(artworkId, amount);

      if (result.success) {
        toast.success(result.message || "입찰이 완료되었습니다!", {
          description: `입찰 금액: ${amount.toLocaleString("ko-KR")}원`,
        });
        setBidAmount("");
        router.refresh();
      } else {
        if (result.error === "로그인이 필요합니다.") {
          toast.error(result.error, {
            action: {
              label: "로그인",
              onClick: () => router.push("/login"),
            },
          });
        } else {
          toast.error(result.error || "입찰에 실패했습니다.");
          setError(result.error || "");
        }
      }
    });
  };

  if (status === "sold") {
    return (
      <div className="bg-muted p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          이미 판매된 작품입니다
        </p>
      </div>
    );
  }

  if (isAuctionEnded) {
    return (
      <div className="bg-muted p-6 rounded-lg text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          경매가 종료되었습니다
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        <div className="mb-3">
          <p className="text-sm text-muted-foreground mb-1">
            최소 입찰가: {minBidAmount.toLocaleString("ko-KR")}원
          </p>
          <p className="text-xs text-muted-foreground">
            입찰가에는 {(buyerPremiumRate * 100).toFixed(0)}% 수수료가
            포함됩니다
          </p>
        </div>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="입찰 금액을 입력하세요 (수수료 포함)"
            className="flex-1"
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(e.target.value);
              setError("");
            }}
            min={minBidAmount}
            step={10000}
            disabled={isPending}
          />
          <Button
            type="submit"
            size="lg"
            className="w-32"
            disabled={isPending || !bidAmount}
          >
            {isPending ? (
              "처리 중..."
            ) : (
              <>
                <Gavel className="w-4 h-4 mr-2" />
                입찰하기
              </>
            )}
          </Button>
        </div>

        {/* Real-time bid breakdown display */}
        {bidBreakdown && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              입찰 금액 상세
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">작품가</span>
                <span className="font-medium">
                  {formatPrice(bidBreakdown.hammerPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  수수료 ({(buyerPremiumRate * 100).toFixed(0)}%)
                </span>
                <span className="font-medium">
                  {formatPrice(bidBreakdown.buyerPremium)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="font-semibold">총 지불 금액</span>
                <span className="font-semibold">
                  {formatPrice(bidBreakdown.totalBid)}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>
    </form>
  );
}
