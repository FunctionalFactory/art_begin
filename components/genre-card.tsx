"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Genre } from "@/lib/types/genre";

interface GenreCardProps {
  genre: Genre;
  index?: number;
}

export function GenreCard({ genre, index = 0 }: GenreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/genres/${genre.slug}`}>
        <Card className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {genre.featuredImage ? (
              <Image
                src={genre.featuredImage}
                alt={genre.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-primary/10 to-primary/5">
                {genre.icon}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-lg">
                {genre.name}
              </h3>
              <p className="text-white/90 text-sm line-clamp-2 drop-shadow">
                {genre.description}
              </p>
            </div>
          </div>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">
                  {genre.artworkCount.toLocaleString()}
                </span>
                <span className="ml-1">작품</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  {genre.artistCount.toLocaleString()}
                </span>
                <span className="ml-1">작가</span>
              </div>
            </div>
            <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              둘러보기 →
            </Badge>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
