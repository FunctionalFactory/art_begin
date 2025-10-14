"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, BarChart3, Percent } from "lucide-react";
import type { ArtworkWithArtist, OrderWithDetails } from "@/lib/types";
import { SalesList } from "@/app/artist-dashboard/sales-list";
import { useMemo } from "react";

interface RevenueDashboardProps {
  artworks: ArtworkWithArtist[];
  sales: OrderWithDetails[];
}

export function RevenueDashboard({ artworks, sales }: RevenueDashboardProps) {
  // Calculate revenue statistics
  const stats = useMemo(() => {
    // Total revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.price, 0);

    // This month's revenue
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = sales
      .filter((sale) => new Date(sale.created_at) >= thisMonthStart)
      .reduce((sum, sale) => sum + sale.price, 0);

    // Average price
    const averagePrice = sales.length > 0 ? totalRevenue / sales.length : 0;

    // Sales rate (sold / total artworks)
    const totalArtworks = artworks.length;
    const soldArtworks = artworks.filter((artwork) => artwork.status === "sold").length;
    const salesRate = totalArtworks > 0 ? (soldArtworks / totalArtworks) * 100 : 0;

    return {
      totalRevenue,
      thisMonthRevenue,
      averagePrice,
      salesRate,
      totalSales: sales.length,
    };
  }, [artworks, sales]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("ko-KR").format(stats.totalRevenue)} 원
            </div>
            <p className="text-xs text-muted-foreground">
              총 {stats.totalSales}건 판매
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 수익</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("ko-KR").format(stats.thisMonthRevenue)} 원
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 판매가</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("ko-KR").format(Math.round(stats.averagePrice))} 원
            </div>
            <p className="text-xs text-muted-foreground">
              작품당 평균 가격
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">판매율</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.salesRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              전체 작품 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales History */}
      <div>
        <h3 className="text-xl font-bold mb-4">최근 판매 내역</h3>
        <SalesList sales={sales} />
      </div>
    </div>
  );
}
