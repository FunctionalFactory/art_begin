"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceRangeFilterProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChange,
}: PriceRangeFilterProps) {
  const [range, setRange] = useState([minPrice, maxPrice]);

  useEffect(() => {
    setRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const handleSliderChange = (values: number[]) => {
    setRange(values);
  };

  const handleSliderCommit = (values: number[]) => {
    onChange(values[0], values[1]);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const newRange = [Math.min(value, range[1]), range[1]];
    setRange(newRange);
    onChange(newRange[0], newRange[1]);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const newRange = [range[0], Math.max(value, range[0])];
    setRange(newRange);
    onChange(newRange[0], newRange[1]);
  };

  return (
    <div className="space-y-4">
      <Label>가격 범위</Label>
      <Slider
        min={0}
        max={1000000}
        step={10000}
        value={range}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        className="w-full"
      />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="min-price" className="text-xs text-muted-foreground">
            최소 (원)
          </Label>
          <Input
            id="min-price"
            type="number"
            value={range[0]}
            onChange={handleMinInputChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="max-price" className="text-xs text-muted-foreground">
            최대 (원)
          </Label>
          <Input
            id="max-price"
            type="number"
            value={range[1]}
            onChange={handleMaxInputChange}
            className="mt-1"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {range[0].toLocaleString('ko-KR')}원 - {range[1].toLocaleString('ko-KR')}원
      </p>
    </div>
  );
}
