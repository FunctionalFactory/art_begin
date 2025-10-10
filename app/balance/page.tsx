import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DepositForm } from "@/components/deposit-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, History, Lock } from "lucide-react";
import { Metadata } from "next";
import { getActiveEscrowBids } from "@/lib/queries/bids";
import { formatPrice } from "@/lib/utils/auction";
import Image from "next/image";

export const metadata: Metadata = {
  title: "잔고 충전 - ART-XHIBIT",
  description: "경매 입찰을 위한 잔고를 충전하세요",
};

export default async function BalancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const balance = profile?.balance ?? 0;

  // Get active escrow bids
  const activeEscrowBids = await getActiveEscrowBids(user.id);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/my-page">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                돌아가기
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">잔고 충전</h1>
          <p className="text-muted-foreground mt-2">
            경매 입찰을 위한 잔고를 충전하세요
          </p>
        </div>
        <Link href="/balance/history">
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            거래 내역
          </Button>
        </Link>
      </div>

      {/* Deposit Form */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        }
      >
        <DepositForm currentBalance={balance} />
      </Suspense>

      {/* Active Escrow Bids Section */}
      {activeEscrowBids.length > 0 && (
        <div className="mt-8">
          <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <Lock className="w-5 h-5" />
                활성 에스크로 내역
              </CardTitle>
              <p className="text-sm text-orange-600 dark:text-orange-500">
                현재 입찰로 묶여있는 금액입니다. 다른 사용자가 더 높은 입찰을 하거나 경매가 종료되면 자동으로 해제됩니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeEscrowBids.map((bid) => (
                <Link
                  key={bid.id}
                  href={`/artwork/${bid.artwork_id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg border hover:shadow-md transition-shadow">
                    {/* Artwork Thumbnail */}
                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={bid.artwork.image_url}
                        alt={bid.artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Artwork Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {bid.artwork.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {bid.artwork.artist.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        입찰 시간:{" "}
                        {new Date(bid.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Escrow Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                        {formatPrice(bid.escrowAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">묶인 금액</p>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Total Escrow */}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">총 에스크로 금액</span>
                  <span className="text-lg font-bold text-orange-700 dark:text-orange-400">
                    {formatPrice(
                      activeEscrowBids.reduce((sum, bid) => sum + bid.escrowAmount, 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Information */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
        <h3 className="font-semibold mb-3">충전 안내</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>최소 충전 금액은 1,000원, 최대 충전 금액은 1억원입니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>충전된 잔고는 경매 입찰 시 자동으로 차감됩니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>입찰 금액에는 구매자 수수료가 포함됩니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              잔고가 부족한 경우 입찰이 불가능하니 충분한 금액을 충전해주세요.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>모든 거래 내역은 거래 내역 페이지에서 확인할 수 있습니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
