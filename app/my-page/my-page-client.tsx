"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Heart, Package, Gavel, Palette } from "lucide-react";
import type { Artwork } from "@/lib/data";
import type { OrderWithArtwork, ArtworkWithArtist, OrderWithDetails } from "@/lib/types";
import { ArtistSection } from "./components/artist-section";

interface MyPageClientProps {
  favoriteArtworks: Artwork[];
  bidHistory: Artwork[];
  orders: OrderWithArtwork[];
  isArtist: boolean;
  artistArtworks: ArtworkWithArtist[] | null;
  artistSales: OrderWithDetails[] | null;
}

const getStatusLabel = (status: OrderWithArtwork["status"]) => {
  const statusMap = {
    pending: "결제 대기",
    preparing: "배송 준비",
    shipping: "배송 중",
    delivered: "배송 완료",
    completed: "거래 완료",
  };
  return statusMap[status];
};

const getStatusVariant = (status: OrderWithArtwork["status"]) => {
  const variantMap: Record<OrderWithArtwork["status"], "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    preparing: "outline",
    shipping: "default",
    delivered: "default",
    completed: "secondary",
  };
  return variantMap[status];
};

export function MyPageClient({
  favoriteArtworks,
  bidHistory,
  orders,
  isArtist,
  artistArtworks,
  artistSales,
}: MyPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current tab from URL, default to 'buyer'
  const mainTab = searchParams.get("tab") || "buyer";

  const handleMainTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/my-page?${params.toString()}`);
  };

  return (
    <Tabs value={mainTab} onValueChange={handleMainTabChange} className="w-full">
      <TabsList className="mb-8">
        <TabsTrigger value="buyer">
          <Package className="w-4 h-4 mr-2" />
          구매 활동
        </TabsTrigger>
        {isArtist && (
          <TabsTrigger value="artist">
            <Palette className="w-4 h-4 mr-2" />
            작품 관리
          </TabsTrigger>
        )}
      </TabsList>

      {/* Buyer Tab - Purchase Activities */}
      <TabsContent value="buyer">
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              관심 작품
            </TabsTrigger>
            <TabsTrigger value="bids">
              <Gavel className="w-4 h-4 mr-2" />
              입찰 내역
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" />
              구매 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {favoriteArtworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteArtworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="아직 관심 작품이 없습니다"
                description="마음에 드는 작품에 좋아요를 눌러보세요!"
                action={{
                  label: "작품 둘러보기",
                  href: "/explore",
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="bids">
            {bidHistory.length > 0 ? (
              <div className="space-y-4">
                {bidHistory.map((artwork) => (
                  <Card key={artwork.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {artwork.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {artwork.artistName}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-xs text-muted-foreground">현재가</p>
                              <p className="font-bold">
                                {new Intl.NumberFormat("ko-KR").format(
                                  artwork.currentPrice!
                                )}{" "}
                                원
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">내 입찰가</p>
                              <p className={`font-bold ${artwork.userBidStatus === 'highest' ? 'text-green-600' : 'text-primary'}`}>
                                {new Intl.NumberFormat("ko-KR").format(
                                  artwork.userBidAmount || 0
                                )}{" "}
                                원
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {artwork.userBidStatus === 'highest' ? (
                            <Badge className="bg-green-600">최고가</Badge>
                          ) : (
                            <Badge variant="destructive">입찰 중</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Gavel}
                title="참여 중인 경매가 없습니다"
                description="경매 작품에 입찰해보세요!"
                action={{
                  label: "경매 작품 보기",
                  href: "/explore?saleType=auction",
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="orders">
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={order.artwork.image_url}
                            alt={order.artwork.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {order.artwork.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.artwork.artist.name}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {order.order_type === "purchase" ? "구매가" : "낙찰가"}
                              </p>
                              <p className="font-bold">
                                {new Intl.NumberFormat("ko-KR").format(order.price)} 원
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">주문일</p>
                              <p className="text-sm">
                                {new Date(order.created_at).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">주문 방식</p>
                              <p className="text-sm">
                                {order.order_type === "purchase" ? "즉시 구매" : "경매 낙찰"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant={getStatusVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="아직 구매한 작품이 없습니다"
                description="마음에 드는 작품을 구매해보세요!"
                action={{
                  label: "작품 둘러보기",
                  href: "/explore",
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* Artist Tab - Artwork Management */}
      {isArtist && (
        <TabsContent value="artist">
          <ArtistSection
            artworks={artistArtworks || []}
            sales={artistSales || []}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
