import {
  getLatestAdded,
  getNewSeries,
  getNewMovies,
  getLatestEpisodes,
} from "@/actions/home";
import { getFilms } from "@/actions/films";
import { redirect } from "next/navigation";
import { SORT_OPTIONS, VALID_QUERY_PARAMS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";
import { Suspense } from "react";
import { SkeletonFilterSection } from "@/components/shared/filterSection/SkeletonFilterSection";

const VALID_SORT_IDS = [
  "latest-added",
  "latest-episodes",
  "new-movies",
  "new-series",
];

export const metadata = {
  title: "Home - Stream Movies & Series",
  description: "Watch latest movies, series and episodes",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;

  // Redirect if no sort parameter
  if (!params?.sort) {
    redirect("/?sort=latest-added");
  }

  // Parse and validate parameters
  const { sortId, page } = parsePageParams(
    params,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  // Build filters (without quality for home page)
  const filters = buildFilters(params, false);

  let initialData;
  let isEpisode = false;

  // Fetch data based on selected sort/section with filters
  switch (sortId) {
    case "new-series":
      initialData = await getNewSeries(filters, page);
      break;
    case "new-movies":
      initialData = await getNewMovies(filters, page);
      break;
    case "latest-episodes":
      initialData = await getLatestEpisodes(filters, page);
      isEpisode = true;
      break;
    case "latest-added":
    default:
      initialData = await getLatestAdded(filters, page);
      break;
  }

  // Fetch carousel data
  const newFilms = await getFilms({}, "new", 1);

  return (
    <div className="relative min-h-screen pb-10 ">
      <Suspense fallback={<SkeletonFilterSection />}>
        <FilterSection
          initialData={initialData}
          sortOptions={SORT_OPTIONS.home}
          isEpisode={isEpisode}
          carouselMida={newFilms.documents}
          page="home"
        />
      </Suspense>
    </div>
  );
}
