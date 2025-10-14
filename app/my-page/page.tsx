import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Package, Gavel, Settings, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { getFavoritesByUser, getUserBidArtworks, getProfileByUserId, getUserOrders, getArtworksByArtistUserId, getArtistSales } from "@/lib/queries";
import { transformArtworkToLegacy } from "@/lib/utils/transform";
import { MyPageClient } from "./my-page-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BalanceSummary } from "@/components/balance-summary";

export default async function MyPage() {
  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check role
  const profile = await getProfileByUserId(user.id);
  const isArtist = profile?.role === "artist";

  // Fetch user's favorites from database
  const favoritesDb = await getFavoritesByUser(user.id);
  const favoriteArtworks = favoritesDb.map((fav) =>
    transformArtworkToLegacy(fav.artwork, true)
  );

  // Fetch user's bid history from database
  const bidsDb = await getUserBidArtworks(user.id);
  const bidHistory = bidsDb.map((bid) =>
    transformArtworkToLegacy(bid.artwork, undefined, bid.bid_amount, bid.status)
  );

  // Fetch user's order history from database
  const orders = await getUserOrders(user.id);

  // Fetch artist data if user is an artist
  let artistArtworks = null;
  let artistSales = null;
  if (isArtist) {
    // Get artworks by artist user ID
    artistArtworks = await getArtworksByArtistUserId(user.id);

    // Get artist ID from first artwork or fetch separately
    let artistId: string | null = null;
    if (artistArtworks.length > 0) {
      artistId = artistArtworks[0].artist_id;
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
    artistSales = artistId ? await getArtistSales(artistId) : [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 활동과 관심 작품을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile/edit">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              프로필 수정
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance Summary with Escrow */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">잔고 현황</h2>
          <Link href="/balance">
            <Button variant="outline" size="sm">
              충전하기
            </Button>
          </Link>
        </div>
        <BalanceSummary userId={user.id} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관심 작품</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteArtworks.length}</div>
            <p className="text-xs text-muted-foreground">좋아요 누른 작품</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">참여 경매</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bidHistory.length}</div>
            <p className="text-xs text-muted-foreground">입찰 중인 작품</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">구매 내역</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">구매한 작품</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <MyPageClient
        favoriteArtworks={favoriteArtworks}
        bidHistory={bidHistory}
        orders={orders}
        isArtist={isArtist}
        artistArtworks={artistArtworks}
        artistSales={artistSales}
      />
    </div>
  );
}
