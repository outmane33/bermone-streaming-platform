"use client";
import React from "react";
import { useWatchLogic } from "./helpers/useWatchLogic";
import ServerSelectorCard from "./ServerSelectorCard";
import VideoPlayerCard from "./VideoPlayerCard";
import { Loader2 } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";

export default function WatchPage({ slug }) {
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

  if (isLoadingServers) {
    return (
      <div
        className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-6 text-center`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
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
    </div>
  );
}
