// search.js
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import sanitize from "mongo-sanitize";
import { buildSearchRegex, SEARCH_LIMIT } from "./db-utils";

// 🎯 Helper function to serialize search results
const serializeSearchResult = (item, contentType) => ({
  id: item._id.toString(),
  _id: item._id.toString(),
  title: item.title,
  originalTitle: item.originalTitle,
  image: item.image,
  year: item.releaseYear,
  rating: item.rating,
  genre: item.genre,
  slug: item.slug,
  type: contentType === "film" ? "فيلم" : "مسلسل",
  contentType,
});

// 🎯 Standard search projection
const SEARCH_PROJECTION = {
  _id: 1,
  title: 1,
  originalTitle: 1,
  image: 1,
  releaseYear: 1,
  rating: 1,
  genre: 1,
  slug: 1,
  language: 1,
  country: 1,
};

/**
 * 🔍 Search for films and series in the database
 */
export const searchContent = cache(async (query) => {
  // 🔒 تنظيف المدخلات
  const cleanQuery = sanitize(query);
  // Return empty if query is too short
  if (!cleanQuery || cleanQuery.trim().length < 2) {
    return {
      success: true,
      films: [],
      series: [],
      results: [],
      total: 0,
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const searchRegex = buildSearchRegex(cleanQuery);

    // Build search query
    const searchQuery = {
      $or: [
        { title: searchRegex },
        { originalTitle: searchRegex },
        { description: searchRegex },
      ],
    };

    // Search in films and series collections in parallel
    const [films, series] = await Promise.all([
      db
        .collection("films")
        .find(searchQuery)
        .limit(SEARCH_LIMIT)
        .project(SEARCH_PROJECTION)
        .toArray(),

      db
        .collection("series")
        .find(searchQuery)
        .limit(SEARCH_LIMIT)
        .project(SEARCH_PROJECTION)
        .toArray(),
    ]);

    // Serialize results
    const serializedFilms = films.map((film) =>
      serializeSearchResult(film, "film")
    );

    const serializedSeries = series.map((serie) =>
      serializeSearchResult(serie, "series")
    );

    // Combine and sort by rating
    const allResults = [...serializedFilms, ...serializedSeries].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );

    return {
      success: true,
      films: serializedFilms,
      series: serializedSeries,
      results: allResults,
      total: allResults.length,
      query: query.trim(),
    };
  } catch (error) {
    console.error("❌ Error searching content:", error);

    return {
      success: false,
      error: error.message,
      films: [],
      series: [],
      results: [],
      total: 0,
    };
  }
});
