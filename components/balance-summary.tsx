"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Lock, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/auction";
import { useRealtimeBalance } from "@/lib/hooks/useRealtimeBalance";

interface BalanceSummaryProps {
  userId: string;
}

/**
 * Balance Summary Component
 * Displays total balance, escrow amount, and available balance with real-time updates
 */
export function BalanceSummary({ userId }: BalanceSummaryProps) {
  const { balance, escrowTotal, availableBalance, isLoading, error } =
    useRealtimeBalance(userId);

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            잔고 정보를 불러오는 중 오류가 발생했습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Balance */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전체 잔고</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{formatPrice(balance)}</div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            충전된 총 금액
          </p>
        </CardContent>
      </Card>

      {/* Escrow Total */}
      <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
            에스크로 금액
          </CardTitle>
          <Lock className="h-4 w-4 text-orange-700 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-32 bg-orange-100 dark:bg-orange-900/20 animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {formatPrice(escrowTotal)}
            </div>
          )}
          <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
            입찰로 묶인 금액
          </p>
        </CardContent>
      </Card>

      {/* Available Balance */}
      <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
            사용 가능 잔고
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-32 bg-green-100 dark:bg-green-900/20 animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatPrice(availableBalance)}
            </div>
          )}
          <p className="text-xs text-green-600 dark:text-green-500 mt-2">
            입찰 가능한 금액
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
