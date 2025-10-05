import { searchArtworks, getFeaturedArtworks, getUserFavoritesMap, getAllArtists } from "@/lib/queries";
import { transformArtworkToLegacy } from "@/lib/utils/transform";
import { createClient } from "@/utils/supabase/server";
import { ExploreClient } from "./explore-client";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    saleType?: string;
    minPrice?: string;
    maxPrice?: string;
    artist?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 12;

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Search artworks with filters
  const { artworks: artworksDb, totalCount } = await searchArtworks({
    searchQuery: params.q,
    category: params.category,
    saleType: params.saleType,
    priceMin: params.minPrice ? parseInt(params.minPrice) : undefined,
    priceMax: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    artistId: params.artist,
    sortBy: params.sort,
    page,
    limit,
  });

  // Get user's favorites map for all artworks
  const artworkIds = artworksDb.map((a) => a.id);
  const favoritesMap = await getUserFavoritesMap(user?.id, artworkIds);

  // Transform with like status
  const artworks = artworksDb.map((artwork) =>
    transformArtworkToLegacy(artwork, favoritesMap.get(artwork.id))
  );

  // Get recommended artworks if no results
  let recommendedArtworks: typeof artworks = [];
  if (artworks.length === 0) {
    const featuredDb = await getFeaturedArtworks();
    const featuredIds = featuredDb.map((a) => a.id);
    const featuredFavoritesMap = await getUserFavoritesMap(user?.id, featuredIds);
    recommendedArtworks = featuredDb.map((artwork) =>
      transformArtworkToLegacy(artwork, featuredFavoritesMap.get(artwork.id))
    );
  }

  // Get all artists and categories for filters
  const artists = await getAllArtists();
  const allArtworksForCategories = await searchArtworks({ limit: 1000 });
  const categories = Array.from(
    new Set(allArtworksForCategories.artworks.map((a) => a.category))
  ).sort();

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <ExploreClient
      artworks={artworks}
      recommendedArtworks={recommendedArtworks}
      totalPages={totalPages}
      currentPage={page}
      categories={categories}
      artists={artists}
    />
  );
}
