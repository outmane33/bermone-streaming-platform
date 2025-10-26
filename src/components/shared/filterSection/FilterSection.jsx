// FilterSection.jsx
import { DESIGN_TOKENS } from "@/lib/data";
import Card from "../card/Card";
import FilterSectionClient from "./FilterSectionClient";
import Carousel from "../carousel/Carousel";
import { getFilms } from "@/actions/films";
import { getSeries } from "@/actions/series";

export default async function FilterSection({
  initialData,
  sortOptions,
  isEpisode = false,
  isFilmCollection = false,
  isAnimeEpisode = false,
  page,
  slug,
}) {
  const { documents, pagination } = initialData;
  const carouselData =
    page === "home" || page === "films" || slug === "films"
      ? await getFilms({}, "new", 1)
      : await getSeries({}, "new", 1);

  return (
    <>
      <Carousel carouselMida={carouselData.documents} />
      <FilterSectionClient
        sortOptions={sortOptions}
        isEpisode={isEpisode}
        isFilmCollection={isFilmCollection}
        isAnimeEpisode={isAnimeEpisode}
        initialDocuments={documents}
        initialPagination={pagination}
      >
        {documents?.length > 0 && (
          <div className={DESIGN_TOKENS.grid.container}>
            {documents.map((film) => (
              <Card
                key={film._id}
                media={film}
                isEpisode={isEpisode}
                isFilmCollection={isFilmCollection}
              />
            ))}
          </div>
        )}
      </FilterSectionClient>
    </>
  );
}
