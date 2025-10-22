import React from "react";
import { X } from "lucide-react";
import { filterIcons, getIcon } from "@/lib/data";

export const FilterTag = ({ icon, label, onRemove }) => {
  const Icon = filterIcons[icon] || getIcon(icon);

  return (
    <span className="group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border-2 border-cyan-400/40 hover:border-cyan-400/60 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
      {Icon && <Icon size={14} className="text-current sm:w-4 sm:h-4" />}
      <span className="truncate max-w-[100px] sm:max-w-none">{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-white/20 rounded-full p-1 transition-all duration-200 hover:rotate-90 cursor-pointer flex-shrink-0"
      >
        <X size={12} className="sm:w-3.5 sm:h-3.5" />
      </button>
    </span>
  );
};
