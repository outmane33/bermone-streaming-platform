import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  isSearching,
  isTouchDevice,
}) => (
  <div
    className={`relative w-full sm:min-w-[260px] sm:w-auto ${
      !isTouchDevice && searchFocused ? "sm:w-96" : "sm:w-72"
    }`}
  >
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder="ابحث عن فيلم أو مسلسل..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        className={`w-full px-10 sm:px-14 py-2.5 sm:py-3 pr-10 sm:pr-12 ltr:text-right text-white placeholder-gray-200 outline-none text-sm sm:text-base font-medium rounded-xl ${
          isTouchDevice ? "bg-black/40" : DESIGN_TOKENS.glass.light
        } shadow-lg`}
        autoComplete="off"
      />
      <div className="absolute left-3 sm:left-4 text-gray-400">
        {isSearching ? (
          <ICON_MAP.Loader2 className="animate-spin" size={20} />
        ) : (
          <ICON_MAP.Search size={20} />
        )}
      </div>
    </div>
  </div>
);
