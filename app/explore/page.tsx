import { getAllArtworks } from "@/lib/queries";
import { transformArtworkToLegacy } from "@/lib/utils/transform";
import { ExploreClient } from "./explore-client";

export default async function ExplorePage() {
  // Fetch artworks from database
  const artworksDb = await getAllArtworks();
  const artworks = artworksDb.map(transformArtworkToLegacy);

  return <ExploreClient artworks={artworks} />;
}
