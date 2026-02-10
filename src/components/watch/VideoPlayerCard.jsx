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
        iframeWindow.print = function () {
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

        // حجب الـ popups بالـ CSS مباشرة
        const injectCSS = () => {
          try {
            if (!iframeDoc) return;

            // CSS قوي لإخفاء جميع أنواع الـ popups
            const style = iframeDoc.createElement("style");
            style.id = "anti-popup-style";
            style.textContent = `
              /* إخفاء جميع الـ popups المركزة في الوسط */
              div[style*="position: absolute"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              
              /* إخفاء العناصر الموضعية المطلقة */
              [style*="left: 50%"],
              [style*="top: 50%"],
              [style*="transform: translate"],
              [style*="position: fixed"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              
              /* إخفاء النوافذ المنبثقة */
              .popup, .modal, #popup, .ad-overlay,
              .popup-overlay, .modal-overlay, .interstitial,
              .video-popup, .overlay, .modal-backdrop,
              .ad-container, .advertisement, .video-ad,
              .popup-container, .popup-wrapper,
              [id*="popup"], [class*="popup"],
              [id*="modal"], [class*="modal"],
              [id*="ad"], [class*="ad"],
              [id*="overlay"], [class*="overlay"],
              [id*="interstitial"], [class*="interstitial"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
                position: static !important;
                width: 0 !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              /* إخفاء العناصر التي تحتوي على "Ad" */
              div:has(> div:has(> div:has(> div:has(span:contains("Ad"))))) {
                display: none !important;
              }
              
              /* إخفاء جميع العناصر التي تحتوي على نصوص إعلانية */
              *:contains("Ad"),
              *:contains("Advertisement"),
              *:contains("Publicité") {
                display: none !important;
              }
              
              /* إخفاء الـ iframes المخفية */
              iframe[style*="display: none"],
              iframe[style*="visibility: hidden"] {
                display: none !important;
              }
              
              /* إخفاء العناصر الكبيرة في المنتصف */
              div[style*="max-width: 355px"],
              div[style*="min-width: 290px"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
              
              /* إخفاء جميع العناصر المطلقة */
              body > div[style*="!important"]:not([id="player"]):not([id="video"]):not([class*="player"]) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `;

            // إزالة الـ style القديم أولاً
            const oldStyle = iframeDoc.getElementById("anti-popup-style");
            if (oldStyle) oldStyle.remove();

            // إضافة الـ style الجديد
            iframeDoc.head.appendChild(style);
          } catch (err) {
            // CORS errors طبيعية
          }
        };

        // حذف العناصر المزعجة مباشرة
        const hidePopups = () => {
          try {
            if (!iframeDoc) return;

            // حذف العناصر المزعجة
            const badSelectors = `
              .popup, .modal, #popup, .ad-overlay,
              .popup-overlay, .modal-overlay, .interstitial,
              .video-popup, .overlay, .modal-backdrop,
              .ad-container, .advertisement, .video-ad,
              .popup-container, .popup-wrapper,
              [id*="popup"], [class*="popup"],
              [id*="modal"], [class*="modal"],
              [id*="ad"], [class*="ad"],
              [id*="overlay"], [class*="overlay"],
              [id*="interstitial"], [class*="interstitial"],
              div[style*="position: absolute"],
              div[style*="left: 50%"],
              div[style*="top: 50%"],
              div[style*="transform: translate"],
              div[style*="max-width: 355px"],
              div[style*="min-width: 290px"],
              div[style*="border-radius: 1.6em"],
              div[style*="box-shadow"],
              div[style*="pointer-events: all"]
            `;

            const badElements = iframeDoc.querySelectorAll(badSelectors);

            badElements.forEach((el) => {
              try {
                // إخفاء العنصر
                el.style.display = "none !important";
                el.style.visibility = "hidden !important";
                el.style.opacity = "0 !important";
                el.style.pointerEvents = "none !important";
                el.style.position = "static !important";

                // حذف العنصر تماماً
                setTimeout(() => {
                  try {
                    if (el.parentNode) {
                      el.remove();
                    }
                  } catch (e) {}
                }, 10);
              } catch (e) {}
            });

            // حذف العناصر التي تحتوي على "Ad"
            const adElements = iframeDoc.querySelectorAll("*");
            adElements.forEach((el) => {
              try {
                if (
                  el.textContent &&
                  (el.textContent.includes("Ad") ||
                    el.textContent.includes("Publicité"))
                ) {
                  el.style.display = "none !important";
                  el.style.visibility = "hidden !important";
                  setTimeout(() => {
                    try {
                      if (el.parentNode) el.remove();
                    } catch (e) {}
                  }, 10);
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
          injectCSS();
        });

        try {
          observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
            attributeFilter: ["style", "class", "id"],
          });
        } catch (e) {}

        // حقن CSS فوراً
        injectCSS();

        // تطبيق الحماية كل 300 مللي ثانية
        setInterval(() => {
          hidePopups();
          injectCSS();
        }, 300);

        // تطبيق فوري متعدد
        setTimeout(hidePopups, 50);
        setTimeout(hidePopups, 100);
        setTimeout(hidePopups, 200);
        setTimeout(hidePopups, 300);
        setTimeout(hidePopups, 500);
        setTimeout(hidePopups, 1000);
        setTimeout(hidePopups, 2000);
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
