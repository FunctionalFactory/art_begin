"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { GenreArtwork } from "@/lib/types/genre";

interface SimpleArtworkCardProps {
  artwork: GenreArtwork;
  index?: number;
}

export function SimpleArtworkCard({ artwork, index = 0 }: SimpleArtworkCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/artwork/${artwork.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={artwork.imageUrl}
            alt={`${artwork.title} by ${artwork.artistName}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {artwork.title}
          </h3>
          <Link
            href={`/artist/${artwork.artistId}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {artwork.artistName}
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
