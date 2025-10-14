"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Package, Palette, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { ArtworkWithArtist, OrderWithDetails } from "@/lib/types";
import { ArtworkList } from "@/app/artist-dashboard/artwork-list";
import { SalesList } from "@/app/artist-dashboard/sales-list";
import { EmptyState } from "@/components/empty-state";
import { RevenueDashboard } from "./revenue-dashboard";

interface ArtistSectionProps {
  artworks: ArtworkWithArtist[];
  sales: OrderWithDetails[];
}

export function ArtistSection({ artworks, sales }: ArtistSectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current subtab from URL, default to 'manage'
  const subTab = searchParams.get("subtab") || "manage";

  const handleSubTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "artist");
    params.set("subtab", value);
    router.push(`/my-page?${params.toString()}`);
  };

  // Filter artworks by status
  const activeArtworks = artworks.filter((artwork) => artwork.status === "active");
  const soldArtworks = artworks.filter((artwork) => artwork.status === "sold");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">작품 관리</h2>
        <Link href="/artist-dashboard/new-artwork">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 작품 등록
          </Button>
        </Link>
      </div>

      <Tabs value={subTab} onValueChange={handleSubTabChange} className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="active">
            <Package className="w-4 h-4 mr-2" />
            판매중
          </TabsTrigger>
          <TabsTrigger value="sold">
            <CheckCircle className="w-4 h-4 mr-2" />
            판매완료
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <TrendingUp className="w-4 h-4 mr-2" />
            수익관리
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Palette className="w-4 h-4 mr-2" />
            작품관리
          </TabsTrigger>
        </TabsList>

        {/* Active Artworks Tab */}
        <TabsContent value="active">
          {activeArtworks.length > 0 ? (
            <ArtworkList artworks={activeArtworks} />
          ) : (
            <EmptyState
              icon={Package}
              title="판매 중인 작품이 없습니다"
              description="새 작품을 등록하거나 기존 작품을 활성화하세요"
              action={{
                label: "작품 등록하기",
                href: "/artist-dashboard/new-artwork",
              }}
            />
          )}
        </TabsContent>

        {/* Sold Artworks Tab */}
        <TabsContent value="sold">
          {soldArtworks.length > 0 ? (
            <ArtworkList artworks={soldArtworks} />
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="판매 완료된 작품이 없습니다"
              description="아직 판매된 작품이 없습니다"
            />
          )}
        </TabsContent>

        {/* Revenue Management Tab */}
        <TabsContent value="revenue">
          <RevenueDashboard artworks={artworks} sales={sales} />
        </TabsContent>

        {/* Artwork Management Tab */}
        <TabsContent value="manage">
          {artworks.length > 0 ? (
            <ArtworkList artworks={artworks} />
          ) : (
            <EmptyState
              icon={Palette}
              title="아직 등록된 작품이 없습니다"
              description="첫 번째 작품을 등록해보세요"
              action={{
                label: "작품 등록하기",
                href: "/artist-dashboard/new-artwork",
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
