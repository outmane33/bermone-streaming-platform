import React from "react";
import { EpisodeTag } from "@/components/shared/card/EpisodeTag";
import { MediaSwitcher } from "./MediaSwitcher";

export default function EpisodeSwitcher({
  episodes,
  currentSlug,
  seasonStatus,
}) {
  const decodedCurrentSlug = decodeURIComponent(currentSlug);

  const maxEpisodeNumber =
    episodes?.length > 0
      ? Math.max(...episodes.map((ep) => ep.episodeNumber || 0))
      : 0;

  return (
    <MediaSwitcher
      title="الحلقات"
      items={episodes}
      renderItem={(episode) => {
        const isLastEpisode =
          seasonStatus === "مكتمل" &&
          episode.episodeNumber === maxEpisodeNumber;

        return (
          <div
            className={
              episode.slug === decodedCurrentSlug
                ? "ring-2 ring-cyan-400 rounded-lg relative"
                : ""
            }
          >
            <EpisodeTag
              episode={episode}
              watchPage={true}
              isCurrent={episode.slug === decodedCurrentSlug}
              isLastEpisode={isLastEpisode}
            />
          </div>
        );
      }}
    />
  );
}
