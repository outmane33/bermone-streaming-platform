"use client";

import { useTransition, useMemo } from "react";
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

  const searchParamsString = searchParams.toString();

  const currentFilters = useMemo(() => {
    const params = new URLSearchParams(searchParamsString);
    return {
      genre: params.get("genre")?.split(",").filter(Boolean) || [],
      year: params.get("year")?.split(",").filter(Boolean) || [],
      language: params.get("language")?.split(",").filter(Boolean) || [],
      country: params.get("country")?.split(",").filter(Boolean) || [],
      sort: params.get("sort") || null,
      page: parseInt(params.get("page") || "1", 10),
    };
  }, [searchParamsString]);

  const updateURL = (newParams) => {
    const params = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (key === "page") return;

      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (value && !Array.isArray(value) && value !== null) {
        params.set(key, value.toString());
      }
    });

    const pageNum = newParams.page || 1;
    if (pageNum > 1) {
      params.set("page", pageNum.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl, { scroll: false });
  };

  const handleFilterChange = (newFilters) => {
    updateURL({
      ...newFilters,
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    updateURL({
      ...currentFilters,
      page: newPage,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          className={`${DESIGN_TOKENS.grid.container} opacity-${
            isPending ? "50" : "100"
          } transition-opacity`}
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
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-6xl">🎬</div>
          <h3 className="text-2xl font-bold text-white">No documents found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
          <button
            onClick={() => router.push(pathname)}
            className="px-6 py-2 bg-cyan-500 rounded hover:bg-cyan-600 transition"
          >
            Clear Filters
          </button>
        </div>
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
