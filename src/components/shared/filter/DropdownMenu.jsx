import { filterGradients } from "@/lib/data";
import clsx from "clsx";

// Reusable Option Button
const OptionButton = ({ option, isSelected, onToggle, category }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle(category, option);
    }}
    aria-pressed={isSelected}
    className={clsx(
      "relative group w-full text-right px-3 py-2.5 rounded-lg transition-all duration-200 font-medium cursor-pointer",
      isSelected
        ? "bg-white/30 text-white shadow-lg"
        : "text-gray-100 hover:text-white hover:bg-white/20"
    )}
  >
    <div className="relative flex items-center justify-between">
      <div
        className={clsx(
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
);

// Mobile Dropdown
const MobileDropdown = ({
  category,
  options,
  selectedValues,
  onToggle,
  gradient,
}) => {
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="mt-2 mb-3" role="menu" onClick={handleContainerClick}>
      <div className={`h-0.5 bg-gradient-to-r ${gradient} mb-3`} />
      <div className="max-h-80 overflow-y-auto px-2">
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
    </div>
  );
};

// Desktop Dropdown
const DesktopDropdown = ({
  category,
  options,
  selectedValues,
  onToggle,
  gradient,
}) => (
  <div className="absolute top-full mt-2 right-0 w-80 z-20" role="menu">
    {/* Backdrop Blur Effect */}
    <div className="absolute -inset-1 bg-white/20 shadow-lg backdrop-blur-md rounded-xl blur-md opacity-50" />

    {/* Main Content */}
    <div className="relative bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      <div className="p-3 max-h-96 overflow-y-auto">
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
    </div>
  </div>
);

// Main Component
export const DropdownMenu = ({
  category,
  options,
  selectedValues,
  onToggle,
  isMobile,
}) => {
  const gradient = filterGradients[category];

  const sharedProps = {
    category,
    options,
    selectedValues,
    onToggle,
    gradient,
  };

  return isMobile ? (
    <MobileDropdown {...sharedProps} />
  ) : (
    <DesktopDropdown {...sharedProps} />
  );
};
