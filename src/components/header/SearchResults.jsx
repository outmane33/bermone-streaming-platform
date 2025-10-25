import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Card from "../shared/card/Card";
import { Suspense } from "react";
import { SkeletonCard } from "../shared/skeletons/Skeletons";

const LoadingState = () => (
  <div className="px-4 py-12 text-center">
    <ICON_MAP.Loader2
      className="animate-spin text-cyan-400 mx-auto mb-3"
      size={32}
    />
    <div className="text-gray-200 text-base">جاري البحث...</div>
  </div>
);

const EmptyState = () => (
  <div className="px-4 py-12 text-center">
    <div className="text-gray-200 text-base mb-2 font-semibold">
      لا توجد نتائج
    </div>
    <div className="text-gray-300 text-sm">جرب البحث بكلمات مختلفة</div>
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
        <div
          className={`relative ${DESIGN_TOKENS.glass.medium} rounded-xl shadow-2xl bg-gray-800/80`}
        >
          <LoadingState />
        </div>
      </div>
    );
  }

  // Show empty state
  if (!searchResults?.length) {
    return (
      <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
        <div
          className={`relative ${DESIGN_TOKENS.glass.medium} rounded-xl shadow-2xl bg-gray-800/80`}
        >
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
      <div
        className={`relative ${DESIGN_TOKENS.glass.medium} rounded-xl shadow-2xl overflow-auto bg-gray-800/80 max-h-[70vh] scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent`}
      >
        {/* Results Count */}
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md px-4 py-2 border-b border-white/10 z-10">
          <p className="text-sm text-gray-200 text-right">
            تم العثور على {searchResults.length} نتيجة
          </p>
        </div>

        {/* Results Grid */}
        <div className="p-3">
          <div className={`${DESIGN_TOKENS.grid.container} !px-0`}>
            {searchResults.map((item) => (
              <Suspense fallback={<SkeletonCard />} key={item.id}>
                <Card
                  key={item.id}
                  media={item}
                  onClick={() => {
                    onResultClick(item);
                    onClose?.();
                  }}
                />
              </Suspense>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
