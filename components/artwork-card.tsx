"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import type { Artwork } from "@/lib/data";

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}일 남음`;
    if (hours > 0) return `${hours}시간 남음`;
    return "마감 임박";
  };

  return (
    <Link href={`/artwork/${artwork.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative aspect-square">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {artwork.saleType === "auction" && artwork.auctionEndTime && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive">
                {getTimeRemaining(artwork.auctionEndTime)}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {artwork.title}
          </h3>
          <Link
            href={`/artist/${artwork.artistId}`}
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {artwork.artistName}
          </Link>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            {artwork.saleType === "auction" ? (
              <div>
                <p className="text-xs text-muted-foreground">현재가</p>
                <p className="font-bold text-primary">
                  {formatPrice(artwork.currentPrice!)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">즉시구매</p>
                <p className="font-bold">
                  {formatPrice(artwork.fixedPrice!)}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{artwork.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{artwork.views}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
