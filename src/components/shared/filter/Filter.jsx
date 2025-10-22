"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import { FilterTag } from "./FilterTag";
import { FilterButton } from "./FilterButton";
import { DropdownMenu } from "./DropdownMenu";
import { SortButton } from "./SortButton";
import { MobileMenu } from "./MobileMenu";
import { filterOptions } from "@/lib/data";

const useClickOutside = (openDropdown, dropdownRefs, callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        if (!dropdownRefs.current[openDropdown].contains(e.target)) {
          callback();
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown, dropdownRefs, callback]);
};

export default function Filter({
  onFilterChange,
  sortOptions,
  isEpisode,
  currentFilters,
  isAnimeEpisode = false,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genre: currentFilters?.genre || [],
    year: currentFilters?.year || [],
    language: currentFilters?.language || [],
    country: currentFilters?.country || [],
  });
  const [selectedSort, setSelectedSort] = useState(
    currentFilters?.sort || null
  );
  const dropdownRefs = useRef({});
  const isFirstRender = useRef(true);

  useClickOutside(openDropdown, dropdownRefs, () => setOpenDropdown(null));

  // ✅ Only notify parent when filters/sort actually change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (onFilterChange) {
      onFilterChange({ ...selectedFilters, sort: selectedSort });
    }
  }, [selectedFilters, selectedSort]);

  const toggleDropdown = (category) => {
    setOpenDropdown(openDropdown === category ? null : category);
  };

  const toggleMobileDropdown = (category) => {
    setMobileOpenDropdown(mobileOpenDropdown === category ? null : category);
  };

  const toggleFilter = (category, value) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      const categoryValues = updated[category];
      updated[category] = categoryValues.includes(value)
        ? categoryValues.filter((item) => item !== value)
        : [...categoryValues, value];
      return updated;
    });
  };

  const handleSortClick = (sortId) => {
    const newSort = selectedSort === sortId ? null : sortId;
    setSelectedSort(newSort);
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      genre: [],
      year: [],
      language: [],
      country: [],
    });
    setSelectedSort(null);
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;
  const categoryCount = (category) => selectedFilters[category].length;

  return (
    <div className="mb-4 relative">
      {openDropdown && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/50 backdrop-blur-sm z-[20] transition-opacity duration-300"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden w-full flex items-center justify-between gap-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-xl px-4 py-3 mb-3 hover:bg-white/15 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-gray-200" />
          <span className="text-white font-semibold">الفلاتر والترتيب</span>
        </div>
        {(activeFilterCount > 0 || selectedSort) && (
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-black rounded-full">
            {activeFilterCount + (selectedSort ? 1 : 0)}
          </span>
        )}
      </button>

      {!isAnimeEpisode && (
        <div className="hidden lg:flex items-center justify-between gap-1 xl:gap-2 flex-wrap bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl px-3 sm:px-4 py-2 relative z-[20]">
          {isEpisode ? (
            <div></div>
          ) : (
            <div className="flex items-center gap-1 xl:gap-2 flex-wrap">
              {Object.keys(filterOptions).map((category) => (
                <div
                  key={category}
                  ref={(el) => (dropdownRefs.current[category] = el)}
                  className="relative"
                >
                  <FilterButton
                    category={category}
                    isActive={categoryCount(category) > 0}
                    isOpen={openDropdown === category}
                    count={categoryCount(category)}
                    onClick={() => toggleDropdown(category)}
                  />

                  {openDropdown === category && (
                    <DropdownMenu
                      category={category}
                      options={filterOptions[category]}
                      selectedValues={selectedFilters[category]}
                      onToggle={toggleFilter}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 border-r-2 border-white/20">
            {sortOptions &&
              sortOptions.map((option) => (
                <SortButton
                  key={option.id}
                  option={option}
                  isSelected={selectedSort === option.id}
                  onClick={() => handleSortClick(option.id)}
                />
              ))}
          </div>
        </div>
      )}

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => {
          setMobileMenuOpen(false);
          setMobileOpenDropdown(null);
        }}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        handleSortClick={handleSortClick}
        openDropdown={mobileOpenDropdown}
        toggleDropdown={toggleMobileDropdown}
        getCategoryCount={categoryCount}
        isEpisode={isEpisode}
      />

      {(activeFilterCount > 0 || selectedSort) && (
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-white font-bold text-sm sm:text-base">
              الفلاتر المحددة:
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-transparent" />
            <button
              onClick={clearAllFilters}
              className="px-2 sm:px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer"
            >
              مسح الكل
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortOptions && selectedSort && (
              <FilterTag
                icon={sortOptions.find((s) => s.id === selectedSort)?.icon}
                label={sortOptions.find((s) => s.id === selectedSort)?.label}
                onRemove={() => handleSortClick(selectedSort)}
              />
            )}

            {Object.entries(selectedFilters).flatMap(([category, values]) =>
              values.map((value) => (
                <FilterTag
                  key={`${category}-${value}`}
                  icon={category}
                  label={value}
                  onRemove={() => toggleFilter(category, value)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
}
