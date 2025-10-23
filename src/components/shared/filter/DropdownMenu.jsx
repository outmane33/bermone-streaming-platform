// DropdownMenu.jsx (optimized)
import { memo } from "react";
import { filterGradients } from "@/lib/data";
import { cn } from "@/lib/helpers";

const OptionButton = memo(({ option, isSelected, onToggle, category }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle(category, option);
    }}
    aria-pressed={isSelected}
    className={cn(
      "relative group w-full text-right px-3 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer",
      isSelected
        ? "bg-white/30 text-white shadow-lg"
        : "text-gray-100 hover:text-white hover:bg-white/20"
    )}
  >
    <div className="relative flex items-center justify-between">
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-all duration-200",
          isSelected
            ? "bg-white opacity-100"
            : "bg-white opacity-0 group-hover:opacity-100"
        )}
        aria-hidden="true"
      />
      <span>{option}</span>
    </div>
  </button>
));

const DropdownContent = ({
  category,
  options,
  selectedValues,
  onToggle,
  gradient,
  isMobile,
}) => (
  <>
    <div
      className={`${
        isMobile ? "h-0.5 mb-3" : "h-1"
      } bg-gradient-to-r ${gradient}`}
    />
    <div
      className={cn(
        "overflow-y-auto",
        isMobile ? "max-h-80 px-2" : "p-3 max-h-96"
      )}
    >
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <OptionButton
            key={option}
            option={option}
            isSelected={selectedValues.includes(option)}
            onToggle={onToggle}
            category={category}
          />
        ))}
      </div>
    </div>
  </>
);

export const DropdownMenu = memo(
  ({ category, options, selectedValues, onToggle, isMobile }) => {
    const gradient = filterGradients[category];

    if (isMobile) {
      return (
        <div
          className="mt-2 mb-3"
          role="menu"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownContent
            category={category}
            options={options}
            selectedValues={selectedValues}
            onToggle={onToggle}
            gradient={gradient}
            isMobile
          />
        </div>
      );
    }

    return (
      <div className="absolute top-full mt-2 right-0 w-80 z-20" role="menu">
        <div className="absolute -inset-1 bg-white/20 shadow-lg backdrop-blur-md rounded-xl blur-md opacity-50" />
        <div className="relative bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden">
          <DropdownContent
            category={category}
            options={options}
            selectedValues={selectedValues}
            onToggle={onToggle}
            gradient={gradient}
          />
        </div>
      </div>
    );
  }
);
