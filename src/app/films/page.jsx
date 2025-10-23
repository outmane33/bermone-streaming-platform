import { Suspense } from "react";
import { SORT_OPTIONS } from "@/lib/data";
import { notFound } from "next/navigation";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getFilms } from "@/actions/films";
import FilterSectionSkeleton from "@/components/shared/filterSection/FilterSectionSkeleton";

const VALID_SORT_IDS = ["new", "old", "best", "popular"];

// Define valid query parameters
const VALID_QUERY_PARAMS = [
  "sort",
  "page",
  "genre",
  "quality",
  "year",
  "language",
  "country",
  "sort",
];

export const metadata = {
  title: "Films - Browse Movies",
  description: "Discover and filter through our collection of movies",
};

export default async function FilmsPage({ searchParams }) {
  const params = await searchParams;
  const searchParamsResolved = await searchParams;

  // Validate query parameters - check for invalid params
  const queryKeys = Object.keys(searchParamsResolved || {});
  const hasInvalidParams = queryKeys.some(
    (key) => !VALID_QUERY_PARAMS.includes(key)
  );

  if (hasInvalidParams) {
    notFound();
  }

  const filters = {
    genre: params?.genre?.split(",").filter(Boolean) || [],
    quality: params?.quality?.split(",").filter(Boolean) || [],
    year: params?.year?.split(",").filter(Boolean) || [],
    language: params?.language?.split(",").filter(Boolean) || [],
    country: params?.country?.split(",").filter(Boolean) || [],
  };

  // ✅ Don't provide default value - use null if not present
  const sortId = params?.sort || null;
  const page = parseInt(params?.page || "1", 10);

  // Validate sortId - if provided, must be valid
  if (sortId && !VALID_SORT_IDS.includes(sortId)) {
    notFound();
  }

  const filmsData = await getFilms(filters, sortId, page);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<FilterSectionSkeleton />}>
        <FilterSection
          initialData={filmsData}
          sortOptions={SORT_OPTIONS.films}
        />
      </Suspense>
    </div>
  );
}
