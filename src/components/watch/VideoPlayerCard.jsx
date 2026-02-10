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

  // تحديد الـ sandbox attributes حسب نوع السيرفر
  const getSandboxAttributes = () => {
    const serverName = activeServer?.name;

    // EarnVids يحتاج بعض الأذونات لكن يمكننا تقييده
    if (serverName === "EarnVids") {
      return "allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-orientation-lock";
    }

    // السيرفرات الأخرى
    return "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-orientation-lock";
  };

  // حماية مخصصة لـ EarnVids من الـ popups
  const handleIframeLoad = (e) => {
    const serverName = activeServer?.name;

    // حماية EarnVids فقط
    if (serverName !== "EarnVids") return;

    try {
      const iframe = e.target;
      const iframeWindow = iframe.contentWindow;

      if (iframeWindow) {
        // حفظ الدالة الأصلية
        const originalOpen = iframeWindow.open;

        // منع جميع الـ popups من EarnVids
        iframeWindow.open = function (url, name, specs) {
          console.log("🚫 EarnVids Popup blocked:", url);
          return null;
        };

        // منع الـ alerts المزعجة
        iframeWindow.alert = function (msg) {
          console.log("🚫 EarnVids Alert blocked:", msg);
        };

        // منع الـ confirms
        iframeWindow.confirm = function (msg) {
          console.log("🚫 EarnVids Confirm blocked:", msg);
          return false;
        };

        // منع الـ prompts
        iframeWindow.prompt = function (msg) {
          console.log("🚫 EarnVids Prompt blocked:", msg);
          return null;
        };

        // منع setTimeout و setInterval المزعجين
        const originalSetTimeout = iframeWindow.setTimeout;
        const originalSetInterval = iframeWindow.setInterval;

        iframeWindow.setTimeout = function (func, delay) {
          if (delay && delay < 5000) {
            // منع التايم أوت السريع
            console.log("🚫 EarnVids setTimeout blocked:", delay);
            return null;
          }
          return originalSetTimeout.call(this, func, delay);
        };

        iframeWindow.setInterval = function (func, delay) {
          if (delay && delay < 10000) {
            // منع الإنترفال السريع
            console.log("🚫 EarnVids setInterval blocked:", delay);
            return null;
          }
          return originalSetInterval.call(this, func, delay);
        };
      }
    } catch (err) {
      // CORS errors طبيعية
      console.log("CORS error (normal):", err.message);
    }
  };

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
              src={iframeUrl}
              sandbox={getSandboxAttributes()}
              referrerPolicy="no-referrer"
              loading="lazy"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
              title={`Video - ${activeServer?.name}`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              onError={() => {}}
              onLoad={handleIframeLoad}
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
