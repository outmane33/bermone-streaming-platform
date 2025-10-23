// MobileMenu.jsx (optimized)
import { memo, useState } from "react";
import { X } from "lucide-react";
import { SortButton } from "./SortButton";
import { FilterButton } from "./FilterButton";
import { DropdownMenu } from "./DropdownMenu";

export const MobileMenu = memo(
  ({
    isOpen,
    onClose,
    filterOptions,
    selectedFilters,
    toggleFilter,
    sortOptions = [],
    selectedSort,
    handleSortClick,
    categoryCount,
    isEpisode,
  }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-white font-bold text-lg">الفلاتر والترتيب</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {sortOptions.length > 0 && (
              <>
                <div>
                  <h4 className="text-white font-semibold mb-3 text-sm">
                    الترتيب
                  </h4>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <SortButton
                        key={option.id}
                        option={option}
                        isSelected={selectedSort === option.id}
                        onClick={() => handleSortClick(option.id)}
                        isMobile
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </>
            )}

            {!isEpisode && (
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm">
                  الفلاتر
                </h4>
                <div className="space-y-2">
                  {Object.keys(filterOptions).map((category) => (
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
            )}
          </div>
        </div>
      </div>
    );
  }
);
