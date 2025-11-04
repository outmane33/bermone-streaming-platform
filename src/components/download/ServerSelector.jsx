import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

const ServerButton = ({ server, isSelected, onClick, disabled }) => {
  const baseStyles = `p-4 rounded-xl overflow-hidden border cursor-pointer`;
  const states = isSelected
    ? "bg-white/20 border-white/40 scale-95 shadow-2xl border-2"
    : disabled
    ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
    : `${DESIGN_TOKENS.glass.light} ${DESIGN_TOKENS.glass.hover} hover:scale-95 hover:shadow-xl`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${DESIGN_TOKENS.effects.transition} ${baseStyles} ${states}`}
      aria-label={`Download from ${server}`}
      aria-pressed={isSelected}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} opacity-0 hover:opacity-20 transition-opacity`}
      />
      <div className="relative flex flex-col items-center gap-2">
        <div
          className={`p-2 bg-gradient-to-r ${
            DESIGN_TOKENS.gradients.cyan
          } rounded-lg transition-transform ${isSelected ? "scale-110" : ""}`}
        >
          <ICON_MAP.Server className="w-5 h-5 text-white" />
        </div>
        <p className="text-white font-bold text-sm">{server}</p>
      </div>
      {isSelected && (
        <ICON_MAP.CheckCircle className="absolute top-2 right-2 w-5 h-5 text-cyan-400 animate-pulse" />
      )}
    </button>
  );
};

export default function ServerSelector({
  services,
  selectedService,
  onSelect,
  loading,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <ICON_MAP.Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-white/80">Loading servers...</span>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        No servers available for this quality
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
      {services.map((service, idx) => (
        <ServerButton
          key={idx}
          server={service.serviceName}
          isSelected={selectedService === idx}
          onClick={() => onSelect(service, idx)}
          disabled={loading}
        />
      ))}
    </div>
  );
}
