import { notFound } from "next/navigation";
import { getServersBySlug } from "@/actions/getEpisodeServers";
import WatchPage from "@/components/watch/WatchPage";

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function WatchRoute({ params }) {
  const { slug } = await params;

  const result = await getServersBySlug(slug);

  if (!result.success || !result.servers || result.servers.length === 0) {
    console.log("❌ Content not found, redirecting to 404");
    notFound();
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen">
        <WatchPage slug={slug} />
      </div>
    </>
  );
}
