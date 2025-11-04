// app/page.jsx (Home)
import {
  getLatestAdded,
  getNewSeries,
  getNewMovies,
  getLatestEpisodes,
} from "@/actions/home";
import { getFilms } from "@/actions/films";
import { SORT_OPTIONS, VALID_QUERY_PARAMS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";
import { Suspense } from "react";
import { SkeletonFilterSection } from "@/components/shared/skeletons/SkeletonFilterSection";

const VALID_SORT_IDS = [
  "latest-added",
  "latest-episodes",
  "new-movies",
  "new-series",
];

export const metadata = {
  title: `شاهد أحدث الأفلام والمسلسلات مترجمة | ${process.env.NEXT_PUBLIC_SITE_URL}`,
  description:
    "استمتع بمشاهدة وتحميل أحدث الأفلام والمسلسلات والحلقات مترجمة بجودة عالية اون لاين.",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;

  // ✅ NO MORE REDIRECT — sort is guaranteed by middleware
  const { sortId, page } = parsePageParams(
    params,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  const filters = buildFilters(params, false);

  let initialData;
  let isEpisode = false;

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

  const newFilms = await getFilms({}, "new", 1);

  return (
    <div className="relative min-h-screen pb-10">
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

export const revalidate = 300; // ✅ Now ISR works!
