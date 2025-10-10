"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { depositBalance } from "@/app/balance/deposit-actions";
import { getPresetDepositAmounts } from "@/lib/utils/balance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/auction";
import { Wallet, Plus } from "lucide-react";

interface DepositFormProps {
  currentBalance: number;
}

export function DepositForm({ currentBalance }: DepositFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  const presetAmounts = getPresetDepositAmounts();

  const handlePresetClick = (value: number) => {
    setAmount(String(value));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = parseInt(amount, 10);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("유효한 금액을 입력해주세요.");
      return;
    }

    if (numAmount < 1000) {
      setError("최소 충전 금액은 1,000원입니다.");
      return;
    }

    if (numAmount > 100000000) {
      setError("1회 최대 충전 금액은 1억원입니다.");
      return;
    }

    startTransition(async () => {
      const result = await depositBalance(numAmount);

      if (result.success) {
        toast.success("충전이 완료되었습니다!", {
          description: `충전 금액: ${formatPrice(numAmount)}`,
        });
        setAmount("");
        router.refresh();
      } else {
        toast.error(result.error || "충전에 실패했습니다.");
        setError(result.error || "");
      }
    });
  };

  const estimatedBalance = amount
    ? currentBalance + parseInt(amount, 10)
    : currentBalance;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Balance Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            현재 잔고
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatPrice(currentBalance)}</p>
          {amount && (
            <p className="text-sm text-muted-foreground mt-2">
              충전 후 잔고: <span className="font-semibold">{formatPrice(estimatedBalance)}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preset Amount Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>금액 선택</CardTitle>
          <CardDescription>자주 사용하는 금액을 선택하거나 직접 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === String(preset) ? "default" : "outline"}
                onClick={() => handlePresetClick(preset)}
                disabled={isPending}
                className="h-16 text-lg"
              >
                {formatPrice(preset)}
              </Button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="pt-4 border-t">
            <label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">
              직접 입력
            </label>
            <Input
              id="custom-amount"
              type="number"
              placeholder="충전할 금액을 입력하세요"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              min={1000}
              step={1000}
              disabled={isPending}
              className="text-lg h-12"
            />
            <p className="text-xs text-muted-foreground mt-2">
              최소 1,000원 ~ 최대 100,000,000원
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-lg"
        disabled={isPending || !amount}
      >
        {isPending ? (
          "처리 중..."
        ) : (
          <>
            <Plus className="w-5 h-5 mr-2" />
            {amount ? `${formatPrice(parseInt(amount, 10))} 충전하기` : "충전하기"}
          </>
        )}
      </Button>
    </form>
  );
}
