import { GradientBackground } from "./GradientBackground";
import { cn } from "@/lib/helpers";
import { DESIGN_TOKENS, getTextClasses, ICON_MAP } from "@/lib/data";

export const BaseButton = ({
  icon: Icon,
  label,
  gradient,
  isActive,
  isOpen = false,
  count,
  onClick,
  isMobile = false,
  showChevron = false,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex items-center gap-2 rounded-lg cursor-pointer transform",
      DESIGN_TOKENS.effects.transition,
      isMobile
        ? "w-full justify-between px-4 py-3 min-h-[48px]"
        : "px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 min-h-[40px]",
      isActive
        ? "scale-105 sm:scale-110"
        : `${DESIGN_TOKENS.effects.hoverScale} ${DESIGN_TOKENS.effects.hoverLift} opacity-70 hover:opacity-100`
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
      <Icon size={isMobile ? 20 : 18} className="text-gray-200 flex-shrink-0" />
      <span
        className={cn(
          "font-semibold text-sm sm:text-base truncate",
          getTextClasses(isActive)
        )}
      >
        {label}
      </span>
      {count > 0 && (
        <span className="px-2 py-0.5 bg-white text-gray-800 text-xs font-black rounded-full flex-shrink-0">
          {count}
        </span>
      )}
    </div>

    {showChevron && (
      <ICON_MAP.ChevronDown
        size={16}
        className={cn(
          "relative z-10 shrink-0",
          DESIGN_TOKENS.effects.transition,
          isActive ? "text-white" : "text-gray-200 group-hover:text-white",
          isOpen && "rotate-180"
        )}
      />
    )}
  </button>
);
