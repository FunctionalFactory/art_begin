"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gavel, Wallet, AlertTriangle } from "lucide-react";
import { placeBid } from "@/app/artwork/[id]/bid-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  availableBalance?: number;
}

const MIN_BID_INCREMENT = 10000;

export function BidForm({
  artworkId,
  currentPrice,
  auctionEndTime,
  status = "active",
  availableBalance = 0,
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

  // Check if balance is insufficient
  const bidAmountNum = parseInt(bidAmount, 10);
  const isInsufficientBalance =
    !isNaN(bidAmountNum) && bidAmountNum > 0 && bidAmountNum > availableBalance;
  const shortfallAmount = isInsufficientBalance
    ? bidAmountNum - availableBalance
    : 0;

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
      {/* Available Balance Display */}
      {availableBalance > 0 && (
        <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">사용 가능 잔고</p>
              <p className="text-sm font-semibold">{formatPrice(availableBalance)}</p>
            </div>
          </div>
          <Link href="/balance">
            <Button variant="outline" size="sm" type="button">
              충전하기
            </Button>
          </Link>
        </div>
      )}

      {/* Escrow Warning */}
      {bidAmount && !isNaN(parseInt(bidAmount, 10)) && parseInt(bidAmount, 10) > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">
                입찰 시 이 금액이 에스크로로 묶입니다
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                다른 사용자가 더 높은 입찰을 하거나 경매가 종료되면 자동으로 해제됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

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

        {/* Insufficient Balance Warning */}
        {isInsufficientBalance && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-semibold">
                  잔고가 부족합니다
                </p>
                <p className="text-xs text-destructive mt-1">
                  사용 가능 잔고: {formatPrice(availableBalance)} | 필요 금액:{" "}
                  {formatPrice(bidAmountNum)}
                </p>
                <p className="text-xs text-destructive mt-1">
                  부족한 금액: {formatPrice(shortfallAmount)}
                </p>
                <Link href="/balance" className="inline-block mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    className="h-8"
                  >
                    잔고 충전하기
                  </Button>
                </Link>
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
