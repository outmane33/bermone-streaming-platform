import React from "react";
import { DESIGN_TOKENS } from "@/lib/data";
import Link from "next/link";

export const EpisodeTag = ({ episode }) => {
  // console.log(episode);
  return (
    <Link
      href={`/${episode.slug}`}
      className={`group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 ${DESIGN_TOKENS.glass.light} rounded-lg text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl ${DESIGN_TOKENS.effects.hoverScale} cursor-pointer`}
    >
      <span className="truncate">{episode.title}</span>
      {episode.duration && (
        <span className="text-cyan-300 text-xs opacity-80 flex-shrink-0">
          {episode.duration}
        </span>
      )}
    </Link>
  );
};
