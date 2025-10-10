import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils/auction";
import { ArrowDownCircle, ArrowUpCircle, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "거래 내역 - ART-XHIBIT",
  description: "잔고 충전 및 입찰 거래 내역을 확인하세요",
};

function getTransactionIcon(type: string) {
  switch (type) {
    case "deposit":
      return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    case "bid":
      return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    case "refund":
      return <RotateCcw className="w-5 h-5 text-blue-500" />;
    default:
      return null;
  }
}

function getTransactionLabel(type: string) {
  switch (type) {
    case "deposit":
      return "충전";
    case "bid":
      return "입찰";
    case "refund":
      return "환불";
    default:
      return type;
  }
}

function getTransactionColor(type: string) {
  switch (type) {
    case "deposit":
      return "text-green-600";
    case "bid":
      return "text-red-600";
    case "refund":
      return "text-blue-600";
    default:
      return "text-muted-foreground";
  }
}

export default async function TransactionHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const balance = profile?.balance ?? 0;

  // Get transaction history
  const { data: transactions } = await supabase
    .from("balance_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/balance">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                잔고 충전
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">거래 내역</h1>
          <p className="text-muted-foreground mt-2">
            모든 충전 및 입찰 거래 내역을 확인하세요
          </p>
        </div>
      </div>

      {/* Current Balance Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>현재 잔고</CardTitle>
          <CardDescription>사용 가능한 잔고 금액</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatPrice(balance)}</p>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-4">
          전체 거래 ({transactions?.length || 0}건)
        </h2>

        {!transactions || transactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">거래 내역이 없습니다</p>
              <Link href="/balance">
                <Button variant="outline" className="mt-4">
                  잔고 충전하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Icon and Details */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getTransactionIcon(tx.transaction_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">
                        {getTransactionLabel(tx.transaction_type)}
                      </p>
                      {tx.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {tx.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(tx.created_at).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount and Balance */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-lg font-bold ${getTransactionColor(
                        tx.transaction_type
                      )}`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatPrice(tx.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      잔액: {formatPrice(tx.balance_after)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Information */}
      {transactions && transactions.length > 0 && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
          <p>
            최근 100건의 거래 내역이 표시됩니다. 모든 거래는 안전하게 기록되며
            수정할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
