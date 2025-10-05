import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getProfileByUserId, getArtistByUserId } from "@/lib/queries";
import { ArtworkForm } from "@/components/artwork-form";
import { createArtworkAction } from "./actions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewArtworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an artist
  const profile = await getProfileByUserId(user.id);

  if (!profile || profile.role !== "artist") {
    redirect("/my-page");
  }

  // Get artist record
  const artist = await getArtistByUserId(user.id);

  if (!artist) {
    redirect("/profile/edit");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/artist-dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">새 작품 등록</h1>
      <p className="text-muted-foreground mb-8">
        판매할 작품 정보를 입력하세요
      </p>

      <ArtworkForm onSubmit={createArtworkAction} submitLabel="작품 등록" />
    </div>
  );
}
