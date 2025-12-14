import React, { useState, useEffect } from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Link from "next/link";
import Button from "../shared/heroSection/Button";

export default function ServerSelectorCard({
  servers,
  activeServerIdx,
  onServerChange,
  isLoading = false,
  slug,
  onQualityChange,
  selectedQuality = null,
}) {
  const [availableQualities, setAvailableQualities] = useState([]);
  const [isQualitiesOpen, setIsQualitiesOpen] = useState(false);

  useEffect(() => {
    if (servers && servers.length > 0) {
      // Check if active server is StreamHG
      const activeServer = servers[activeServerIdx];
      if (
        activeServer?.name === "StreamHG" ||
        activeServer?.name === "MixDrop" ||
        activeServer?.name === "EarnVids"
      ) {
        setAvailableQualities([]);
        return;
      }

      const qualitiesSet = new Set();
      servers.forEach((server) => {
        if (server.qualities && Array.isArray(server.qualities)) {
          server.qualities.forEach((q) => {
            const match = q.quality?.match(/(\d+)p/);
            if (match) {
              qualitiesSet.add(match[1]);
            }
          });
        }
      });

      const sortedQualities = Array.from(qualitiesSet).sort((a, b) => b - a);
      setAvailableQualities(sortedQualities);
    }
  }, [servers, activeServerIdx]);

  // Set default quality when qualities become available
  useEffect(() => {
    if (!selectedQuality && availableQualities.length > 0 && onQualityChange) {
      onQualityChange(availableQualities[0]);
    }
    // Only run when availableQualities changes, not when onQualityChange or selectedQuality changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableQualities]);

  if (isLoading) return null;
  if (!servers?.length) return null;

  const cleanSlug = slug?.startsWith("/") ? slug : `/${slug}`;

  return (
    <div className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-4 shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ICON_MAP.Server className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <h2 className="text-base font-semibold text-white">اختر السيرفر</h2>
        </div>
        <Link href={cleanSlug}>
          <Button variant="secondary" size="small" icon={ICON_MAP.ArrowLeft}>
            عودة للتفاصيل
          </Button>
        </Link>
      </div>

      {/* Quality Selector */}
      {availableQualities.length > 1 && (
        <div className="mb-3">
          <button
            onClick={() => setIsQualitiesOpen(!isQualitiesOpen)}
            className={`w-full ${DESIGN_TOKENS.glass.light} rounded-lg p-3 transition-all hover:bg-white/10`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${DESIGN_TOKENS.gradients.cyan} flex items-center justify-center`}
                >
                  <ICON_MAP.Server className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-white font-medium text-sm">
                    {selectedQuality
                      ? `سيرفرات المشاهدة ${selectedQuality}p`
                      : "اختر الجودة"}
                  </div>
                  <div className="text-white/50 text-xs">
                    اضغط هنا لاختيار الجودة
                  </div>
                </div>
              </div>
              <ICON_MAP.ChevronRight
                className={`w-4 h-4 text-cyan-400 transition-transform ${
                  isQualitiesOpen ? "-rotate-90" : "rotate-90"
                }`}
              />
            </div>
          </button>

          {/* Dropdown */}
          {isQualitiesOpen && (
            <div
              className={`mt-2 ${DESIGN_TOKENS.glass.medium} rounded-lg overflow-hidden border border-white/10`}
            >
              {availableQualities.map((quality) => (
                <button
                  key={quality}
                  onClick={() => {
                    onQualityChange(quality);
                    setIsQualitiesOpen(false);
                  }}
                  className={`w-full p-3 flex items-center gap-3 transition-all hover:bg-white/5 ${
                    selectedQuality === quality ? "bg-cyan-500/10" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      selectedQuality === quality
                        ? `bg-gradient-to-br ${DESIGN_TOKENS.gradients.cyan} text-white`
                        : "bg-white/5 text-white/70"
                    }`}
                  >
                    {quality}
                  </div>
                  <div className="text-right flex-1">
                    <div className="text-white text-sm">
                      بجودة{" "}
                      <span className="font-semibold text-cyan-400">
                        {quality}p
                      </span>
                    </div>
                  </div>
                  {selectedQuality === quality && (
                    <ICON_MAP.CheckCircle className="w-5 h-5 text-cyan-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Server Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {servers.map((server, i) => (
          <button
            key={server.id}
            onClick={() => onServerChange(i)}
            disabled={server.status === "maintenance"}
            className={`
              px-3 py-2.5 xs:px-4 xs:py-3 rounded-lg font-medium truncate
              transition-all hover:scale-[1.03]
              ${
                i === activeServerIdx
                  ? `bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}`
                  : `${DESIGN_TOKENS.glass.light} ${DESIGN_TOKENS.glass.hover}`
              }
              ${
                server.status === "maintenance"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
          >
            <div className="flex items-center justify-center gap-1.5">
              {server.status === "active" ? (
                <ICON_MAP.CheckCircle className="w-3.5 h-3.5 text-white" />
              ) : (
                <ICON_MAP.AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
              )}
              <span className="text-white text-xs xs:text-sm truncate">
                {server.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {servers[activeServerIdx]?.status === "maintenance" && (
        <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            هذا السيرفر تحت الصيانة، يرجى اختيار سيرفر آخر
          </p>
        </div>
      )}
    </div>
  );
}
