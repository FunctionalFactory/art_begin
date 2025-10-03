import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold">
            ART-XHIBIT
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/explore"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/artists"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Artists
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
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
