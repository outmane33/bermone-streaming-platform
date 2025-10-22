import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getSeries, getEpisodes } from "@/actions/series";

const VALID_SORT_IDS = ["latest", "new", "best", "popular", "all"];

// Define valid query parameters
const VALID_QUERY_PARAMS = [
  "sort",
  "page",
  "genre",
  "quality",
  "year",
  "language",
  "country",
];

// 🎯 Generate metadata
export const metadata = {
  title: "Series - Browse Movies",
  description: "Discover and filter through our collection of series",
};

// 🎯 Main page component
export default async function SeriesPage({ searchParams }) {
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

  const sortId = params?.sort || "all";
  const page = parseInt(params?.page || "1", 10);

  // Validate sortId - if provided, must be valid
  if (sortId && !VALID_SORT_IDS.includes(sortId)) {
    notFound();
  }

  const isLatest = sortId === "latest";

  let data = null;
  if (isLatest) {
    data = await getEpisodes(page);
  } else {
    data = await getSeries(filters, sortId, page);
  }

  return (
    <div className="min-h-screen">
      <Suspense>
        <FilterSection
          initialData={data}
          sortOptions={SORT_OPTIONS.series}
          isEpisode={isLatest}
        />
      </Suspense>
    </div>
  );
}
