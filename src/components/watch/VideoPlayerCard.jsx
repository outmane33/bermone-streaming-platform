import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import { BlurBg } from "@/components/media/BlurBg";

export default function VideoPlayerCard({
  servers,
  activeServerIdx,
  iframeUrl,
  hasStartedPlaying,
  isLoadingIframe,
  onPlay,
  error,
}) {
  const activeServer = servers[activeServerIdx];
  const isMaintenance = activeServer?.status === "maintenance";

  // ⭐ فقط EarnVids يمر من الـ proxy
  const PROXIED_SERVERS = ["EarnVids"];
  const useProxy = PROXIED_SERVERS.includes(activeServer?.name);
  const finalUrl = iframeUrl
    ? useProxy
      ? `/api/proxy?url=${encodeURIComponent(iframeUrl)}`
      : iframeUrl
    : null;
  return (
    <div className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-4 shadow-xl`}>
      <div className="relative">
        <BlurBg position="top" size="32" />
        <BlurBg position="bottom" size="40" />

        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/50 border border-white/20">
          {!hasStartedPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={onPlay}
                disabled={isLoadingIframe || isMaintenance}
                className="group relative"
              >
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl opacity-60" />
                <div
                  className={`relative p-4 xs:p-5 rounded-full ${DESIGN_TOKENS.glass.medium} border-2 border-cyan-400/50`}
                >
                  {isLoadingIframe ? (
                    <ICON_MAP.Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                  ) : (
                    <ICON_MAP.Play className="w-10 h-10 text-cyan-400 fill-cyan-400" />
                  )}
                </div>
              </button>
            </div>
          ) : isLoadingIframe ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <ICON_MAP.Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
            </div>
          ) : iframeUrl ? (
            <iframe
              src={finalUrl}
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full"
              referrerPolicy="no-referrer"
              title={`Video - ${activeServer?.name}`}
            />
          ) : null}
        </div>

        {activeServer && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 rounded-lg">
            <div className="flex items-center gap-1.5">
              <ICON_MAP.Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white text-xs truncate max-w-[100px]">
                {activeServer.name}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 p-3 bg-white/5 rounded-lg">
        <p className="text-white/70 text-xs text-center">
          {error
            ? error
            : "إذا لم يعمل السيرفر، جرب سيرفرًا آخر من القائمة أعلاه"}
        </p>
      </div>
    </div>
  );
}
