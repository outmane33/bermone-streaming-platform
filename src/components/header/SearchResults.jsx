import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Card from "../shared/card/Card";

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

export const SearchResults = ({ searchResults, onResultClick, isLoading }) => {
  if (isLoading) {
    return (
      <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
        <div
          className={`relative rounded-xl shadow-2xl ${DESIGN_TOKENS.glass.medium}`}
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
          className={`relative rounded-xl shadow-2xl ${DESIGN_TOKENS.glass.medium}`}
        >
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-4 right-4 z-50 rounded-xl mt-2">
      <div
        className={`relative rounded-xl shadow-2xl overflow-auto max-h-[70vh] ${DESIGN_TOKENS.glass.medium}`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="sticky top-0 px-4 py-2 z-10 bg-gray-900/90 backdrop-blur-md border-b border-white/10">
          <p className="text-sm text-gray-200 text-right">
            تم العثور على {searchResults.length} نتيجة
          </p>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {searchResults.slice(0, 40).map((item) => (
              <Card
                key={item.id || item.slug}
                media={item}
                className="!h-auto"
                onNavigateComplete={onResultClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
