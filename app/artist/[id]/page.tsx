import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtworkCard } from "@/components/artwork-card";
import { getArtistById, getArtworksByArtist } from "@/lib/data";

interface ArtistPageProps {
  params: {
    id: string;
  };
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const artist = getArtistById(params.id);

  if (!artist) {
    notFound();
  }

  const artworks = getArtworksByArtist(params.id);
  const activeArtworks = artworks.filter((a) => a.status === "active");
  const soldArtworks = artworks.filter((a) => a.status === "sold");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Artist Profile Header */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={artist.profileImage}
                alt={artist.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">
                @{artist.username}
              </p>
              <p className="text-muted-foreground mb-6">{artist.bio}</p>
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">전체 작품</p>
                  <p className="text-2xl font-bold">{artist.totalArtworks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">판매 작품</p>
                  <p className="text-2xl font-bold">{artist.soldArtworks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">판매율</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (artist.soldArtworks / artist.totalArtworks) * 100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button size="lg">작가 팔로우</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artworks Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="active">
            판매 중 ({activeArtworks.length})
          </TabsTrigger>
          <TabsTrigger value="sold">
            판매 완료 ({soldArtworks.length})
          </TabsTrigger>
          <TabsTrigger value="all">전체 ({artworks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                현재 판매 중인 작품이 없습니다.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sold">
          {soldArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {soldArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                아직 판매된 작품이 없습니다.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
