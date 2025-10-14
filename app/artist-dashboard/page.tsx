import { redirect } from "next/navigation";

export default async function ArtistDashboardPage() {
  // Redirect to My Page with artist tab
  redirect("/my-page?tab=artist");
}
