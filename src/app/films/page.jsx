// app/films/page.jsx
import { Suspense } from "react";
import { SORT_OPTIONS, VALID_QUERY_PARAMS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getFilms } from "@/actions/films";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";
import { SkeletonFilterSection } from "@/components/shared/skeletons/SkeletonFilterSection";

const VALID_SORT_IDS = ["new", "old", "best", "popular"];

// ✅ Dynamic metadata based on sort parameter
export async function generateMetadata({ searchParams }) {
  const { sort } = await searchParams;
  const titles = {
    new: "أحدث الأفلام",
    old: "أفلام قديمة",
    best: "أفضل الأفلام",
    popular: "أفلام شائعة",
  };
  const descriptions = {
    new: "شاهد أحدث الأفلام المضافة حديثًا مترجمة بجودة عالية اون لاين",
    old: "استمتع بأفضل الأفلام الكلاسيكية والقديمة بجودة HD",
    best: "أفضل الأفلام حسب تقييمات المشاهدين - مشاهدة وتحميل مباشر",
    popular: "الأفلام الأكثر مشاهدة هذا الأسبوع - مترجمة بدقة عالية",
  };

  return {
    title: `${titles[sort] || "جميع الأفلام"} | موقعك`,
    description:
      descriptions[sort] || "شاهد وحمل أفلام مترجمة بجودة عالية اون لاين",
  };
}

export default async function FilmsPage({ searchParams }) {
  const params = await searchParams;

  const { sortId, page } = parsePageParams(
    params,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  const filters = buildFilters(params, true);
  const filmsData = await getFilms(filters, sortId, page);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<SkeletonFilterSection />}>
        <FilterSection
          initialData={filmsData}
          sortOptions={SORT_OPTIONS.films}
          page="films"
        />
      </Suspense>
    </div>
  );
}

// ✅ ISR: Revalidate every 15 minutes
export const revalidate = 900;
