import { SORT_OPTIONS, VALID_QUERY_PARAMS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getSeries, getEpisodes } from "@/actions/series";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";
import { Suspense } from "react";
import { SkeletonFilterSection } from "@/components/shared/skeletons/SkeletonFilterSection";

const VALID_SORT_IDS = ["latest", "new", "best", "popular", "all"];

export async function generateMetadata({ searchParams }) {
  const { sort } = await searchParams;
  const titles = {
    latest: "أحدث الحلقات",
    new: "أحدث المسلسلات",
    best: "أفضل المسلسلات",
    popular: "مسلسلات شائعة",
    all: "جميع المسلسلات",
  };
  const descriptions = {
    latest: "شاهد أحدث الحلقات المضافة اليوم من مسلسلات أجنبية وعربية وآسيوية",
    new: "استكشف أحدث المسلسلات المضافة حديثًا بجميع التصنيفات",
    best: "أفضل المسلسلات حسب تقييمات الجمهور - مشاهدة اون لاين",
    popular: "المسلسلات الأكثر رواجًا هذا الأسبوع - مترجمة بدقة عالية",
    all: "تصفح كامل مكتبة المسلسلات: أجنبية، آسيوية، أنمي، عربية",
  };

  return {
    title: `${titles[sort] || "جميع المسلسلات"} | ${
      process.env.NEXT_PUBLIC_SITE_URL
    }`,
    description:
      descriptions[sort] || "شاهد وحمل مسلسلات مترجمة اون لاين بجودة عالية",
  };
}

export default async function SeriesPage({ searchParams }) {
  const params = await searchParams;

  const { sortId: rawSortId, page } = parsePageParams(
    params,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  const sortId = rawSortId || "all";
  const filters = buildFilters(params, true);
  const isLatest = sortId === "latest";
  const data = isLatest
    ? await getEpisodes(page)
    : await getSeries(filters, sortId, page);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<SkeletonFilterSection />}>
        <FilterSection
          initialData={data}
          sortOptions={SORT_OPTIONS.series}
          isEpisode={isLatest}
          page="series"
        />
      </Suspense>
    </div>
  );
}

export const revalidate = 900;
