import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtworkCard } from "@/components/artwork-card";
import { Badge } from "@/components/ui/badge";
import { artworks } from "@/lib/data";
import { Heart, Package, Gavel, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  // Mock data - would come from user session in real app
  const favoriteArtworks = artworks.slice(0, 3);
  const bidHistory = artworks.filter((a) => a.saleType === "auction").slice(0, 2);
  const purchaseHistory = artworks.slice(3, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 활동과 관심 작품을 관리하세요</p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          설정
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관심 작품</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteArtworks.length}</div>
            <p className="text-xs text-muted-foreground">좋아요 누른 작품</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">참여 경매</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bidHistory.length}</div>
            <p className="text-xs text-muted-foreground">입찰 중인 작품</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">구매 내역</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseHistory.length}</div>
            <p className="text-xs text-muted-foreground">구매한 작품</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-8">
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
            주문 내역
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
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  아직 관심 작품이 없습니다.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  마음에 드는 작품에 좋아요를 눌러보세요!
                </p>
              </CardContent>
            </Card>
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
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="object-cover w-full h-full"
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
                            <p className="font-bold text-primary">
                              {new Intl.NumberFormat("ko-KR").format(
                                artwork.currentPrice! - 10000
                              )}{" "}
                              원
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="destructive">입찰 중</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Gavel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  참여 중인 경매가 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {purchaseHistory.length > 0 ? (
            <div className="space-y-4">
              {purchaseHistory.map((artwork) => (
                <Card key={artwork.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="object-cover w-full h-full"
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
                            <p className="text-xs text-muted-foreground">구매가</p>
                            <p className="font-bold">
                              {new Intl.NumberFormat("ko-KR").format(
                                artwork.fixedPrice || artwork.currentPrice || 0
                              )}{" "}
                              원
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">구매일</p>
                            <p className="text-sm">
                              {artwork.createdAt.toLocaleDateString("ko-KR")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge>배송 중</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  아직 구매한 작품이 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
