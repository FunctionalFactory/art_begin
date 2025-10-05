import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import {
  getArtworkById,
  checkIsFavorited,
  getRelatedArtworksByArtist,
  getRelatedArtworksByCategory,
} from "@/lib/queries";
import { getRecentBids } from "@/lib/queries/bids";
import { transformArtworkToLegacy, transformArtistToLegacy } from "@/lib/utils/transform";
import { LikeButton } from "@/components/like-button";
import { BidForm } from "@/components/bid-form";
import { PurchaseButton } from "@/components/purchase-button";
import { AuctionCountdown } from "@/components/auction-countdown";
import { ImageGallery } from "@/components/image-gallery";
import { RelatedArtworks } from "@/components/related-artworks";
import { BidHistory } from "@/components/bid-history";
import { ShareButton } from "@/components/share-button";
import { ArtworkBreadcrumb } from "@/components/artwork-breadcrumb";
import { createClient } from "@/utils/supabase/server";

interface ArtworkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { id } = await params;
  const artworkDb = await getArtworkById(id);

  if (!artworkDb) {
    return {
      title: "작품을 찾을 수 없습니다",
    };
  }

  const price = artworkDb.sale_type === "auction"
    ? artworkDb.current_price
    : artworkDb.fixed_price;

  const priceText = price
    ? new Intl.NumberFormat("ko-KR").format(price) + " 원"
    : "";

  const description = artworkDb.description
    ? artworkDb.description.substring(0, 160)
    : `${artworkDb.artist.name} 작가의 ${artworkDb.title}`;

  return {
    title: `${artworkDb.title} - ${artworkDb.artist.name} | ART-XHIBIT`,
    description,
    openGraph: {
      title: artworkDb.title,
      description: `${artworkDb.artist.name} 작가의 작품 | ${priceText}`,
      images: [
        {
          url: artworkDb.images?.[0] || artworkDb.image_url,
          width: 1200,
          height: 1200,
          alt: artworkDb.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: artworkDb.title,
      description: `${artworkDb.artist.name} 작가의 작품 | ${priceText}`,
      images: [artworkDb.images?.[0] || artworkDb.image_url],
    },
  };
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

  // Get image gallery (use images array if available, fallback to single image)
  const galleryImages = artwork.images && artwork.images.length > 0
    ? artwork.images
    : [artwork.imageUrl];

  // Fetch related artworks and bid history in parallel
  const [relatedByArtist, relatedByCategory, recentBids] = await Promise.all([
    getRelatedArtworksByArtist(artwork.artistId, artwork.id, 4),
    getRelatedArtworksByCategory(artwork.category, artwork.id, 4),
    artwork.saleType === "auction" ? getRecentBids(artwork.id, user?.id, 10) : Promise.resolve([]),
  ]);

  // Transform related artworks to legacy format
  const relatedArtistArtworks = relatedByArtist.map(aw =>
    transformArtworkToLegacy(aw)
  );
  const relatedCategoryArtworks = relatedByCategory.map(aw =>
    transformArtworkToLegacy(aw)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <ArtworkBreadcrumb artworkTitle={artwork.title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery Section */}
        <ImageGallery images={galleryImages} title={artwork.title} />

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Badge>{artwork.category}</Badge>
              <ShareButton title={artwork.title} text={`${artwork.artistName}의 작품: ${artwork.title}`} />
            </div>
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

      {/* Description and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">작품 설명</h2>
            <p className="text-muted-foreground leading-relaxed">
              {artwork.description}
            </p>
          </div>

          {/* Bid History (for auction items) */}
          {artwork.saleType === "auction" && recentBids.length > 0 && (
            <div>
              <BidHistory bids={recentBids} />
            </div>
          )}
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

      {/* Related Artworks Section */}
      {relatedArtistArtworks.length > 0 && (
        <>
          <Separator className="my-12" />
          <div className="mb-12">
            <RelatedArtworks
              artworks={relatedArtistArtworks}
              title={`${artwork.artistName}의 다른 작품`}
            />
          </div>
        </>
      )}

      {relatedCategoryArtworks.length > 0 && (
        <>
          <Separator className="my-12" />
          <div className="mb-12">
            <RelatedArtworks
              artworks={relatedCategoryArtworks}
              title={`비슷한 ${artwork.category} 작품`}
            />
          </div>
        </>
      )}
    </div>
  );
}
