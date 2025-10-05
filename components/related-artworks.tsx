import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Artwork } from "@/lib/types";

interface RelatedArtworksProps {
  artworks: Artwork[];
  title: string;
}

export function RelatedArtworks({ artworks, title }: RelatedArtworksProps) {
  if (artworks.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + " 원";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {artworks.map((artwork) => (
            <CarouselItem
              key={artwork.id}
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Link href={`/artwork/${artwork.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    {artwork.status === "sold" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-lg">
                          판매 완료
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <h3 className="font-semibold truncate">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {artwork.artistName}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{artwork.category}</Badge>
                      <p className="font-semibold text-sm">
                        {artwork.saleType === "auction"
                          ? formatPrice(artwork.currentPrice!)
                          : formatPrice(artwork.fixedPrice!)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
