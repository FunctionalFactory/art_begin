"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageZoom } from "./image-zoom";

interface ImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function ImageGallery({ images, title, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const mainImage = images[selectedIndex] || images[0];
  const hasThumbnails = images.length > 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setIsZoomOpen(true)}
      >
        <Image
          src={mainImage}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
            클릭하여 확대
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {hasThumbnails && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <Image
                src={image}
                alt={`${title} - ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      <ImageZoom
        images={images}
        initialIndex={selectedIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        title={title}
      />
    </div>
  );
}
