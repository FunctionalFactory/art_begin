import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getProfileByUserId, getArtworksByArtistUserId, getArtistSales } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Plus, Palette, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ArtworkList } from "./artwork-list";
import { SalesList } from "./sales-list";

export default async function ArtistDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check role
  const profile = await getProfileByUserId(user.id);

  if (!profile || profile.role !== "artist") {
    redirect("/my-page");
  }

  // Fetch artist's artworks
  const artworks = await getArtworksByArtistUserId(user.id);

  // Get artist ID from the first artwork or fetch separately
  let artistId: string | null = null;
  if (artworks.length > 0) {
    artistId = artworks[0].artist_id;
  } else {
    // Fetch artist record if no artworks yet
    const { data: artistData } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .single();
    artistId = artistData?.id || null;
  }

  // Fetch sales history
  const sales = artistId ? await getArtistSales(artistId) : [];

  // Calculate statistics
  const totalArtworks = artworks.length;
  const soldArtworks = artworks.filter((artwork) => artwork.status === "sold").length;
  const activeArtworks = artworks.filter((artwork) => artwork.status === "active").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">작가 대시보드</h1>
          <p className="text-muted-foreground">내 작품을 관리하세요</p>
        </div>
        <Link href="/artist-dashboard/new-artwork">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 작품 등록
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 작품 수</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArtworks}</div>
            <p className="text-xs text-muted-foreground">
              활성 작품 {activeArtworks}개
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">판매된 작품</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldArtworks}</div>
            <p className="text-xs text-muted-foreground">
              {totalArtworks > 0
                ? `${Math.round((soldArtworks / totalArtworks) * 100)}% 판매율`
                : "판매 없음"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {artworks.reduce((sum, artwork) => sum + artwork.views, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              평균{" "}
              {totalArtworks > 0
                ? Math.round(
                    artworks.reduce((sum, artwork) => sum + artwork.views, 0) /
                      totalArtworks
                  )
                : 0}
              회
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Artworks List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">내 작품 목록</h2>
        {artworks.length === 0 ? (
          <EmptyState
            icon={Palette}
            title="아직 등록된 작품이 없습니다"
            description="첫 번째 작품을 등록해보세요"
            action={{
              label: "작품 등록하기",
              href: "/artist-dashboard/new-artwork",
            }}
          />
        ) : (
          <ArtworkList artworks={artworks} />
        )}
      </div>

      {/* Sales History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">판매 내역</h2>
        <SalesList sales={sales} />
      </div>
    </div>
  );
}
