"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { DESIGN_TOKENS, CATEGORIES } from "@/lib/data";
import { searchContent } from "@/actions/search";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { ActionButtons } from "./ActionButtons";
import { CategoryItem } from "./CategoryItem";

// FIXED: Helper function to get active category from pathname
const getActiveCategoryFromPath = (pathname) => {
  if (!pathname || pathname === "/") {
    return "home";
  }

  // Special pages that don't belong to any category
  if (pathname === "/category/trending" || pathname === "/category/recent") {
    return null;
  }

  // Check each category for matches
  for (const category of CATEGORIES) {
    // Check if category has direct href match
    if (category.href && category.href === pathname) {
      return category.id;
    }

    // Check subMenu items
    if (category.subMenu && category.subMenu.length > 0) {
      for (const subItem of category.subMenu) {
        // Extract path without query params for comparison
        const [subItemPath] = subItem.path.split("?");
        const [currentPath] = pathname.split("?");

        // Exact match with full path (including query params)
        if (subItem.path === pathname) {
          return category.id;
        }

        // Match base path (without query params)
        if (subItemPath === currentPath) {
          return category.id;
        }
      }
    }
  }

  // Default to home if no match found
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
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [activeCategory, setActiveCategory] = useState(() =>
    getActiveCategoryFromPath(pathname)
  );
  const [searchFocused, setSearchFocused] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update active category when pathname changes
  useEffect(() => {
    setActiveCategory(getActiveCategoryFromPath(pathname));
  }, [pathname]);

  // Fetch search results when debounced query changes
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

        if (response.success) {
          setSearchResults(response.results || []);
        } else {
          console.error("Search error:", response.error);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  // Handlers
  const handleCategoryClick = (categoryId) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);

    if (category?.subMenu) {
      setOpenMenuId(openMenuId === categoryId ? null : categoryId);
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
  };

  const closeAllOverlays = () => {
    setOpenMenuId(null);
    setSearchFocused(false);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  // Check if overlay should be shown
  const showOverlay =
    openMenuId || (searchFocused && searchQuery) || mobileMenuOpen;

  return (
    <div className="relative w-full">
      {/* Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={closeAllOverlays}
          aria-hidden="true"
        />
      )}

      <div className="relative z-40 w-full py-2 lg:py-4">
        {/* Top Bar */}
        <div
          className={clsx(
            "flex flex-col sm:flex-row items-stretch sm:items-center justify-between",
            "gap-2 sm:gap-4 mb-2 sm:mb-4",
            DESIGN_TOKENS.glass.light,
            "px-4 lg:px-6 py-2 sm:py-2.5",
            "rounded-lg relative z-10"
          )}
        >
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <Logo />
            <button
              onClick={toggleMobileMenu}
              className="sm:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:flex-1 sm:max-w-xl">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchFocused={searchFocused}
              setSearchFocused={setSearchFocused}
              isSearching={isSearching}
            />
          </div>

          {/* Search Results */}
          {searchFocused && searchQuery && (
            <SearchResults
              searchResults={searchResults}
              onResultClick={handleSearchResultClick}
              onClose={() => setSearchFocused(false)}
              isLoading={isSearching}
            />
          )}

          {/* Action Buttons - Desktop */}
          <div className="hidden sm:flex flex-shrink-0">
            <ActionButtons />
          </div>
        </div>

        {/* Navigation Bar */}
        <nav
          className={clsx(
            "relative",
            DESIGN_TOKENS.glass.light,
            "px-4 lg:px-6 py-3",
            "rounded-lg z-0 transition-all duration-300",
            mobileMenuOpen ? "block" : "hidden sm:block"
          )}
          aria-label="القائمة الرئيسية"
        >
          {/* Categories Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between gap-2 lg:gap-1 xl:gap-2 flex-wrap">
            {CATEGORIES.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                isMenuOpen={openMenuId === category.id}
                onClick={() => handleCategoryClick(category.id)}
                handleSubMenuClick={() => handleSubMenuClick(category.id)}
                isHome={!isHome}
              />
            ))}
          </div>

          {/* Action Buttons - Mobile */}
          <div className="sm:hidden mt-4">
            <ActionButtons isMobile={true} />
          </div>
        </nav>
      </div>
    </div>
  );
}
