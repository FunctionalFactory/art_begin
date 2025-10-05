"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ArtworkCard } from "@/components/artwork-card";
import { EmptyState } from "@/components/empty-state";
import { FilterSidebar } from "./filter-sidebar";
import { Pagination } from "./pagination";
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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">작품 둘러보기</h1>
        <p className="text-muted-foreground">
          {artworks.length > 0
            ? `${artworks.length}개의 작품을 발견했습니다`
            : "검색 결과가 없습니다"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <aside className="md:col-span-1">
          <div className="sticky top-4">
            <FilterSidebar categories={categories} artists={artists} />
          </div>
        </aside>

        {/* Artworks Grid */}
        <main className="md:col-span-3">
          {artworks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedArtworks.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
