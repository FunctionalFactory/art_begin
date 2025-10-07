import { createClient } from "@/utils/supabase/server";
import {
  GENRE_CONFIG,
  slugToCategory,
  categoryToSlug,
} from "@/lib/constants/genres";
import type {
  Genre,
  GenreArtwork,
  GenreQueryOptions,
} from "@/lib/types/genre";

/**
 * 모든 장르 목록과 통계 가져오기
 */
export async function getAllGenres(): Promise<Genre[]> {
  const supabase = await createClient();

  // 장르별 통계 계산
  const { data, error } = await supabase
    .from("artworks")
    .select("category, artist_id, image_url, views")
    .eq("status", "active");

  if (error) {
    console.error("Error fetching genres:", error);
    throw error;
  }

  // 장르별로 그룹화
  const genreMap = new Map<
    string,
    {
      count: number;
      artists: Set<string>;
      featuredImage: string | null;
      maxViews: number;
    }
  >();

  data?.forEach((artwork) => {
    const slug = categoryToSlug(artwork.category);
    if (!genreMap.has(slug)) {
      genreMap.set(slug, {
        count: 0,
        artists: new Set(),
        featuredImage: artwork.image_url,
        maxViews: artwork.views || 0,
      });
    }
    const stats = genreMap.get(slug)!;
    stats.count++;
    stats.artists.add(artwork.artist_id);

    // 조회수가 더 높은 작품을 대표 이미지로 설정
    if ((artwork.views || 0) > stats.maxViews) {
      stats.featuredImage = artwork.image_url;
      stats.maxViews = artwork.views || 0;
    }
  });

  // Genre 객체 배열로 변환
  return Object.entries(GENRE_CONFIG)
    .map(([slug, config]) => {
      const stats = genreMap.get(slug) || {
        count: 0,
        artists: new Set(),
        featuredImage: null,
        maxViews: 0,
      };
      return {
        slug,
        name: config.name,
        nameEn: config.nameEn,
        description: config.description,
        icon: config.icon,
        artworkCount: stats.count,
        artistCount: stats.artists.size,
        featuredImage: stats.featuredImage,
      };
    })
    .filter((genre) => genre.artworkCount > 0) // 작품이 있는 장르만
    .sort((a, b) => b.artworkCount - a.artworkCount); // 작품 수 내림차순
}

/**
 * 특정 장르의 작품 목록 가져오기
 */
export async function getArtworksByGenre(
  slug: string,
  options: GenreQueryOptions = {}
): Promise<{ artworks: GenreArtwork[]; totalCount: number }> {
  const supabase = await createClient();
  const { page = 1, limit = 24, sortBy = "latest" } = options;
  const offset = (page - 1) * limit;
  const category = slugToCategory(slug);

  // 정렬 설정
  let orderColumn: string;
  let ascending: boolean;

  switch (sortBy) {
    case "popular":
      orderColumn = "views";
      ascending = false;
      break;
    case "price-asc":
      orderColumn = "fixed_price";
      ascending = true;
      break;
    case "price-desc":
      orderColumn = "fixed_price";
      ascending = false;
      break;
    default:
      orderColumn = "created_at";
      ascending = false;
  }

  // 작품 조회
  const query = supabase
    .from("artworks")
    .select(
      `
      id,
      title,
      image_url,
      artist_id,
      category,
      artists!inner(name)
    `,
      { count: "exact" }
    )
    .eq("category", category)
    .eq("status", "active")
    .order(orderColumn, { ascending })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching artworks by genre:", error);
    throw error;
  }

  const artworks: GenreArtwork[] = (data || []).map((artwork: any) => ({
    id: artwork.id,
    title: artwork.title,
    imageUrl: artwork.image_url,
    artistId: artwork.artist_id,
    artistName: artwork.artists?.name || "Unknown",
    category: artwork.category,
  }));

  return {
    artworks,
    totalCount: count || 0,
  };
}

/**
 * 특정 장르의 메타데이터 가져오기
 */
export async function getGenreMetadata(slug: string): Promise<Genre | null> {
  const config = GENRE_CONFIG[slug as keyof typeof GENRE_CONFIG];
  if (!config) return null;

  const supabase = await createClient();
  const category = slugToCategory(slug);

  // 장르의 대표 이미지 (조회수가 가장 높은 작품)
  const { data: featuredData } = await supabase
    .from("artworks")
    .select("image_url")
    .eq("category", category)
    .eq("status", "active")
    .order("views", { ascending: false })
    .limit(1)
    .single();

  // 작품 수 계산
  const { count: artworkCount } = await supabase
    .from("artworks")
    .select("*", { count: "exact", head: true })
    .eq("category", category)
    .eq("status", "active");

  // 작가 수 계산 (DISTINCT artist_id)
  const { data: artistsData } = await supabase
    .from("artworks")
    .select("artist_id")
    .eq("category", category)
    .eq("status", "active");

  const uniqueArtists = new Set(artistsData?.map((a) => a.artist_id) || []);

  return {
    slug,
    name: config.name,
    nameEn: config.nameEn,
    description: config.description,
    icon: config.icon,
    artworkCount: artworkCount || 0,
    artistCount: uniqueArtists.size,
    featuredImage: featuredData?.image_url || null,
  };
}
