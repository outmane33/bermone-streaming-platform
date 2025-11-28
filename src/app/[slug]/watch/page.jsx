import { notFound } from "next/navigation";
import { getServersBySlug } from "@/actions/getEpisodeServers";
import { resolveMediaBySlug } from "@/lib/mediaResolver";
import { getSeasonsBySeries, getEpisodesBySeason } from "@/actions/series";
import WatchPage from "@/components/watch/WatchPage";
import { serializers } from "@/lib/mediaSerializers";
import { CONTENT_TYPES } from "@/lib/mediaResolver";

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

  // Get media info to check if it's an episode
  const resolved = await resolveMediaBySlug(slug);
  let allSeasonEpisodes = {};
  let seasons = null;
  let currentSeasonId = null;

  if (resolved && resolved.type === "episode") {
    currentSeasonId = resolved.data.season._id;
    const seriesId = resolved.data.series._id;

    // Get all seasons for the series
    const { success, seasons: allSeasons } = await getSeasonsBySeries(seriesId);

    if (success && allSeasons) {
      // Serialize seasons
      seasons = allSeasons.map((s) => serializers[CONTENT_TYPES.SEASON](s));

      // Fetch episodes for ALL seasons upfront using Promise.all
      const episodesPromises = allSeasons.map(async (season) => {
        const { success: episodesSuccess, episodes } =
          await getEpisodesBySeason(season._id);

        if (episodesSuccess && episodes) {
          return {
            seasonId: season._id,
            episodes: episodes.map((ep) =>
              serializers[CONTENT_TYPES.EPISODE]({
                episode: ep,
                seasonImage: season.image,
              })
            ),
          };
        }
        return null;
      });

      const results = await Promise.all(episodesPromises);

      // Build the allSeasonEpisodes object
      results.forEach((result) => {
        if (result) {
          allSeasonEpisodes[result.seasonId] = result.episodes;
        }
      });
    }
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen">
        <WatchPage
          slug={slug}
          allSeasonEpisodes={allSeasonEpisodes}
          seasons={seasons}
          currentSeasonId={currentSeasonId}
        />
      </div>
    </>
  );
}
