"use client";

import { ArtworkWithArtist } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ArtworkListProps {
  artworks: ArtworkWithArtist[];
}

export function ArtworkList({ artworks }: ArtworkListProps) {
  return (
    <div className="space-y-4">
      {artworks.map((artwork) => (
        <Card key={artwork.id}>
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Artwork Image */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={artwork.image_url}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Artwork Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {artwork.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        artwork.status === "active"
                          ? "default"
                          : artwork.status === "sold"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {artwork.status === "active"
                        ? "활성"
                        : artwork.status === "sold"
                        ? "판매됨"
                        : "예정"}
                    </Badge>
                    <Badge variant="outline">
                      {artwork.sale_type === "auction" ? "경매" : "즉시구매"}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {artwork.description}
                </p>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{artwork.views} 조회</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>{artwork.likes} 좋아요</span>
                  </div>
                  {artwork.sale_type === "auction" && (
                    <div className="text-sm text-muted-foreground">
                      <span>입찰: {artwork.bid_count}회</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">현재 가격</p>
                    <p className="text-lg font-bold">
                      {(artwork.sale_type === "auction"
                        ? artwork.current_price
                        : artwork.fixed_price
                      )?.toLocaleString("ko-KR")}
                      원
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Link href={`/artist-dashboard/edit/${artwork.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    수정
                  </Button>
                </Link>
                <Link href={`/artwork/${artwork.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    보기
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
