import { notFound } from "next/navigation";
import { getAvailableQualities } from "@/actions/download";
import { getSeasonsBySeries, getEpisodesBySeason } from "@/actions/series";
import { resolveMediaBySlug } from "@/lib/mediaResolver";
import { serializers } from "@/lib/mediaSerializers";
import { CONTENT_TYPES } from "@/lib/mediaResolver";
import SecureDownloadClient from "@/components/download/SecureDownloadClient";

export default async function DownloadContentWrapper({ slug }) {
  const result = await getAvailableQualities(slug);

  if (!result.success || result.qualities.length === 0) {
    notFound();
  }

  let seasons = null;
  let allSeasonEpisodes = {};
  let currentSeasonId = null;

  if (result.type === "episode" || result.type === "season") {
    const resolved = await resolveMediaBySlug(slug);

    if (resolved) {
      const seriesId =
        result.type === "episode"
          ? resolved.data.series._id
          : resolved.data.season?.seriesId || resolved.data.series?._id;

      currentSeasonId =
        result.type === "episode"
          ? resolved.data.season._id
          : resolved.data.season._id;

      const { success, seasons: allSeasons } =
        await getSeasonsBySeries(seriesId);

      if (success && allSeasons) {
        seasons = allSeasons.map((s) => serializers[CONTENT_TYPES.SEASON](s));

        const episodesResults = await Promise.all(
          allSeasons.map(async (season) => {
            const { success: ok, episodes } = await getEpisodesBySeason(
              season._id,
            );
            if (ok && episodes) {
              return {
                seasonId: season._id,
                episodes: episodes.map((ep) =>
                  serializers[CONTENT_TYPES.EPISODE]({
                    episode: ep,
                    seasonImage: season.image,
                  }),
                ),
              };
            }
            return null;
          }),
        );

        episodesResults.forEach((r) => {
          if (r) allSeasonEpisodes[r.seasonId] = r.episodes;
        });
      }
    }
  }

  return (
    <SecureDownloadClient
      qualities={result.qualities}
      slug={slug}
      contentType={result.type}
      seasons={seasons}
      allSeasonEpisodes={allSeasonEpisodes}
      currentSeasonId={currentSeasonId}
    />
  );
}
