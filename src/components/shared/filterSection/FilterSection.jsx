// FilterSection.jsx
import { Suspense } from "react";
import { DESIGN_TOKENS } from "@/lib/data";
import Card from "../card/Card";
import { SkeletonCard, SkeletonCarousel } from "../skeletons/Skeletons";
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
      <Suspense fallback={<SkeletonCarousel />}>
        <Carousel carouselMida={carouselData.documents} />
      </Suspense>

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
              <Suspense key={film._id} fallback={<SkeletonCard />}>
                <Card
                  key={film._id}
                  media={film}
                  isEpisode={isEpisode}
                  isFilmCollection={isFilmCollection}
                />
              </Suspense>
            ))}
          </div>
        )}
      </FilterSectionClient>
    </>
  );
}
