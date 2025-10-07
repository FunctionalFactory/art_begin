import { Metadata } from "next";
import { getAllGenres } from "@/lib/queries/genres";
import { GenreCard } from "@/components/genre-card";

export const metadata: Metadata = {
  title: "장르별 작품 탐색 | ART-XHIBIT",
  description:
    "회화, 조각, 디지털 아트, 가구 등 다양한 장르의 작품을 탐색하세요.",
  openGraph: {
    title: "장르별 작품 탐색 | ART-XHIBIT",
    description:
      "회화, 조각, 디지털 아트, 가구 등 다양한 장르의 작품을 탐색하세요.",
  },
};

export const revalidate = 3600; // 1시간마다 재생성

export default async function GenresPage() {
  const genres = await getAllGenres();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">장르별 작품 탐색</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            다양한 예술 장르에서 당신의 취향에 맞는 작품을 발견하세요
          </p>
        </div>

        {/* 장르 그리드 */}
        {genres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre, index) => (
              <GenreCard key={genre.slug} genre={genre} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              등록된 장르가 없습니다.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              작품이 등록되면 장르가 자동으로 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
