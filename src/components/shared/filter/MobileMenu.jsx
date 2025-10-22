import { X } from "lucide-react";
import { SortButton } from "./SortButton";
import { FilterButton } from "./FilterButton";
import { DropdownMenu } from "./DropdownMenu";

export const MobileMenu = ({
  isOpen,
  onClose,
  filterOptions,
  selectedFilters,
  toggleFilter,
  sortOptions = [],
  selectedSort,
  handleSortClick,
  openDropdown,
  toggleDropdown,
  getCategoryCount,
  isEpisode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة الفلاتر والترتيب"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h3 className="text-white font-bold text-lg">الفلاتر والترتيب</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-white/5 p-4 space-y-4">
          {/* Sort Section */}
          {sortOptions.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">الترتيب</h4>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <SortButton
                    key={option.id}
                    option={option}
                    isSelected={selectedSort === option.id}
                    onClick={() => handleSortClick(option.id)}
                    isMobile={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {sortOptions.length > 0 && (
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}

          {/* Filter Section */}
          {isEpisode ? (
            <div></div>
          ) : (
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">الفلاتر</h4>
              <div className="space-y-2">
                {Object.keys(filterOptions).map((category) => (
                  <div key={category}>
                    <FilterButton
                      category={category}
                      isActive={getCategoryCount(category) > 0}
                      isOpen={openDropdown === category}
                      count={getCategoryCount(category)}
                      onClick={() => toggleDropdown(category)}
                      isMobile={true}
                    />
                    {openDropdown === category && (
                      <DropdownMenu
                        category={category}
                        options={filterOptions[category]}
                        selectedValues={selectedFilters[category]}
                        onToggle={toggleFilter}
                        isMobile={true}
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
};
