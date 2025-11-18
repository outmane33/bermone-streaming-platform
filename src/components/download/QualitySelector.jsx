import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

export default function QualitySelector({
  qualities,
  selectedQuality,
  onSelect,
  loading,
}) {
  return (
    <div
      role="radiogroup"
      aria-label="اختيار الجودة"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {qualities.map((quality) => {
        const isSelected = selectedQuality === quality;
        return (
          <button
            key={quality}
            onClick={() => onSelect(quality)}
            disabled={loading}
            className={`
              p-4 rounded-xl border backdrop-blur-md overflow-hidden cursor-pointer
              ${DESIGN_TOKENS.effects.transition}
              ${
                isSelected
                  ? "bg-white/20 border-white/40 scale-95 shadow-2xl border-2"
                  : loading
                  ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                  : `${DESIGN_TOKENS.glass.medium} ${DESIGN_TOKENS.glass.hover} hover:scale-98 hover:shadow-xl`
              }
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={`اختيار الجودة ${quality}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-right">
                <ICON_MAP.Film
                  className={`w-5 h-5 ${
                    isSelected ? "text-cyan-400" : "text-white/80"
                  }`}
                />
                <span className="text-white font-bold text-lg">{quality}</span>
              </div>
              {isSelected && (
                <ICON_MAP.CheckCircle className="w-6 h-6 text-cyan-400 animate-pulse" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
