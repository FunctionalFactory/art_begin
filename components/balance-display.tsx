import { Wallet } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/utils/auction";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BalanceDisplayProps {
  showDepositButton?: boolean;
  className?: string;
}

/**
 * Display user's current balance
 * Server component that fetches balance from database
 */
export async function BalanceDisplay({
  showDepositButton = false,
  className = "",
}: BalanceDisplayProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const balance = profile?.balance ?? 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">보유 잔고</span>
          <span className="text-sm font-semibold">{formatPrice(balance)}</span>
        </div>
      </div>

      {showDepositButton && (
        <Link href="/balance">
          <Button variant="outline" size="sm">
            충전하기
          </Button>
        </Link>
      )}
    </div>
  );
}

/**
 * Compact balance display for small spaces
 */
export async function CompactBalanceDisplay() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const balance = profile?.balance ?? 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Wallet className="w-4 h-4 text-muted-foreground" />
      <span className="font-semibold">{formatPrice(balance)}</span>
    </div>
  );
}
