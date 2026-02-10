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

  // حماية مخصصة من الـ popups
  const handleIframeLoad = (e) => {
    const serverName = activeServer?.name;

    try {
      const iframe = e.target;
      const iframeWindow = iframe.contentWindow;
      const iframeDoc = iframe.contentDocument || iframeWindow.document;

      if (iframeWindow) {
        // منع جميع النوافذ المنبثقة
        iframeWindow.open = function (url, name, specs, replace) {
          console.log("🚫 Popup blocked:", url);
          return null;
        };

        // منع النوافذ الجديدة
        iframeWindow.showModalDialog = function () {
          return null;
        };
        iframeWindow.showModelessDialog = function () {
          return null;
        };

        // منع التنبيهات
        iframeWindow.alert = function (msg) {
          console.log("🚫 Alert blocked");
        };
        iframeWindow.confirm = function (msg) {
          console.log("🚫 Confirm blocked");
          return false;
        };
        iframeWindow.prompt = function (msg) {
          console.log("🚫 Prompt blocked");
          return null;
        };

        // منع النوافذ المنبثقة عبر setTimeout
        const originalSetTimeout = iframeWindow.setTimeout;
        iframeWindow.setTimeout = function (func, delay, ...args) {
          if (typeof func === "function" && delay < 10000) {
            try {
              const funcStr = func.toString().toLowerCase();
              if (
                funcStr.includes("open") ||
                funcStr.includes("popup") ||
                funcStr.includes("window")
              ) {
                console.log("🚫 setTimeout popup blocked");
                return null;
              }
            } catch (e) {}
          }
          return originalSetTimeout.call(this, func, delay, ...args);
        };

        // منع النوافذ المنبثقة عبر setInterval
        const originalSetInterval = iframeWindow.setInterval;
        iframeWindow.setInterval = function (func, delay, ...args) {
          if (typeof func === "function" && delay < 15000) {
            try {
              const funcStr = func.toString().toLowerCase();
              if (
                funcStr.includes("open") ||
                funcStr.includes("popup") ||
                funcStr.includes("window")
              ) {
                console.log("🚫 setInterval popup blocked");
                return null;
              }
            } catch (e) {}
          }
          return originalSetInterval.call(this, func, delay, ...args);
        };

        // حجب عناصر الـ popup المشتركة
        const hidePopups = () => {
          try {
            if (!iframeDoc) return;

            // حذف العناصر المزعجة
            const badElements = iframeDoc.querySelectorAll(`
              .popup, .modal, #popup, .ad-overlay,
              .popup-overlay, .modal-overlay, .interstitial,
              .video-popup, .overlay, .modal-backdrop,
              .ad-container, .advertisement, .video-ad,
              [id*="popup"], [class*="popup"],
              [id*="modal"], [class*="modal"],
              [id*="ad"], [class*="ad"],
              [id*="overlay"], [class*="overlay"]
            `);

            badElements.forEach((el) => {
              try {
                el.remove();
              } catch (e) {}
            });

            // إخفاء العناصر بالـ style
            const styleElements = iframeDoc.querySelectorAll(
              'style, link[rel="stylesheet"]',
            );
            styleElements.forEach((el) => {
              try {
                if (
                  el.innerHTML?.includes(".popup") ||
                  el.innerHTML?.includes(".modal")
                ) {
                  el.innerHTML = el.innerHTML
                    .replace(
                      /\.popup[^}]*\{[^}]*\}/g,
                      ".popup{display:none!important;}",
                    )
                    .replace(
                      /\.modal[^}]*\{[^}]*\}/g,
                      ".modal{display:none!important;}",
                    );
                }
              } catch (e) {}
            });
          } catch (err) {
            // CORS errors طبيعية
          }
        };

        // مراقبة التغييرات في الـ DOM
        const observer = new MutationObserver((mutations) => {
          hidePopups();
        });

        try {
          observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
          });
        } catch (e) {}

        // تطبيق الحماية كل 500 مللي ثانية
        setInterval(hidePopups, 500);

        // تطبيق فوري
        setTimeout(hidePopups, 100);
        setTimeout(hidePopups, 500);
        setTimeout(hidePopups, 1000);
      }
    } catch (err) {
      // CORS errors طبيعية
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
