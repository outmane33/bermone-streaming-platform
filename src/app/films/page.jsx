import { SORT_OPTIONS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import { getFilms } from "@/actions/films";
import { buildFilters, parsePageParams } from "@/lib/pageUtils";

const VALID_SORT_IDS = ["new", "old", "best", "popular"];
const VALID_QUERY_PARAMS = [
  "sort",
  "page",
  "genre",
  "quality",
  "year",
  "language",
  "country",
];

export const metadata = {
  title: "Films - Browse Movies",
  description: "Discover and filter through our collection of movies",
};

export default async function FilmsPage({ searchParams }) {
  const params = await searchParams;

  // Parse and validate parameters
  const { sortId, page } = parsePageParams(
    params,
    VALID_SORT_IDS,
    VALID_QUERY_PARAMS
  );

  // Build filters
  const filters = buildFilters(params, true);

  // Fetch data
  const filmsData = await getFilms(filters, sortId, page);

  return (
    <div className="min-h-screen">
      <FilterSection
        initialData={filmsData}
        sortOptions={SORT_OPTIONS.films}
        page={"films"}
      />
    </div>
  );
}
