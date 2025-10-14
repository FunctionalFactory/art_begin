"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState } from "@/components/empty-state";
import { FilterSidebar } from "./filter-sidebar";
import { Pagination } from "./pagination";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Artwork } from "@/lib/data";
import type { Database } from "@/lib/types";

interface ExploreClientProps {
  artworks: Artwork[];
  recommendedArtworks: Artwork[];
  totalPages: number;
  currentPage: number;
  categories: string[];
  artists: Database.Artist[];
}

export function ExploreClient({
  artworks,
  recommendedArtworks,
  totalPages,
  currentPage,
  categories,
  artists,
}: ExploreClientProps) {
  const router = useRouter();
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore-filter-collapsed');
      if (saved !== null) {
        setIsFilterCollapsed(saved === 'true');
      }
    } catch (error) {
      console.error('Failed to read filter state:', error);
    }
  }, []);

  const toggleFilter = () => {
    setIsFilterCollapsed(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('explore-filter-collapsed', String(newValue));
      } catch (error) {
        console.error('Failed to save filter state:', error);
      }
      return newValue;
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">작품 둘러보기</h1>
          <p className="text-muted-foreground">
            {artworks.length > 0
              ? `${artworks.length}개의 작품을 발견했습니다`
              : "검색 결과가 없습니다"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleFilter}
          className="hidden md:flex items-center gap-2"
          aria-label={isFilterCollapsed ? "필터 표시" : "필터 숨기기"}
          aria-expanded={!isFilterCollapsed}
        >
          {isFilterCollapsed ? (
            <>
              <ChevronLeft className="w-4 h-4" />
              필터 표시
            </>
          ) : (
            <>
              필터 숨기기
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Artworks Grid */}
        <main className={cn(
          "order-last md:order-none transition-all duration-300",
          isFilterCollapsed ? "md:col-span-4" : "md:col-span-3"
        )}>
          {artworks.length > 0 ? (
            <>
              <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300",
                isFilterCollapsed ? "lg:grid-cols-4" : "lg:grid-cols-3"
              )}>
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div>
              <EmptyState
                icon={Search}
                title="검색 결과가 없습니다"
                description="다른 검색어나 필터를 시도해보세요."
                action={{
                  label: "모든 작품 보기",
                  href: "/explore",
                }}
              />

              {recommendedArtworks.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">추천 작품</h2>
                  <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300",
                    isFilterCollapsed ? "lg:grid-cols-4" : "lg:grid-cols-3"
                  )}>
                    {recommendedArtworks.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Filter Sidebar */}
        <aside className={cn(
          "md:col-span-1 order-first md:order-none transition-all duration-300",
          isFilterCollapsed && "hidden"
        )}>
          <div className="sticky top-4">
            <FilterSidebar categories={categories} artists={artists} />
          </div>
        </aside>
      </div>
    </div>
  );
}
