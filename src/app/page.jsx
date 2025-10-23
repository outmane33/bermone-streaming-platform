import { Suspense } from "react";
import {
  getLatestAdded,
  getNewSeries,
  getNewMovies,
  getLatestEpisodes,
} from "@/actions/home";
import { SORT_OPTIONS } from "@/lib/data";
import FilterSection from "@/components/shared/filterSection/FilterSection";

export const metadata = {
  title: "Home - Stream Movies & Series",
  description: "Watch latest movies, series and episodes",
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const sortId = params?.sort || "latest-added";
  const page = parseInt(params?.page || "1", 10);

  // Build filters object from search params
  const filters = {
    genre: params?.genre?.split(",").filter(Boolean) || [],
    year: params?.year?.split(",").filter(Boolean) || [],
    language: params?.language?.split(",").filter(Boolean) || [],
    country: params?.country?.split(",").filter(Boolean) || [],
  };
  let initialData;
  let isEpisode = false;

  // Fetch data based on selected sort/section with filters
  if (sortId === "latest-added") {
    initialData = await getLatestAdded(filters, page);
  } else if (sortId === "new-series") {
    initialData = await getNewSeries(filters, page);
  } else if (sortId === "new-movies") {
    initialData = await getNewMovies(filters, page);
  } else if (sortId === "latest-episodes") {
    initialData = await getLatestEpisodes(filters, page);
    isEpisode = true;
  } else {
    // Default to latest added
    initialData = await getLatestAdded(filters, page);
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <FilterSection
          initialData={initialData}
          sortOptions={SORT_OPTIONS.home}
          isEpisode={isEpisode}
        />
      </Suspense>
    </div>
  );
}
