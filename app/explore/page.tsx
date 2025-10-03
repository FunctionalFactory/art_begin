"use client";

import { useState } from "react";
import { ArtworkCard } from "@/components/artwork-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { artworks } from "@/lib/data";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");

  // Filter and sort artworks
  const filteredArtworks = artworks
    .filter((artwork) => {
      // Search filter
      if (
        searchQuery &&
        !artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !artwork.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && artwork.category !== categoryFilter) {
        return false;
      }

      // Sale type filter
      if (saleTypeFilter !== "all" && artwork.saleType !== saleTypeFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "popular":
          return b.likes - a.likes;
        case "price-low":
          const priceA = a.currentPrice || a.fixedPrice || 0;
          const priceB = b.currentPrice || b.fixedPrice || 0;
          return priceA - priceB;
        case "price-high":
          const priceA2 = a.currentPrice || a.fixedPrice || 0;
          const priceB2 = b.currentPrice || b.fixedPrice || 0;
          return priceB2 - priceA2;
        default:
          return 0;
      }
    });

  const categories = Array.from(new Set(artworks.map((a) => a.category)));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">작품 둘러보기</h1>
        <p className="text-muted-foreground">
          {filteredArtworks.length}개의 작품을 발견했습니다
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="작품명 또는 작가명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            필터
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="판매 방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="auction">경매</SelectItem>
              <SelectItem value="fixed">즉시 구매</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="price-low">가격 낮은순</SelectItem>
              <SelectItem value="price-high">가격 높은순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Artworks Grid */}
      {filteredArtworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            검색 결과가 없습니다.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
              setSaleTypeFilter("all");
            }}
            className="mt-4"
          >
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
