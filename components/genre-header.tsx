"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Genre } from "@/lib/types/genre";

interface GenreHeaderProps {
  genre: Genre;
}

export function GenreHeader({ genre }: GenreHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page"); // 정렬 변경 시 첫 페이지로
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4 flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-5xl">{genre.icon}</span>
            {genre.name}
          </h1>
          <p className="text-muted-foreground text-lg">
            {genre.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-b py-4 flex-col sm:flex-row gap-4">
        <p className="text-sm text-muted-foreground">
          총{" "}
          <span className="font-semibold text-foreground">
            {genre.artworkCount.toLocaleString()}
          </span>
          개의 작품
        </p>

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="popular">인기순</SelectItem>
            <SelectItem value="price-asc">가격 낮은순</SelectItem>
            <SelectItem value="price-desc">가격 높은순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
