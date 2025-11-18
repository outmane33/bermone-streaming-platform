import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

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
        <span className="mr-3 text-white/80">جارٍ تحميل السيرفرات...</span>
      </div>
    );
  }

  if (!services?.length) {
    return (
      <div className="text-center py-8 text-white/60">
        لا توجد سيرفرات متاحة لهذه الجودة
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="اختيار السيرفر"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {services.map((svc) => {
        const isSelected = selectedService === svc.serviceName;
        return (
          <button
            key={svc.serviceName}
            onClick={() => onSelect(svc.serviceName)}
            disabled={loading}
            className={`
              p-4 rounded-xl border overflow-hidden cursor-pointer relative
              ${DESIGN_TOKENS.effects.transition}
              ${
                isSelected
                  ? "bg-white/20 border-white/40 scale-95 shadow-2xl border-2"
                  : loading
                  ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                  : `${DESIGN_TOKENS.glass.medium} ${DESIGN_TOKENS.glass.hover} hover:scale-95 hover:shadow-xl`
              }
            `}
            role="radio"
            aria-checked={isSelected}
            aria-label={`تنزيل من ${svc.serviceName}`}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity"
              style={{ background: DESIGN_TOKENS.gradients.cyan }}
            />
            <div className="relative flex flex-col items-center gap-2">
              <div
                className={`p-2 rounded-lg transition-transform ${
                  isSelected ? "scale-110" : ""
                }`}
                style={{ background: DESIGN_TOKENS.gradients.cyan }}
              >
                <ICON_MAP.Server className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-sm">
                {svc.serviceName}
              </span>
            </div>
            {isSelected && (
              <ICON_MAP.CheckCircle className="absolute top-2 left-2 w-5 h-5 text-cyan-400 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
