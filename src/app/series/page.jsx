import { SORT_OPTIONS, VALID_QUERY_PARAMS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getSeries, getEpisodes } from "@/actions/series";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";

const VALID_SORT_IDS = ["latest", "new", "best", "popular", "all"];

export const metadata = {
  title: "Series - Browse Movies",
  description: "Discover and filter through our collection of series",
};

export default async function SeriesPage({ searchParams }) {
  const params = await searchParams;

  // Parse and validate parameters with default sortId
  const { sortId: rawSortId, page } = parsePageParams(
    params,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  const sortId = rawSortId || "all";

  // Build filters
  const filters = buildFilters(params, true);

  // Determine if showing latest episodes
  const isLatest = sortId === "latest";

  // Fetch data based on sort type
  const data = isLatest
    ? await getEpisodes(page)
    : await getSeries(filters, sortId, page);

  return (
    <div className="min-h-screen">
      <FilterSection
        initialData={data}
        sortOptions={SORT_OPTIONS.series}
        isEpisode={isLatest}
        page={"series"}
      />
    </div>
  );
}
