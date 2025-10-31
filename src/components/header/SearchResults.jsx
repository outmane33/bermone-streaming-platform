// components/header/SearchResults.jsx
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Card from "../shared/card/Card";
import { SkeletonCard } from "../shared/skeletons/Skeletons";

// ... (LoadingState & EmptyState same as before)

export const SearchResults = ({
  searchResults,
  onResultClick,
  onClose,
  isLoading,
  isTouchDevice,
}) => {
  if (isLoading) {
    return (
      <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
        <div
          className={`relative rounded-xl shadow-2xl ${
            isTouchDevice ? "bg-black/70" : DESIGN_TOKENS.glass.medium
          }`}
        >
          <LoadingState />
        </div>
      </div>
    );
  }

  if (!searchResults?.length) {
    return (
      <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
        <div
          className={`relative rounded-xl shadow-2xl ${
            isTouchDevice ? "bg-black/70" : DESIGN_TOKENS.glass.medium
          }`}
        >
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
      <div
        className={`relative rounded-xl shadow-2xl overflow-auto max-h-[70vh] ${
          isTouchDevice ? "bg-black/70" : DESIGN_TOKENS.glass.medium
        }`}
      >
        <div
          className={`sticky top-0 px-4 py-2 z-10 ${
            isTouchDevice ? "bg-black/80" : "bg-gray-900/90 backdrop-blur-md"
          } border-b border-white/10`}
        >
          <p className="text-sm text-gray-200 text-right">
            تم العثور على {searchResults.length} نتيجة
          </p>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {searchResults.slice(0, isTouchDevice ? 6 : 12).map((item) => (
              <Card
                key={item.id}
                media={item}
                isTouchDevice={isTouchDevice}
                className="!h-auto"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
