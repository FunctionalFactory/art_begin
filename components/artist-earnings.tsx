"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, ArrowDownToLine, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils/auction";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ArtistEarningsProps {
  totalEarnings: number;
  withdrawableAmount: number;
  totalSales: number;
}

/**
 * Artist Earnings Component
 * Displays artist's earnings, withdrawable amount, and withdrawal functionality
 */
export function ArtistEarnings({
  totalEarnings,
  withdrawableAmount,
  totalSales,
}: ArtistEarningsProps) {
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const handleWithdraw = () => {
    // TODO: Implement actual withdrawal logic
    setIsWithdrawDialogOpen(false);
    // Show success toast
  };

  return (
    <div className="space-y-6">
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Earnings */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              전체 판매 수익
            </p>
          </CardContent>
        </Card>

        {/* Withdrawable Amount */}
        <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
              환전 가능 금액
            </CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-green-700 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatPrice(withdrawableAmount)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-2">
              출금 가능한 금액
            </p>
          </CardContent>
        </Card>

        {/* Total Sales Count */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 판매 건수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground mt-2">
              완료된 거래
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Section */}
      <Card>
        <CardHeader>
          <CardTitle>수익 환전</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">환전 안내</p>
              <p className="text-xs text-muted-foreground">
                완료된 거래의 수익금을 환전할 수 있습니다. 환전 신청 후 영업일 기준 3-5일 내에 등록된 계좌로 입금됩니다.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">환전 가능 금액</p>
              <p className="text-2xl font-bold">{formatPrice(withdrawableAmount)}</p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsWithdrawDialogOpen(true)}
              disabled={withdrawableAmount === 0}
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              환전 신청
            </Button>
          </div>

          {/* Withdrawal History Placeholder */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-3">환전 내역</h3>
            <div className="text-center py-8 text-sm text-muted-foreground">
              환전 내역이 없습니다.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Dialog */}
      <AlertDialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>환전 신청</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{formatPrice(withdrawableAmount)}</span>을 환전 신청하시겠습니까?
              <br />
              <br />
              환전 신청 후 영업일 기준 3-5일 내에 등록된 계좌로 입금됩니다.
              <br />
              <br />
              <span className="text-xs text-muted-foreground">
                * 현재는 데모 버전으로 실제 환전이 처리되지 않습니다.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw}>
              신청하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
