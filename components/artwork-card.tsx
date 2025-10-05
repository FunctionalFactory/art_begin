"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { LikeButton } from "@/components/like-button";
import { CountdownTimer } from "@/components/countdown-timer";
import type { Artwork } from "@/lib/data";

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  const handleCardClick = () => {
    router.push(`/artwork/${artwork.id}`);
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${artwork.title} by ${artwork.artistName} - ${artwork.saleType === "auction" ? "경매" : "즉시 구매"}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={artwork.imageUrl}
          alt={`${artwork.title} 작품 이미지`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {artwork.saleType === "auction" && artwork.auctionEndTime && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive">
              <CountdownTimer endTime={artwork.auctionEndTime} />
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
          <LikeButton
            artworkId={artwork.id}
            initialIsLiked={artwork.isLiked ?? false}
            initialLikesCount={artwork.likes}
            size="sm"
            showCount={true}
          />
          <div className="flex items-center space-x-1 transition-colors hover:text-foreground">
            <Eye className="w-4 h-4" />
            <span>{artwork.views}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
