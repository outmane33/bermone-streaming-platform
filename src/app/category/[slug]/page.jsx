import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getContent } from "@/actions/category";
import { notFound } from "next/navigation";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";
import { Suspense } from "react";
import { SkeletonFilterSection } from "@/components/shared/skeletons/SkeletonFilterSection";
import { SORT_OPTIONS, VALID_QUERY_PARAMS } from "@/lib/data";

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

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const metadata = {
    films: {
      title: `الأفلام - تصفح مكتبة الأفلام المترجمة | ${process.env.NEXT_PUBLIC_SITE_URL}`,
      description:
        "استمتع بمكتبة ضخمة من الأفلام الأجنبية، الآسيوية، والأنمي مترجمة بجودة عالية",
    },
    series: {
      title: `المسلسلات - تصفح مكتبة المسلسلات المترجمة | ${process.env.NEXT_PUBLIC_SITE_URL}`,
      description:
        "شاهد جميع مواسم المسلسلات الأجنبية، الآسيوية، والأنمي مترجمة اون لاين",
    },
  };

  const { title, description } = metadata[slug] || {
    title: `تصفح المحتوى | ${process.env.NEXT_PUBLIC_SITE_URL}`,
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

export const revalidate = 1800;
