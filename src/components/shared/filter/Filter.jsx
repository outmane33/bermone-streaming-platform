"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { FilterTag } from "./FilterTag";
import { FilterButton } from "./FilterButton";
import { DropdownMenu } from "./DropdownMenu";
import { SortButton } from "./SortButton";
import { MobileMenu } from "./MobileMenu";
import { DESIGN_TOKENS, filterOptions, ICON_MAP } from "@/lib/data";
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
  isCategoryPage = false, // ADD THIS PROP
  contentType = "films", // ADD THIS PROP ('films' or 'series')
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(() => ({
    genre: currentFilters?.genre || [],
    year: currentFilters?.year || [],
    language: currentFilters?.language || [],
    country: currentFilters?.country || [],
  }));
  const MAX_SELECTIONS_PER_CATEGORY = 3;
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

  useEffect(() => {
    if (currentFilters?.sort !== undefined) {
      setSelectedSort(currentFilters.sort);
    }
  }, [currentFilters?.sort]);

  useEffect(() => {
    setSelectedFilters({
      genre: currentFilters?.genre || [],
      year: currentFilters?.year || [],
      language: currentFilters?.language || [],
      country: currentFilters?.country || [],
    });
  }, [
    currentFilters?.genre,
    currentFilters?.year,
    currentFilters?.language,
    currentFilters?.country,
  ]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const filtersChanged =
      JSON.stringify(selectedFilters) !==
      JSON.stringify({
        genre: currentFilters?.genre || [],
        year: currentFilters?.year || [],
        language: currentFilters?.language || [],
        country: currentFilters?.country || [],
      });

    const sortChanged = selectedSort !== currentFilters?.sort;

    if (filtersChanged || sortChanged) {
      onFilterChange?.({ ...selectedFilters, sort: selectedSort });
    }
  }, [selectedFilters, selectedSort]);

  // Memoized callbacks
  const toggleDropdown = useCallback((category) => {
    setOpenDropdown((prev) => (prev === category ? null : category));
  }, []);

  const toggleFilter = useCallback((category, value) => {
    setSelectedFilters((prev) => {
      const categoryValues = prev[category];
      const isSelected = categoryValues.includes(value);

      // If trying to add and already at max limit, don't add
      if (!isSelected && categoryValues.length >= MAX_SELECTIONS_PER_CATEGORY) {
        return prev;
      }

      return {
        ...prev,
        [category]: isSelected
          ? categoryValues.filter((item) => item !== value)
          : [...categoryValues, value],
      };
    });
  }, []);

  const handleSortClick = useCallback(
    (sortId) => {
      // If on category page, redirect instead of filtering
      if (isCategoryPage) {
        const basePath = contentType === "series" ? "/series" : "/films";
        window.location.href = `${basePath}?sort=${sortId}`;
        return;
      }

      // Normal behavior for non-category pages
      setSelectedSort((prev) => (prev === sortId ? prev : sortId));
    },
    [isCategoryPage, contentType]
  );

  const clearAllFilters = useCallback(() => {
    setSelectedFilters(INITIAL_FILTERS);
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

  return (
    <div className="mb-4 relative">
      {openDropdown && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/50 backdrop-blur-sm z-[20] transition-opacity duration-300"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Mobile Combined Section */}
      <div
        className={`lg:hidden ${DESIGN_TOKENS.glass.light} rounded-lg shadow-xl mb-3 p-3 sm:p-6`}
      >
        <div className="flex flex-col gap-3">
          {/* Sort Options - Always Visible */}
          {sortOptions?.length > 0 && (
            <div
              className="grid grid-cols-2 md:grid-cols-4 items-center gap-2"
              dir="rtl"
            >
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
          )}

          {/* Filters Toggle */}
          {!isEpisode && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`flex items-center justify-center gap-2 ${DESIGN_TOKENS.glass.hover} py-2 rounded-lg ${DESIGN_TOKENS.effects.transition}`}
            >
              <ICON_MAP.Menu size={18} className="text-gray-200" />
              <span className="text-white font-semibold text-sm">الفلاتر</span>
              {activeFilterCount > 0 && (
                <span
                  className={`px-2 py-0.5 bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} text-white text-xs font-black rounded-full`}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Desktop Filter Bar */}
      {!isAnimeEpisode && (
        <div
          className={`hidden lg:flex items-center justify-between gap-1 xl:gap-2 flex-wrap ${DESIGN_TOKENS.glass.light} rounded-lg shadow-2xl px-3 sm:px-4 py-2 relative z-[20]`}
        >
          {!isEpisode ? (
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
          ) : (
            <div></div>
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

      {/* Mobile Menu - Filters Only */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        filterOptions={filterOptions}
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
        categoryCount={categoryCount}
        isEpisode={isEpisode}
      />

      {/* Active Filters Display */}
      {hasActiveFilters && !isAnimeEpisode && (
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="text-white font-bold text-sm sm:text-base">
              الفلاتر المحددة:
            </span>
            <div
              className={`flex-1 h-px bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}/50 via-purple-500/50 to-transparent`}
            />
            <button
              onClick={clearAllFilters}
              className={`px-2 sm:px-3 py-1 bg-gradient-to-r ${DESIGN_TOKENS.gradients.rose} hover:bg-gradient-to-r hover:from-rose-700 hover:to-pink-700 text-white rounded-lg text-xs sm:text-sm font-semibold ${DESIGN_TOKENS.effects.transition} cursor-pointer`}
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
