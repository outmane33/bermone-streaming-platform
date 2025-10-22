import { getIcon } from "@/lib/data";
import { GradientBackground } from "./GradientBackground";

const cn = (...classes) => classes.filter(Boolean).join(" ");
// Sort Button Component - Component للـ sort buttons
export const SortButton = ({
  option,
  isSelected,
  onClick,
  isMobile = false,
}) => {
  const Icon = getIcon(option.icon);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 rounded-lg transition-all duration-300 cursor-pointer transform",
        isMobile
          ? "w-full justify-start px-4 py-3"
          : "px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3",
        isSelected
          ? "scale-105"
          : "hover:scale-105 hover:-translate-y-0.5 opacity-70 hover:opacity-100"
      )}
    >
      <GradientBackground
        gradient={option.gradient}
        isActive={isSelected}
        isHover={false}
      />

      <div className="relative flex items-center gap-2 z-10">
        {Icon && <Icon size={isMobile ? 20 : 16} className="text-gray-200" />}
        <span
          className={cn(
            "font-semibold transition-colors duration-300",
            isMobile ? "text-base" : "text-xs sm:text-sm",
            isSelected ? "text-white" : "text-gray-200 group-hover:text-white"
          )}
        >
          {option.label}
        </span>
      </div>
    </button>
  );
};
