"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderWithDetails } from "@/lib/types";
import { useState, useTransition } from "react";
import { updateArtistOrderStatus } from "./order-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SalesListProps {
  sales: OrderWithDetails[];
}

const getStatusLabel = (status: OrderWithDetails["status"]) => {
  const statusMap = {
    pending: "결제 대기",
    preparing: "배송 준비",
    shipping: "배송 중",
    delivered: "배송 완료",
    completed: "거래 완료",
  };
  return statusMap[status];
};

const getStatusVariant = (status: OrderWithDetails["status"]) => {
  const variantMap: Record<
    OrderWithDetails["status"],
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "secondary",
    preparing: "outline",
    shipping: "default",
    delivered: "default",
    completed: "secondary",
  };
  return variantMap[status];
};

export function SalesList({ sales }: SalesListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleStatusChange = (orderId: string, newStatus: OrderWithDetails["status"]) => {
    setUpdatingOrderId(orderId);
    startTransition(async () => {
      const result = await updateArtistOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success("주문 상태가 업데이트되었습니다.");
        router.refresh();
      } else {
        toast.error(result.message || "상태 업데이트에 실패했습니다.");
      }
      setUpdatingOrderId(null);
    });
  };

  if (sales.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">판매 내역이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <Card key={sale.id}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={sale.artwork.image_url}
                  alt={sale.artwork.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {sale.artwork.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  구매자: {sale.buyer_email || "알 수 없음"}
                </p>
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {sale.order_type === "purchase" ? "판매가" : "낙찰가"}
                    </p>
                    <p className="font-bold">
                      {new Intl.NumberFormat("ko-KR").format(sale.price)} 원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">주문일</p>
                    <p className="text-sm">
                      {new Date(sale.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">주문 방식</p>
                    <p className="text-sm">
                      {sale.order_type === "purchase"
                        ? "즉시 구매"
                        : "경매 낙찰"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 space-y-2">
                <Badge variant={getStatusVariant(sale.status)}>
                  {getStatusLabel(sale.status)}
                </Badge>
                <Select
                  value={sale.status}
                  onValueChange={(value) =>
                    handleStatusChange(sale.id, value as OrderWithDetails["status"])
                  }
                  disabled={isPending && updatingOrderId === sale.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">결제 대기</SelectItem>
                    <SelectItem value="preparing">배송 준비</SelectItem>
                    <SelectItem value="shipping">배송 중</SelectItem>
                    <SelectItem value="delivered">배송 완료</SelectItem>
                    <SelectItem value="completed">거래 완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
