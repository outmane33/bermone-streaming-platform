// src/components/header/Header.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { DESIGN_TOKENS, CATEGORIES, ICON_MAP } from "@/lib/data";
import { searchContent } from "@/actions/search";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { CategoryItem } from "./CategoryItem";
import { MobileSubmenuModal } from "./MobileSubmenuModal";
import useIsTouchDevice from "@/hooks/useIsTouchDevice";

// Helper function to get active category from pathname
const getActiveCategoryFromPath = (pathname) => {
  if (!pathname || pathname === "/") {
    return "home";
  }

  if (pathname === "/category/trending" || pathname === "/category/recent") {
    return null;
  }

  for (const category of CATEGORIES) {
    if (category.href && category.href === pathname) {
      return category.id;
    }

    if (category.subMenu && category.subMenu.length > 0) {
      for (const subItem of category.subMenu) {
        const [subItemPath] = subItem.path.split("?");
        const [currentPath] = pathname.split("?");

        if (subItem.path === pathname || subItemPath === currentPath) {
          return category.id;
        }
      }
    }
  }

  return "home";
};

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Simple throttle utility
function throttle(func, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isDesktop, setIsDesktop] = useState(true);
  const isTouchDevice = useIsTouchDevice();

  const [activeCategory, setActiveCategory] = useState(() =>
    getActiveCategoryFromPath(pathname)
  );
  const [searchFocused, setSearchFocused] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const debounceDelay = isTouchDevice ? 500 : 300;
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  const checkScreenSize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 768);
  }, []);

  const throttledCheckScreenSize = useCallback(
    throttle(checkScreenSize, 150),
    []
  );

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", throttledCheckScreenSize);
    return () => window.removeEventListener("resize", throttledCheckScreenSize);
  }, [checkScreenSize, throttledCheckScreenSize]);

  useEffect(() => {
    setActiveCategory(getActiveCategoryFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchContent(debouncedSearchQuery);
        setSearchResults(response.success ? response.results || [] : []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  const handleCategoryClick = (categoryId) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (category?.subMenu) {
      if (!isDesktop) {
        setSelectedCategory(category);
        setMobileSubmenuOpen(true);
      } else {
        setOpenMenuId(openMenuId === categoryId ? null : categoryId);
      }
    } else {
      setActiveCategory(categoryId);
      setOpenMenuId(null);
    }
  };

  const handleSubMenuClick = (parentCategoryId) => {
    setActiveCategory(parentCategoryId);
    setOpenMenuId(null);
    setMobileMenuOpen(false);
  };

  const handleSearchResultClick = () => {
    setSearchQuery("");
    setSearchFocused(false);
    setSearchResults([]);
    setMobileSearchOpen(false);
  };

  // ✅ FIXED: Now closes mobile search too
  const closeAllOverlays = () => {
    setOpenMenuId(null);
    setSearchFocused(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false); // 👈 critical fix
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleMobileSearch = () => {
    const newState = !mobileSearchOpen;
    setMobileSearchOpen(newState);
    if (newState) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // ✅ FIXED: Include mobileSearchOpen in overlay condition
  const showOverlay =
    openMenuId ||
    mobileMenuOpen ||
    mobileSearchOpen ||
    (searchFocused && searchQuery);

  return (
    <div className="relative w-full">
      {/* Overlay now appears when mobile search is open */}
      {showOverlay && (
        <div
          className={`fixed inset-0 z-30 transition-opacity duration-300 ${
            isTouchDevice ? "bg-black/60" : "bg-black/70 backdrop-blur-sm"
          }`}
          onClick={closeAllOverlays}
          aria-hidden="true"
        />
      )}

      <div className="relative z-40 w-full py-2 lg:py-4">
        <div
          className={clsx(
            "flex flex-col md:flex-row items-stretch sm:items-center justify-between",
            "gap-2 sm:gap-4 mb-2 sm:mb-4",
            DESIGN_TOKENS.glass.light,
            "px-4 lg:px-6 py-2 sm:py-2.5",
            "rounded-lg relative z-10"
          )}
        >
          {mobileSearchOpen ? (
            <div className="flex sm:hidden items-center gap-2 w-full">
              <div className="flex-1">
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchFocused={searchFocused}
                  setSearchFocused={setSearchFocused}
                  isSearching={isSearching}
                  isTouchDevice={isTouchDevice}
                />
              </div>
              <button
                onClick={toggleMobileSearch}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                aria-label="إغلاق البحث"
              >
                <ICON_MAP.X size={20} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Logo />
                <div className="flex sm:hidden items-center gap-2">
                  <button
                    onClick={toggleMobileSearch}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="فتح البحث"
                  >
                    <ICON_MAP.Search size={20} />
                  </button>
                </div>
              </div>

              <div className="hidden sm:block w-full sm:flex-1 sm:max-w-xl">
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchFocused={searchFocused}
                  setSearchFocused={setSearchFocused}
                  isSearching={isSearching}
                  isTouchDevice={isTouchDevice}
                />
              </div>

              <nav aria-label="القائمة الرئيسية">
                <div className="grid grid-cols-3 justify-items-center lg:flex lg:items-center lg:justify-between gap-2 lg:gap-1 xl:gap-2 flex-wrap">
                  {CATEGORIES.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      isActive={activeCategory === category.id}
                      isMenuOpen={openMenuId === category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      handleSubMenuClick={() => handleSubMenuClick(category.id)}
                      isHome={!isHome}
                      isDesktop={isDesktop}
                    />
                  ))}
                </div>
              </nav>
            </>
          )}

          {(searchFocused || mobileSearchOpen) && searchQuery && (
            <SearchResults
              searchResults={searchResults}
              onResultClick={handleSearchResultClick}
              onClose={() => {
                setSearchFocused(false);
                setMobileSearchOpen(false);
              }}
              isLoading={isSearching}
            />
          )}
        </div>
      </div>

      <MobileSubmenuModal
        isOpen={mobileSubmenuOpen}
        onClose={() => setMobileSubmenuOpen(false)}
        category={selectedCategory}
        items={selectedCategory?.subMenu || []}
      />
    </div>
  );
}
