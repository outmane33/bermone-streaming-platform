import { Suspense } from "react";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getContent } from "@/actions/category";
import { notFound } from "next/navigation";
import FilterSectionSkeleton from "@/components/shared/filterSection/FilterSectionSkeleton";

const VALID_SORT_IDS = [
  "foreignMovies",
  "asianMovies",
  "animeMovies",
  "movieSeries",
  "foreignSeries",
  "asianSeries",
  "animeSeries",
  "topSeries",
  "latestAnimeEpisodes",
];

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

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const titles = {
    films: "Films - Browse Movies",
    series: "Series - Browse TV Shows",
  };

  const descriptions = {
    films: "Discover and filter through our collection of movies",
    series: "Discover and filter through our collection of TV series",
  };

  return {
    title: titles[slug] || "Browse Content",
    description: descriptions[slug] || "Discover our content collection",
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Validate slug
  if (!["films", "series", "animes"].includes(slug)) {
    notFound();
  }

  // Validate query parameters - check for invalid params
  const queryKeys = Object.keys(searchParamsResolved || {});
  const hasInvalidParams = queryKeys.some(
    (key) => !VALID_QUERY_PARAMS.includes(key)
  );

  if (hasInvalidParams) {
    notFound();
  }

  const filters = {
    genre: searchParamsResolved?.genre?.split(",").filter(Boolean) || [],
    quality: searchParamsResolved?.quality?.split(",").filter(Boolean) || [],
    year: searchParamsResolved?.year?.split(",").filter(Boolean) || [],
    language: searchParamsResolved?.language?.split(",").filter(Boolean) || [],
    country: searchParamsResolved?.country?.split(",").filter(Boolean) || [],
  };

  const sortId = searchParamsResolved?.sort || null;
  const page = parseInt(searchParamsResolved?.page || "1", 10);

  // Validate sortId - if provided, must be valid
  if (sortId && !VALID_SORT_IDS.includes(sortId)) {
    notFound();
  }
  const contentData = await getContent(slug, filters, sortId, page);

  let isEpisode = sortId === "latestAnimeEpisodes";
  let isFilmCollection = sortId === "movieSeries";
  console.log("Server: searchParams =", searchParamsResolved);
  return (
    <div className="min-h-screen">
      <Suspense fallback={<FilterSectionSkeleton />}>
        <FilterSection
          initialData={contentData}
          contentType={slug}
          isEpisode={isEpisode}
          isFilmCollection={isFilmCollection}
          isAnimeEpisode={isEpisode}
        />
      </Suspense>
    </div>
  );
}
