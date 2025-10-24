import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getContent } from "@/actions/category";
import { notFound } from "next/navigation";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";

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

const VALID_QUERY_PARAMS = [
  "sort",
  "page",
  "genre",
  "quality",
  "year",
  "language",
  "country",
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
  if (!["films", "series"].includes(slug)) {
    notFound();
  }

  // Parse and validate parameters
  const { sortId, page } = parsePageParams(
    searchParamsResolved,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  // Build filters
  const filters = buildFilters(searchParamsResolved, true);

  // Fetch content
  const contentData = await getContent(slug, filters, sortId, page);

  // Determine content types
  const isEpisode = sortId === "latestAnimeEpisodes";
  const isFilmCollection = sortId === "movieSeries";

  return (
    <div className="min-h-screen">
      <FilterSection
        initialData={contentData}
        contentType={slug}
        isEpisode={isEpisode}
        isFilmCollection={isFilmCollection}
        isAnimeEpisode={isEpisode}
      />
    </div>
  );
}
