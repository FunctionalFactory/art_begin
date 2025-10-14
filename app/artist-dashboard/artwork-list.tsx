"use client";

import { ArtworkWithArtist } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { deleteArtworkAction } from "./edit/[id]/actions";
import { useRouter } from "next/navigation";

interface ArtworkListProps {
  artworks: ArtworkWithArtist[];
}

function ArtworkCard({ artwork }: { artwork: ArtworkWithArtist }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Determine if artwork can be deleted (client-side check)
  const isDeletable = artwork.status !== "sold" &&
    !(artwork.sale_type === "auction" && artwork.bid_count > 0);

  const getDisabledReason = () => {
    if (artwork.status === "sold") {
      return "이미 판매 완료된 작품은 삭제할 수 없습니다.";
    }
    if (artwork.sale_type === "auction" && artwork.bid_count > 0) {
      return "경매 진행 중인 작품은 삭제할 수 없습니다. 입찰자가 있습니다.";
    }
    return "";
  };

  const handleDelete = async () => {
    setError(null);
    const formData = new FormData();
    formData.append("artwork_id", artwork.id);

    startTransition(async () => {
      try {
        const result = await deleteArtworkAction(formData);
        if (!result.success) {
          setError(result.error || "작품 삭제에 실패했습니다.");
        } else {
          router.refresh();
        }
      } catch (err) {
        setError("작품 삭제 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <Card>
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

            {error && (
              <div className="mt-4 text-sm text-destructive">
                {error}
              </div>
            )}
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

            {/* Delete Button */}
            {isDeletable ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>작품을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 작품이 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-muted-foreground"
                        disabled
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getDisabledReason()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ArtworkList({ artworks }: ArtworkListProps) {
  return (
    <div className="space-y-4">
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
