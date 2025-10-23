"use client";

import { useTransition, useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DESIGN_TOKENS } from "@/lib/data";
import Card from "../card/Card";
import Filter from "../filter/Filter";
import Pagination from "../pagination/Pagination";

export default function FilterSection({
  initialData,
  sortOptions,
  isEpisode = false,
  isFilmCollection = false,
  isAnimeEpisode = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Memoize current filters to avoid recalculation
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

  // Optimized URL update with single iteration
  const updateURL = useCallback(
    (newParams) => {
      const params = new URLSearchParams();
      const { page, ...filters } = newParams;

      // Single loop through all parameters
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","));
        } else if (value && value !== null) {
          params.set(key, value.toString());
        }
      }

      if (page > 1) params.set("page", page.toString());

      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.push(newUrl, { scroll: false });
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

  const { documents, pagination } = initialData;

  return (
    <div className="space-y-8">
      <Filter
        sortOptions={sortOptions}
        onFilterChange={handleFilterChange}
        currentFilters={currentFilters}
        isEpisode={isEpisode}
        isAnimeEpisode={isAnimeEpisode}
      />

      {documents?.length > 0 ? (
        <div
          className={`${DESIGN_TOKENS.grid.container} transition-opacity ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          {documents.map((film) => (
            <Card
              key={film._id}
              media={film}
              isEpisode={isEpisode}
              isFilmCollection={isFilmCollection}
            />
          ))}
        </div>
      ) : (
        <EmptyState onClear={() => router.push(pathname)} />
      )}

      {documents.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      )}
    </div>
  );
}

// Extracted empty state component
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
