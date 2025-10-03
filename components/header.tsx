import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
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
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
