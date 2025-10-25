import { memo, useState } from "react";
import { FilterButton } from "./FilterButton";
import { DropdownMenu } from "./DropdownMenu";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

export const MobileMenu = memo(
  ({
    isOpen,
    onClose,
    filterOptions,
    selectedFilters,
    toggleFilter,
    categoryCount,
    isEpisode,
  }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 lg:hidden ">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm "
          onClick={onClose}
        />

        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md ${DESIGN_TOKENS.glass.medium} rounded-3xl  max-h-[85vh] overflow-hidden flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20 ">
            <h3 className="text-white font-bold text-lg">الفلاتر</h3>
            <button
              onClick={onClose}
              className={`p-2 ${DESIGN_TOKENS.glass.hover} rounded-full transition-colors `}
            >
              <ICON_MAP.X size={24} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 overflow-hidden">
            {!isEpisode &&
              Object.keys(filterOptions).map((category) => (
                <div key={category}>
                  <FilterButton
                    category={category}
                    isActive={categoryCount(category) > 0}
                    isOpen={openDropdown === category}
                    count={categoryCount(category)}
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === category ? null : category
                      )
                    }
                    isMobile
                  />
                  {openDropdown === category && (
                    <DropdownMenu
                      category={category}
                      options={filterOptions[category]}
                      selectedValues={selectedFilters[category]}
                      onToggle={toggleFilter}
                      isMobile
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
);
