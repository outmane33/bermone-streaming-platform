import React from "react";
import { DESIGN_TOKENS } from "@/lib/data";

export const MediaSwitcher = ({
  title,
  items,
  renderItem,
  maxHeight = "max-h-96",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Section Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-right px-2">
          {title}
        </h2>
        <div className="h-1 bg-gradient-to-l from-cyan-500 via-purple-500 to-transparent rounded-full mt-3"></div>
      </div>

      {/* Items List */}
      <div className="relative">
        <div className={`${maxHeight} overflow-y-auto pr-2 pb-2 pt-2`}>
          <div className={DESIGN_TOKENS.grid.container}>
            {items.map((item, index) => (
              <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
            ))}
          </div>
        </div>

        {/* Fade out effect at bottom if many items */}
        {items.length > 12 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};
