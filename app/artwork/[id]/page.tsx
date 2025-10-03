import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Eye, Clock, Gavel } from "lucide-react";
import { getArtworkById } from "@/lib/queries";
import { transformArtworkToLegacy, transformArtistToLegacy } from "@/lib/utils/transform";

interface ArtworkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { id } = await params;
  const artworkDb = await getArtworkById(id);

  if (!artworkDb) {
    notFound();
  }

  // Transform DB data to legacy format
  const artwork = transformArtworkToLegacy(artworkDb);
  const artist = transformArtistToLegacy(artworkDb.artist);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Section */}
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-4">{artwork.category}</Badge>
            <h1 className="text-4xl font-bold mb-2">{artwork.title}</h1>
            <Link
              href={`/artist/${artwork.artistId}`}
              className="text-lg text-muted-foreground hover:text-primary"
            >
              {artwork.artistName}
            </Link>
          </div>

          <div className="flex items-center space-x-6 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>{artwork.likes} 좋아요</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>{artwork.views} 조회</span>
            </div>
          </div>

          {/* Price and Auction Info */}
          {artwork.saleType === "auction" && artwork.auctionEndTime ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">현재가</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(artwork.currentPrice!)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">입찰 수</p>
                    <p className="text-2xl font-semibold">{artwork.bidCount}</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <p className="text-sm font-semibold">남은 시간</p>
                  </div>
                  <div className="flex space-x-4 text-center">
                    {(() => {
                      const { days, hours, minutes } = getTimeRemaining(
                        artwork.auctionEndTime
                      );
                      return (
                        <>
                          <div>
                            <p className="text-2xl font-bold">{days}</p>
                            <p className="text-xs text-muted-foreground">일</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{hours}</p>
                            <p className="text-xs text-muted-foreground">시간</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{minutes}</p>
                            <p className="text-xs text-muted-foreground">분</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="입찰 금액을 입력하세요"
                    className="flex-1"
                  />
                  <Button size="lg" className="w-32">
                    <Gavel className="w-4 h-4 mr-2" />
                    입찰하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    즉시 구매가
                  </p>
                  <p className="text-3xl font-bold">
                    {formatPrice(artwork.fixedPrice!)}
                  </p>
                </div>
                <Button size="lg" className="w-full">
                  즉시 구매하기
                </Button>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full" size="lg">
            <Heart className="w-4 h-4 mr-2" />
            관심 작품에 추가
          </Button>
        </div>
      </div>

      {/* Description Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">작품 설명</h2>
            <p className="text-muted-foreground leading-relaxed">
              {artwork.description}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">작품 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">카테고리</p>
                <p className="font-semibold">{artwork.category}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">제작일</p>
                <p className="font-semibold">
                  {artwork.createdAt.toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Artist Info */}
        {artist && (
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold mb-4">작가 정보</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={artist.profileImage}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{artist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{artist.username}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{artist.bio}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">전체 작품</p>
                    <p className="text-xl font-bold">{artist.totalArtworks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">판매 작품</p>
                    <p className="text-xl font-bold">{artist.soldArtworks}</p>
                  </div>
                </div>
                <Link href={`/artist/${artist.id}`}>
                  <Button variant="outline" className="w-full">
                    작가 페이지 방문
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
