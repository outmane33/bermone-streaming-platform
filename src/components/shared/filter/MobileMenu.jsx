import { memo, useState, useEffect, useRef } from "react";
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
    const scrollRef = useRef({ y: 0 });

    useEffect(() => {
      if (isOpen) {
        // Save current scroll position
        scrollRef.current.y = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollRef.current.y}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
      }

      return () => {
        const { y } = scrollRef.current;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, y);
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center lg:hidden overflow-hidden">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        <div
          className={`${DESIGN_TOKENS.glass.medium} rounded-3xl w-[90vw] max-w-[95vw] max-h-[90vh] flex flex-col `}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-white font-bold text-lg">الفلاتر</h3>
            <button
              onClick={onClose}
              className={`p-2 ${DESIGN_TOKENS.glass.hover} rounded-full transition-colors`}
              aria-label="إغلاق"
            >
              <ICON_MAP.X size={24} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 overflow-hidden">
            {!isEpisode &&
              Object.keys(filterOptions).map((category) => (
                <div key={category} className="px-2">
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
