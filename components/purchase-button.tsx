"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { purchaseArtwork } from "@/app/artwork/[id]/purchase-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  artworkId: string;
  artworkTitle: string;
  price: number;
  status: "active" | "sold" | "upcoming";
}

export function PurchaseButton({
  artworkId,
  artworkTitle,
  price,
  status,
}: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    if (status !== "active") {
      toast.error("이미 판매된 작품입니다.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await purchaseArtwork(artworkId);

      if (result.success) {
        toast.success(result.message);
        router.push("/my-page");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("구매 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "sold") {
    return (
      <Button size="lg" className="w-full" disabled variant="secondary">
        품절
      </Button>
    );
  }

  if (status === "upcoming") {
    return (
      <Button size="lg" className="w-full" disabled variant="secondary">
        판매 예정
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handlePurchase}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          처리 중...
        </>
      ) : (
        "즉시 구매하기"
      )}
    </Button>
  );
}
