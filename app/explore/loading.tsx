import { SkeletonArtworkCard } from "@/components/skeleton-artwork-card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 bg-muted rounded animate-pulse w-64 mb-2" />
        <div className="h-5 bg-muted rounded animate-pulse w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar Skeleton */}
        <aside className="md:col-span-1">
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </aside>

        {/* Artworks Grid Skeleton */}
        <main className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonArtworkCard key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
