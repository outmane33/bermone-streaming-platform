import { Suspense } from "react";
import {
  getLatestAdded,
  getNewSeries,
  getNewMovies,
  getLatestEpisodes,
} from "@/actions/home";
import { getFilms } from "@/actions/films";
import { redirect } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";
import Carousel from "@/components/shared/carousel/Carousel";
import { SkeletonCarousel } from "@/components/shared/skeletons/Skeletons";
import { buildFilters } from "@/lib/pageUtils";

export const metadata = {
  title: "Home - Stream Movies & Series",
  description: "Watch latest movies, series and episodes",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const sortId = params?.sort || "latest-added";
  const page = parseInt(params?.page || "1", 10);

  // Redirect if no sort parameter
  if (!params?.sort) {
    redirect("/?sort=latest-added");
  }

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
    <div className="min-h-screen">
      <FilterSection
        initialData={initialData}
        sortOptions={SORT_OPTIONS.home}
        isEpisode={isEpisode}
        carouselMida={newFilms.documents}
        page="home"
      />
    </div>
  );
}
