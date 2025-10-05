"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/lib/types";

interface ArtworkFormProps {
  initialData?: {
    title: string;
    description: string;
    image_url: string;
    category: string;
    sale_type: "auction" | "fixed";
    fixed_price?: number;
    current_price?: number;
    auction_end_time?: string;
  };
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  submitLabel?: string;
}

export function ArtworkForm({
  initialData,
  onSubmit,
  submitLabel = "등록하기",
}: ArtworkFormProps) {
  const [saleType, setSaleType] = useState<"auction" | "fixed">(
    initialData?.sale_type || "fixed"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await onSubmit(formData);

    if (!result.success) {
      setError(result.error || "작업 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">작품명 *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialData?.title}
          required
          placeholder="작품의 제목을 입력하세요"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">작품 설명</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description}
          placeholder="작품에 대한 설명을 입력하세요"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">이미지 URL *</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={initialData?.image_url}
          required
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-sm text-muted-foreground">
          작품 이미지의 URL을 입력하세요
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">카테고리 *</Label>
        <Select name="category" defaultValue={initialData?.category || "painting"}>
          <SelectTrigger>
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="painting">회화</SelectItem>
            <SelectItem value="sculpture">조각</SelectItem>
            <SelectItem value="photography">사진</SelectItem>
            <SelectItem value="digital">디지털 아트</SelectItem>
            <SelectItem value="mixed">혼합 매체</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sale_type">판매 방식 *</Label>
        <Select
          name="sale_type"
          value={saleType}
          onValueChange={(value) => setSaleType(value as "auction" | "fixed")}
        >
          <SelectTrigger>
            <SelectValue placeholder="판매 방식 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">즉시 구매</SelectItem>
            <SelectItem value="auction">경매</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {saleType === "fixed" && (
        <div className="space-y-2">
          <Label htmlFor="fixed_price">판매 가격 (원) *</Label>
          <Input
            id="fixed_price"
            name="fixed_price"
            type="number"
            defaultValue={initialData?.fixed_price}
            required={saleType === "fixed"}
            placeholder="100000"
            min="0"
            step="1000"
          />
        </div>
      )}

      {saleType === "auction" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="current_price">시작 가격 (원) *</Label>
            <Input
              id="current_price"
              name="current_price"
              type="number"
              defaultValue={initialData?.current_price}
              required={saleType === "auction"}
              placeholder="50000"
              min="0"
              step="1000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auction_end_time">경매 종료 시간 *</Label>
            <Input
              id="auction_end_time"
              name="auction_end_time"
              type="datetime-local"
              defaultValue={initialData?.auction_end_time}
              required={saleType === "auction"}
            />
          </div>
        </>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "처리 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
