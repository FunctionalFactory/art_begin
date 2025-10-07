import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGenreMetadata, getArtworksByGenre } from "@/lib/queries/genres";
import { GENRE_CONFIG, getAllGenreSlugs } from "@/lib/constants/genres";
import { GenreClient } from "./genre-client";

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  // 주요 장르들은 빌드 시 미리 생성
  return getAllGenreSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenreMetadata(slug);

  if (!genre) {
    return {
      title: "장르를 찾을 수 없습니다 | ART-XHIBIT",
    };
  }

  return {
    title: `${genre.name} 작품 | ART-XHIBIT`,
    description: `${genre.description}. ${genre.artworkCount}개의 작품을 만나보세요.`,
    openGraph: {
      title: `${genre.name} 작품 | ART-XHIBIT`,
      description: genre.description,
      images: genre.featuredImage ? [genre.featuredImage] : [],
    },
  };
}

export const revalidate = 300; // 5분마다 재생성

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { slug } = await params;
  const { sort = "latest", page = "1" } = await searchParams;

  const genre = await getGenreMetadata(slug);

  if (!genre) {
    notFound();
  }

  const currentPage = parseInt(page);
  const limit = 24;

  const { artworks, totalCount } = await getArtworksByGenre(slug, {
    page: currentPage,
    limit,
    sortBy: sort as any,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <GenreClient
      genre={genre}
      artworks={artworks}
      totalPages={totalPages}
      currentPage={currentPage}
    />
  );
}
