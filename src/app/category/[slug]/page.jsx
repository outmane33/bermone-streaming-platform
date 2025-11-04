import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getContent } from "@/actions/category";
import { notFound } from "next/navigation";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";
import { Suspense } from "react";
import { SkeletonFilterSection } from "@/components/shared/skeletons/SkeletonFilterSection";
import { SORT_OPTIONS } from "@/lib/data";

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

// ✅ Dynamic metadata based on slug (films vs series)
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const metadata = {
    films: {
      title: "الأفلام - تصفح مكتبة الأفلام المترجمة | موقعك",
      description:
        "استمتع بمكتبة ضخمة من الأفلام الأجنبية، الآسيوية، والأنمي مترجمة بجودة عالية",
    },
    series: {
      title: "المسلسلات - تصفح مكتبة المسلسلات المترجمة | موقعك",
      description:
        "شاهد جميع مواسم المسلسلات الأجنبية، الآسيوية، والأنمي مترجمة اون لاين",
    },
  };

  const { title, description } = metadata[slug] || {
    title: "تصفح المحتوى | موقعك",
    description: "اكتشف أحدث الأفلام والمسلسلات المترجمة بجودة عالية",
  };

  return { title, description };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  if (!["films", "series"].includes(slug)) {
    notFound();
  }

  const { sortId, page } = parsePageParams(
    searchParamsResolved,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  const filters = buildFilters(searchParamsResolved, true);
  const contentData = await getContent(slug, filters, sortId, page);

  const isEpisode = sortId === "latestAnimeEpisodes";
  const isFilmCollection = sortId === "movieSeries";
  const sortOptions = SORT_OPTIONS[slug];

  return (
    <div className="min-h-screen">
      <Suspense fallback={<SkeletonFilterSection />}>
        <FilterSection
          initialData={contentData}
          isEpisode={isEpisode}
          isFilmCollection={isFilmCollection}
          isAnimeEpisode={isEpisode}
          slug={slug}
          isCategoryPage={true}
          sortOptions={sortOptions}
        />
      </Suspense>
    </div>
  );
}

// ✅ ISR: Revalidate every 30 minutes (categories change slowly)
export const revalidate = 1800;
