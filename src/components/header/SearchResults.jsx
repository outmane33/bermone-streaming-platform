import Link from "next/link";
import { Loader2 } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";

const SearchResultCard = ({ item }) => {
  // Determine the link based on content type
  const href = item.slug;

  return (
    <Link href={href}>
      <button
        className="relative group rounded-lg transition-all duration-300 hover:scale-105 overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
        aria-label={`عرض ${item.title}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 group-hover:border-cyan-400/50 transition-all duration-300">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Combined Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 group-hover:from-cyan-500/20 transition-all duration-300" />

          {/* Shimmer Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>

          {/* Quality Badge */}
          {item.quality && (
            <div className="absolute top-2 right-2 bg-cyan-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
              {item.quality}
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-sm text-white font-medium line-clamp-2 text-right mb-1 group-hover:text-cyan-300 transition-colors duration-200">
            {item.title}
          </h3>
          <div className="flex items-center justify-end gap-1.5 text-xs">
            <span className="text-gray-300 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {item.year}
            </span>{" "}
            II
            <span className="text-gray-300 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {item.type}
            </span>
            {item.rating && (
              <span className="text-yellow-400 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-0.5">
                ⭐ {item.rating}
              </span>
            )}
          </div>
        </div>
      </button>
    </Link>
  );
};

const LoadingState = () => (
  <div className="px-4 py-12 text-center">
    <Loader2 className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
    <div className="text-gray-400 text-base">جاري البحث...</div>
  </div>
);

const EmptyState = () => (
  <div className="px-4 py-12 text-center">
    <div className="text-gray-400 text-base mb-2">لا توجد نتائج</div>
    <div className="text-gray-500 text-sm">جرب البحث بكلمات مختلفة</div>
  </div>
);

export const SearchResults = ({
  searchResults,
  onResultClick,
  onClose,
  isLoading,
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
        <div className="relative backdrop-blur-md rounded-xl border border-white/20 shadow-2xl bg-gray-800/80">
          <LoadingState />
        </div>
      </div>
    );
  }

  // Show empty state
  if (!searchResults?.length) {
    return (
      <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
        <div className="relative backdrop-blur-md rounded-xl border border-white/20 shadow-2xl bg-gray-800/80">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
      <div className="relative backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-auto bg-gray-800/80 max-h-[70vh] scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
        {/* Results Count */}
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md px-4 py-2 border-b border-white/10 z-10">
          <p className="text-sm text-gray-200 text-right">
            تم العثور على {searchResults.length} نتيجة
          </p>
        </div>

        {/* Results Grid */}
        <div className="p-3">
          <div className={DESIGN_TOKENS.grid.container}>
            {searchResults.map((item) => (
              <SearchResultCard
                key={item.id}
                item={item}
                onClick={() => {
                  onResultClick(item);
                  onClose?.();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
