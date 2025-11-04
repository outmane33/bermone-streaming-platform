import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

const QualityButton = ({ quality, isSelected, onClick, disabled }) => {
  const baseStyles = `p-4 rounded-xl backdrop-blur-md overflow-hidden border cursor-pointer`;
  const states = isSelected
    ? "bg-white/20 border-white/40 scale-95 shadow-2xl border-2"
    : disabled
    ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
    : `${DESIGN_TOKENS.glass.light} ${DESIGN_TOKENS.glass.hover} hover:scale-98 hover:shadow-xl`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${DESIGN_TOKENS.effects.transition} ${baseStyles} ${states}`}
      aria-label={`Select quality ${quality}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <ICON_MAP.Film
            className={`w-5 h-5 ${
              isSelected ? "text-cyan-400" : "text-white/80"
            }`}
          />
          <div className="text-right">
            <p className="text-white font-bold text-lg">{quality}</p>
          </div>
        </div>
        {isSelected && (
          <ICON_MAP.CheckCircle className="w-6 h-6 text-cyan-400 animate-pulse" />
        )}
      </div>
    </button>
  );
};

export default function QualitySelector({
  qualities,
  selectedQuality,
  onSelect,
  loading,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {qualities.map((quality, idx) => (
        <QualityButton
          key={idx}
          quality={quality}
          isSelected={selectedQuality === idx}
          onClick={() => onSelect(quality, idx)}
          disabled={loading}
        />
      ))}
    </div>
  );
}
