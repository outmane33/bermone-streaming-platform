// Filter.jsx - Main component (optimized)
"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Menu } from "lucide-react";
import { FilterTag } from "./FilterTag";
import { FilterButton } from "./FilterButton";
import { DropdownMenu } from "./DropdownMenu";
import { SortButton } from "./SortButton";
import { MobileMenu } from "./MobileMenu";
import { filterOptions } from "@/lib/data";
import { useClickOutside } from "@/lib/helpers";

const INITIAL_FILTERS = {
  genre: [],
  year: [],
  language: [],
  country: [],
};

export default function Filter({
  onFilterChange,
  sortOptions,
  isEpisode,
  currentFilters,
  isAnimeEpisode = false,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(() => ({
    genre: currentFilters?.genre || [],
    year: currentFilters?.year || [],
    language: currentFilters?.language || [],
    country: currentFilters?.country || [],
  }));
  const [selectedSort, setSelectedSort] = useState(
    currentFilters?.sort || null
  );

  const dropdownRefs = useRef({});
  const isFirstRender = useRef(true);

  useClickOutside(
    openDropdown,
    { current: dropdownRefs.current[openDropdown] },
    useCallback(() => setOpenDropdown(null), [])
  );

  // Notify parent only when filters/sort change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFilterChange?.({ ...selectedFilters, sort: selectedSort });
  }, [selectedFilters, selectedSort, onFilterChange]);

  // Memoized callbacks
  const toggleDropdown = useCallback((category) => {
    setOpenDropdown((prev) => (prev === category ? null : category));
  }, []);

  const toggleFilter = useCallback((category, value) => {
    setSelectedFilters((prev) => {
      const categoryValues = prev[category];
      return {
        ...prev,
        [category]: categoryValues.includes(value)
          ? categoryValues.filter((item) => item !== value)
          : [...categoryValues, value],
      };
    });
  }, []);

  const handleSortClick = useCallback((sortId) => {
    setSelectedSort((prev) => (prev === sortId ? null : sortId));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters(INITIAL_FILTERS);
    setSelectedSort(null);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Memoized computed values
  const activeFilterCount = useMemo(
    () => Object.values(selectedFilters).flat().length,
    [selectedFilters]
  );

  const categoryCount = useCallback(
    (category) => selectedFilters[category].length,
    [selectedFilters]
  );

  const selectedSortOption = useMemo(
    () => sortOptions?.find((s) => s.id === selectedSort),
    [sortOptions, selectedSort]
  );

  const hasActiveFilters = activeFilterCount > 0 || selectedSort;
  const totalActiveCount = activeFilterCount + (selectedSort ? 1 : 0);

  return (
    <div className="mb-4 relative">
      {openDropdown && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/50 backdrop-blur-sm z-[20] transition-opacity duration-300"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden w-full flex items-center justify-between gap-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-xl px-4 py-3 mb-3 hover:bg-white/15 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <Menu size={20} className="text-gray-200" />
          <span className="text-white font-semibold">الفلاتر والترتيب</span>
        </div>
        {hasActiveFilters && (
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-black rounded-full">
            {totalActiveCount}
          </span>
        )}
      </button>

      {/* Desktop Filter Bar */}
      {!isAnimeEpisode && (
        <div className="hidden lg:flex items-center justify-between gap-1 xl:gap-2 flex-wrap bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl px-3 sm:px-4 py-2 relative z-[20]">
          {!isEpisode && (
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

          {sortOptions?.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 pr-2 sm:pr-4 border-r-2 border-white/20">
              {sortOptions.map((option) => (
                <SortButton
                  key={option.id}
                  option={option}
                  isSelected={selectedSort === option.id}
                  onClick={() => handleSortClick(option.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        handleSortClick={handleSortClick}
        categoryCount={categoryCount}
        isEpisode={isEpisode}
      />

      {/* Active Filters Display */}
      {hasActiveFilters && (
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
            {selectedSortOption && (
              <FilterTag
                icon={selectedSortOption.icon}
                label={selectedSortOption.label}
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
    </div>
  );
}
