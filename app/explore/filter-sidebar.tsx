"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { PriceRangeFilter } from "@/components/price-range-filter";
import type { Database } from "@/lib/types";

interface FilterSidebarProps {
  categories: string[];
  artists: Database.Artist[];
}

export function FilterSidebar({ categories, artists }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [saleType, setSaleType] = useState(searchParams.get("saleType") || "all");
  const [minPrice, setMinPrice] = useState(parseInt(searchParams.get("minPrice") || "0"));
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get("maxPrice") || "1000000"));
  const [artistId, setArtistId] = useState(searchParams.get("artist") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");

  const updateURL = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("q", searchQuery);
    if (category && category !== "all") params.set("category", category);
    if (saleType && saleType !== "all") params.set("saleType", saleType);
    if (minPrice > 0) params.set("minPrice", minPrice.toString());
    if (maxPrice < 1000000) params.set("maxPrice", maxPrice.toString());
    if (artistId && artistId !== "all") params.set("artist", artistId);
    if (sortBy && sortBy !== "latest") params.set("sort", sortBy);
    params.set("page", "1"); // Reset to page 1 when filters change

    router.push(`/explore?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const handleReset = () => {
    setSearchQuery("");
    setCategory("all");
    setSaleType("all");
    setMinPrice(0);
    setMaxPrice(1000000);
    setArtistId("all");
    setSortBy("latest");
    router.push("/explore");
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="작품명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">카테고리</label>
        <Select value={category} onValueChange={(value) => { setCategory(value); }}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sale Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">판매 방식</label>
        <Select value={saleType} onValueChange={(value) => { setSaleType(value); }}>
          <SelectTrigger>
            <SelectValue placeholder="판매 방식" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="auction">경매</SelectItem>
            <SelectItem value="fixed">즉시 구매</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onChange={(min, max) => {
          setMinPrice(min);
          setMaxPrice(max);
        }}
      />

      {/* Artist */}
      <div className="space-y-2">
        <label className="text-sm font-medium">작가</label>
        <Select value={artistId} onValueChange={(value) => { setArtistId(value); }}>
          <SelectTrigger>
            <SelectValue placeholder="작가" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 작가</SelectItem>
            {artists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium">정렬</label>
        <Select value={sortBy} onValueChange={(value) => { setSortBy(value); }}>
          <SelectTrigger>
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="popular">인기순</SelectItem>
            <SelectItem value="price-low">가격 낮은순</SelectItem>
            <SelectItem value="price-high">가격 높은순</SelectItem>
            <SelectItem value="ending-soon">경매 마감 임박순</SelectItem>
            <SelectItem value="most-bids">입찰 수 많은순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Apply & Reset */}
      <div className="flex gap-2">
        <Button onClick={updateURL} className="flex-1">
          필터 적용
        </Button>
        <Button onClick={handleReset} variant="outline">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
