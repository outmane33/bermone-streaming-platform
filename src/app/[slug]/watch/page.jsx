import { notFound } from "next/navigation";
import { getServersBySlug } from "@/actions/getEpisodeServers";
import WatchPage from "@/components/media/WatchPage";

export default async function WatchRoute({ params }) {
  // Await params for Next.js 15 compatibility
  const { slug } = await params;

  console.log("📍 Watch page - Slug:", slug);

  // Check if content exists before rendering
  const result = await getServersBySlug(slug);

  if (!result.success || !result.servers || result.servers.length === 0) {
    console.log("❌ Content not found, redirecting to 404");
    notFound();
  }

  return (
    <div className="min-h-screen">
      <WatchPage slug={slug} />
    </div>
  );
}
