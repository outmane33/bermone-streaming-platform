import { ChevronDown } from "lucide-react";
import { GradientBackground } from "./GradientBackground";
import { filterGradients, filterIcons, filterLabels } from "@/lib/data";

const cn = (...classes) => classes.filter(Boolean).join(" ");
export const FilterButton = ({
  category,
  isActive,
  isOpen,
  count,
  onClick,
  isMobile = false,
}) => {
  const Icon = filterIcons[category];
  const gradient = filterGradients[category];
  const label = filterLabels[category];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 rounded-lg transition-all duration-300 cursor-pointer transform",
        isMobile
          ? "w-full justify-between px-4 py-3"
          : "px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3",
        isActive
          ? "scale-105 sm:scale-110"
          : "hover:scale-105 hover:-translate-y-0.5 opacity-70 hover:opacity-100"
      )}
    >
      <GradientBackground
        gradient={gradient}
        isActive={isActive}
        isHover={isOpen}
      />

      <div
        className={cn(
          "relative flex items-center gap-2 z-10",
          isMobile && "flex-1"
        )}
      >
        <Icon size={isMobile ? 20 : 18} className="text-gray-200" />
        <span
          className={cn(
            "font-semibold transition-colors duration-300 text-sm sm:text-base",
            isActive ? "text-white" : "text-gray-200 group-hover:text-white"
          )}
        >
          {label}
        </span>
        {count > 0 && (
          <span className="px-2 py-0.5 bg-white text-gray-800 text-xs font-black rounded-full">
            {count}
          </span>
        )}
      </div>
      <ChevronDown
        size={16}
        className={cn(
          "transition-all duration-300 relative z-10",
          isActive ? "text-white" : "text-gray-200 group-hover:text-white",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
};
