import React from "react";
import { MediaTag } from "@/components/shared/card/MediaTag";

export const EpisodeTag = ({
  episode,
  watchPage = false,
  isCurrent = false,
  isLastEpisode = false,
  episodeType = null,
  downloadPage = false,
}) => {
  return (
    <MediaTag
      title={episode.title}
      subtitle={episode.duration}
      isActive={isCurrent}
      isLastEpisode={isLastEpisode}
      episodeType={episodeType}
      href={
        watchPage
          ? `/${episode.slug}/live`
          : downloadPage
            ? `/${episode.slug}/download`
            : `/${episode.slug}`
      }
    />
  );
};
