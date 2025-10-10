import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Package, Gavel, Settings, Palette, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { getFavoritesByUser, getUserBidArtworks, getProfileByUserId, getUserOrders } from "@/lib/queries";
import { transformArtworkToLegacy } from "@/lib/utils/transform";
import { MyPageClient } from "./my-page-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/auction";

export default async function MyPage() {
  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile to check role and balance
  const profile = await getProfileByUserId(user.id);
  const isArtist = profile?.role === "artist";

  // Get user balance
  const { data: profileData } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();
  const userBalance = profileData?.balance ?? 0;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 활동과 관심 작품을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          {isArtist && (
            <Link href="/artist-dashboard">
              <Button variant="outline">
                <Palette className="w-4 h-4 mr-2" />
                작가 대시보드
              </Button>
            </Link>
          )}
          <Link href="/profile/edit">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              프로필 수정
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">보유 잔고</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(userBalance)}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">사용 가능한 금액</p>
              <Link href="/balance">
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  충전하기 →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
      />
    </div>
  );
}
