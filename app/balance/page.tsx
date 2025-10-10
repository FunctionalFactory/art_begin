import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DepositForm } from "@/components/deposit-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History } from "lucide-react";
import { Metadata } from "next";

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
