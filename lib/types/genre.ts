/**
 * 장르 정보 인터페이스
 */
export interface Genre {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  artworkCount: number;
  artistCount: number;
  featuredImage: string | null;
}

/**
 * 장르 페이지에서 사용하는 간소화된 작품 정보
 */
export interface GenreArtwork {
  id: string;
  title: string;
  imageUrl: string;
  artistId: string;
  artistName: string;
  category: string;
}

/**
 * 장르 상세 페이지 데이터
 */
export interface GenrePageData {
  genre: Genre;
  artworks: GenreArtwork[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * 장르 정렬 옵션
 */
export type GenreSortOption = "latest" | "popular" | "price-asc" | "price-desc";

/**
 * 장르 쿼리 옵션
 */
export interface GenreQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: GenreSortOption;
}
