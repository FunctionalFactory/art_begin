"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavProps {
  user: {
    email?: string;
  } | null;
  isArtist: boolean;
}

export function MobileNav({ user, isArtist }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>
            <Link href="/" onClick={closeSheet} className="text-2xl font-bold">
              ART-XHIBIT
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-8" role="navigation" aria-label="모바일 네비게이션">
          <Link
            href="/explore"
            onClick={closeSheet}
            className="text-lg font-medium hover:text-primary transition-colors py-2"
          >
            Explore
          </Link>
          <Link
            href="/artists"
            onClick={closeSheet}
            className="text-lg font-medium hover:text-primary transition-colors py-2"
          >
            Artists
          </Link>
          {isArtist && (
            <Link
              href="/artist-dashboard"
              onClick={closeSheet}
              className="text-lg font-medium hover:text-primary transition-colors py-2"
            >
              Dashboard
            </Link>
          )}
          <div className="border-t pt-4 mt-4">
            {user ? (
              <>
                <Link
                  href="/my-page"
                  onClick={closeSheet}
                  className="text-lg font-medium hover:text-primary transition-colors py-2 block"
                >
                  My Page
                </Link>
                <div className="text-sm text-muted-foreground py-2">
                  {user.email}
                </div>
                <form action="/auth/signout" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start px-0 text-lg"
                  >
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeSheet} className="block mb-2">
                  <Button variant="ghost" className="w-full justify-start px-0 text-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeSheet} className="block">
                  <Button className="w-full text-lg">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
