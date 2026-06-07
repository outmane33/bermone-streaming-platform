import React from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Link from "next/link";

export const MediaTag = ({
  title,
  subtitle,
  isActive = false,
  isLastEpisode = false,
  onClick,
  href,
  className = "",
  episodeType = null,
}) => {
  const Wrapper = href ? Link : "button";
  const wrapperProps = href ? { href } : { onClick };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 shadow-cyan-500/50"
          : `${DESIGN_TOKENS.glass.light} text-white hover:shadow-xl ${DESIGN_TOKENS.effects.hoverScale}`
      } cursor-pointer w-full ${className}`}
    >
      {isActive && (
        <ICON_MAP.Play className="w-3 h-3 sm:w-4 sm:h-4 fill-cyan-400 text-cyan-400 animate-pulse flex-shrink-0" />
      )}

      <div className="flex-1 flex items-center justify-end gap-2 truncate">
        {isLastEpisode && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
            الأخيرة
          </span>
        )}
        {episodeType === "فلر" && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
            فلر
          </span>
        )}
        {episodeType === "حلقة خاصة" && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 whitespace-nowrap">
            خاصة
          </span>
        )}
        <span className="truncate">{title}</span>
      </div>

      {subtitle && (
        <span
          className={`text-xs opacity-80 flex-shrink-0 ${
            isActive ? "text-cyan-200" : "text-cyan-300"
          }`}
        >
          {subtitle}
        </span>
      )}
    </Wrapper>
  );
};
