import { Search, Loader2 } from "lucide-react";

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchFocused,
  setSearchFocused,
  isSearching,
}) => (
  <div
    className={`relative transition-all duration-300 w-full sm:w-auto ${
      searchFocused ? "sm:w-96" : "sm:w-72"
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
        className="w-full px-10 sm:px-14 py-2.5 sm:py-3 pr-10 sm:pr-12 text-white placeholder-gray-200 outline-none text-sm sm:text-base font-medium transition-all duration-300 rounded-xl bg-white/10 shadow-lg backdrop-blur-md border border-white/20"
        autoComplete="off"
      />

      {/* Loading or Search Icon */}
      <div className="absolute left-3 sm:left-4 text-gray-400">
        {isSearching ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Search size={20} />
        )}
      </div>
    </div>
  </div>
);
