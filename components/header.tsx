import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { getProfileByUserId } from "@/lib/queries";
import { MobileNav } from "@/components/mobile-nav";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile to check role
  const profile = user ? await getProfileByUserId(user.id) : null;
  const isArtist = profile?.role === "artist";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <MobileNav user={user} isArtist={isArtist} />
          <Link href="/" className="text-2xl font-bold" aria-label="홈으로 이동">
            ART-XHIBIT
          </Link>
          <nav className="hidden md:flex space-x-6" role="navigation" aria-label="주요 네비게이션">
            <Link
              href="/explore"
              className="text-sm font-medium hover:text-primary transition-colors"
              aria-label="작품 둘러보기"
            >
              Explore
            </Link>
            <Link
              href="/genres"
              className="text-sm font-medium hover:text-primary transition-colors"
              aria-label="장르별 작품"
            >
              Genres
            </Link>
            <Link
              href="/artists"
              className="text-sm font-medium hover:text-primary transition-colors"
              aria-label="작가 목록"
            >
              Artists
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/my-page">
                <Button variant="ghost">My Page</Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="ghost">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
