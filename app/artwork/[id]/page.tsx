import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { getArtworkById, checkIsFavorited } from "@/lib/queries";
import { transformArtworkToLegacy, transformArtistToLegacy } from "@/lib/utils/transform";
import { LikeButton } from "@/components/like-button";
import { BidForm } from "@/components/bid-form";
import { PurchaseButton } from "@/components/purchase-button";
import { AuctionCountdown } from "@/components/auction-countdown";
import { createClient } from "@/utils/supabase/server";

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

  // Get current user and check if favorited
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLiked = await checkIsFavorited(user?.id, id);

  // Transform DB data to legacy format
  const artwork = transformArtworkToLegacy(artworkDb, isLiked);
  const artist = transformArtistToLegacy(artworkDb.artist);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
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
            <LikeButton
              artworkId={artwork.id}
              initialIsLiked={artwork.isLiked ?? false}
              initialLikesCount={artwork.likes}
              size="md"
              showCount={true}
            />
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>{artwork.views} 조회</span>
            </div>
          </div>

          {/* Artwork Info */}
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

                <AuctionCountdown endTime={artwork.auctionEndTime} />

                <BidForm
                  artworkId={artwork.id}
                  currentPrice={artwork.currentPrice!}
                  auctionEndTime={artwork.auctionEndTime || null}
                  status={artwork.status}
                />
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
                <PurchaseButton
                  artworkId={artwork.id}
                  artworkTitle={artwork.title}
                  price={artwork.fixedPrice!}
                  status={artwork.status}
                />
              </CardContent>
            </Card>
          )}

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
