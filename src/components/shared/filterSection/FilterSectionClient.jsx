// FilterSectionClient.tsx
"use client";

import { useTransition, useMemo, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Filter from "../filter/Filter";
import Pagination from "../pagination/Pagination";
import { SkeletonFilterBar, SkeletonPagination } from "../skeletons/Skeletons";

export default function FilterSectionClient({
  sortOptions,
  isEpisode = false,
  isAnimeEpisode = false,
  initialDocuments,
  initialPagination,
  children, // Server-rendered cards
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const parseArray = (key) =>
      params.get(key)?.split(",").filter(Boolean) || [];

    return {
      genre: parseArray("genre"),
      year: parseArray("year"),
      language: parseArray("language"),
      country: parseArray("country"),
      sort: params.get("sort") || null,
      page: parseInt(params.get("page") || "1", 10),
    };
  }, [searchParams]);

  const updateURL = useCallback(
    (newParams) => {
      const params = new URLSearchParams();
      const { page, ...filters } = newParams;

      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value) && value.length > 0) {
          const cleanedArray = value.filter(
            (v) => v && String(v).trim() !== ""
          );
          if (cleanedArray.length > 0) {
            params.set(key, cleanedArray.join(","));
          }
        } else if (value && value !== null && String(value).trim() !== "") {
          params.set(key, value.toString());
        }
      }

      if (page > 1) params.set("page", page.toString());

      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      startTransition(() => {
        router.push(newUrl, { scroll: false });
      });
    },
    [pathname, router]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      updateURL({ ...newFilters, page: 1 });
    },
    [updateURL]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      updateURL({ ...currentFilters, page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentFilters, updateURL]
  );

  return (
    <div className="space-y-8">
      <Suspense fallback={<SkeletonFilterBar />}>
        <Filter
          sortOptions={sortOptions}
          onFilterChange={handleFilterChange}
          currentFilters={currentFilters}
          isEpisode={isEpisode}
          isAnimeEpisode={isAnimeEpisode}
        />
      </Suspense>

      {initialDocuments?.length > 0 ? (
        <div
          className={`transition-opacity ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          {children}
        </div>
      ) : (
        <EmptyState onClear={() => router.push(pathname)} />
      )}

      {initialDocuments?.length > 0 && (
        <Suspense fallback={<SkeletonPagination />}>
          <Pagination
            currentPage={initialPagination.currentPage}
            totalPages={initialPagination.totalPages}
            totalItems={initialPagination.totalItems}
            itemsPerPage={initialPagination.itemsPerPage}
            onPageChange={handlePageChange}
            hasNext={initialPagination.hasNext}
            hasPrev={initialPagination.hasPrev}
          />
        </Suspense>
      )}
    </div>
  );
}

const EmptyState = ({ onClear }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="text-6xl">🎬</div>
    <h3 className="text-2xl font-bold text-white">No documents found</h3>
    <p className="text-gray-400">Try adjusting your filters</p>
    <button
      onClick={onClear}
      className="px-6 py-2 bg-cyan-500 rounded hover:bg-cyan-600 transition"
    >
      Clear Filters
    </button>
  </div>
);
