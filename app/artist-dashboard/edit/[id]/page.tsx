import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getProfileByUserId,
  getArtistByUserId,
  getArtworkById,
} from "@/lib/queries";
import { ArtworkForm } from "@/components/artwork-form";
import { updateArtworkAction, deleteArtworkAction } from "./actions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EditArtworkClient } from "./edit-artwork-client";

export default async function EditArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Get artwork
  const artwork = await getArtworkById(id);

  if (!artwork) {
    redirect("/artist-dashboard");
  }

  // Check if this artwork belongs to the current artist
  if (artwork.artist_id !== artist.id) {
    redirect("/artist-dashboard");
  }

  // Prepare initial data for the form
  const initialData = {
    title: artwork.title,
    description: artwork.description || "",
    image_url: artwork.image_url,
    category: artwork.category,
    sale_type: artwork.sale_type,
    fixed_price: artwork.fixed_price || undefined,
    current_price: artwork.current_price || undefined,
    auction_end_time: artwork.auction_end_time
      ? new Date(artwork.auction_end_time).toISOString().slice(0, 16)
      : undefined,
  };

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

      <h1 className="text-3xl font-bold mb-2">작품 수정</h1>
      <p className="text-muted-foreground mb-8">작품 정보를 수정하세요</p>

      <EditArtworkClient
        artworkId={id}
        initialData={initialData}
        updateAction={updateArtworkAction}
        deleteAction={deleteArtworkAction}
      />
    </div>
  );
}
