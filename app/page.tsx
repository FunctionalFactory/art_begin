import { ArtworkCard } from "@/components/artwork-card";
import { Button } from "@/components/ui/button";
import { getFeaturedArtworks, getEndingSoonArtworks } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const featuredArtworks = getFeaturedArtworks();
  const endingSoonArtworks = getEndingSoonArtworks();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          재능 있는 작가들의 작품을
          <br />
          합리적인 가격에 만나보세요
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          무명 작가들의 숨겨진 보석 같은 작품을 발견하고 소장하세요
        </p>
        <Link href="/explore">
          <Button size="lg" className="text-lg px-8 py-6">
            작품 둘러보기
          </Button>
        </Link>
      </section>

      {/* Featured Artworks Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">지금 주목받는 신진 작가 작품</h2>
          <Link href="/explore">
            <Button variant="ghost">전체 보기 →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </section>

      {/* Ending Soon Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">마감 임박 경매</h2>
          <Link href="/explore?filter=auction">
            <Button variant="ghost">전체 보기 →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {endingSoonArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">작가이신가요?</h2>
        <p className="text-lg text-muted-foreground mb-6">
          ART-XHIBIT에서 당신의 작품을 세상에 알려보세요
        </p>
        <Link href="/signup">
          <Button size="lg">작가로 시작하기</Button>
        </Link>
      </section>
    </div>
  );
}
