import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function SkeletonArtworkCard() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="h-6 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
      </CardFooter>
    </Card>
  );
}
