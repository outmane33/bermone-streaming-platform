"use client";
import React, { useState } from "react";
import { useWatchLogic } from "./helpers/useWatchLogic";
import ServerSelectorCard from "./ServerSelectorCard";
import VideoPlayerCard from "./VideoPlayerCard";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import EpisodeSwitcher from "./EpisodeSwitcher";
import SeasonSwitcher from "./SeasonSwitcher";

export default function WatchPage({
  slug,
  allSeasonEpisodes = {},
  seasons = null,
  currentSeasonId: initialSeasonId = null,
}) {
  const [currentSeasonId, setCurrentSeasonId] = useState(initialSeasonId);
  const episodes = allSeasonEpisodes[currentSeasonId] || [];

  const currentSeason = seasons?.find((s) => s._id === currentSeasonId);
  const seasonStatus = currentSeason?.status;

  const {
    servers,
    activeServerIdx,
    iframeUrl,
    isLoadingServers,
    isLoadingIframe,
    hasStartedPlaying,
    error,
    handlePlayVideo,
    handleServerChange,
  } = useWatchLogic(slug);

  const handleSeasonChange = (seasonId) => {
    setCurrentSeasonId(seasonId);
  };

  if (isLoadingServers) {
    return (
      <div
        className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-6 text-center`}
      >
        <ICON_MAP.Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
        <p className="text-white">جاري تحميل السيرفرات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-1">
      {error && (
        <div className="p-3 bg-red-500/10 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <ServerSelectorCard
        servers={servers}
        activeServerIdx={activeServerIdx}
        onServerChange={handleServerChange}
        error={error}
        slug={slug}
      />

      <VideoPlayerCard
        servers={servers}
        activeServerIdx={activeServerIdx}
        iframeUrl={iframeUrl}
        hasStartedPlaying={hasStartedPlaying}
        isLoadingIframe={isLoadingIframe}
        onPlay={handlePlayVideo}
        error={error}
      />

      {seasons && seasons.length > 1 && (
        <SeasonSwitcher
          seasons={seasons}
          currentSeasonId={currentSeasonId}
          onSeasonChange={handleSeasonChange}
        />
      )}

      {episodes && episodes.length > 0 && (
        <EpisodeSwitcher
          episodes={episodes}
          currentSlug={slug}
          seasonStatus={seasonStatus}
        />
      )}
    </div>
  );
}
