"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GenreHeader } from "@/components/genre-header";
import { SimpleArtworkCard } from "@/components/simple-artwork-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import type { Genre, GenreArtwork } from "@/lib/types/genre";
import { ChevronLeft, ChevronRight, Package2 } from "lucide-react";

interface GenreClientProps {
  genre: Genre;
  artworks: GenreArtwork[];
  totalPages: number;
  currentPage: number;
}

export function GenreClient({
  genre,
  artworks,
  totalPages,
  currentPage,
}: GenreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 끝에서 5개를 채울 수 없으면 시작 페이지 조정
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <GenreHeader genre={genre} />

        {artworks.length > 0 ? (
          <>
            {/* 작품 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
              {artworks.map((artwork, index) => (
                <SimpleArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  index={index}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="이전 페이지"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Package2}
            title="작품이 없습니다"
            description={`${genre.name} 장르의 작품이 아직 등록되지 않았습니다.`}
          />
        )}
      </div>
    </div>
  );
}
