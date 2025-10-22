// search.js - REFACTORED
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import { buildMatchQuery, buildSearchRegex, SEARCH_LIMIT } from "./db-utils";

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
  quality: item.quality,
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
  quality: 1,
  language: 1,
  country: 1,
};

/**
 * 🔍 Search for films and series in the database
 */
export const searchContent = cache(async (query) => {
  // Return empty if query is too short
  if (!query || query.trim().length < 2) {
    return {
      success: true,
      films: [],
      series: [],
      total: 0,
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const searchRegex = buildSearchRegex(query);

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

/**
 * 🔍 Advanced search with filters
 */
export const advancedSearch = cache(
  async (query, filters = {}, limit = SEARCH_LIMIT) => {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        results: [],
        total: 0,
      };
    }

    try {
      const client = await clientPromise;
      const db = client.db();

      const searchRegex = buildSearchRegex(query);

      // Build base search query
      const baseSearchQuery = {
        $or: [
          { title: searchRegex },
          { originalTitle: searchRegex },
          { description: searchRegex },
        ],
      };

      // Combine search with filters
      const searchQuery = buildMatchQuery(filters, baseSearchQuery);

      // Search both collections
      const [films, series] = await Promise.all([
        db
          .collection("films")
          .find(searchQuery)
          .limit(limit)
          .sort({ rating: -1, views: -1 })
          .project(SEARCH_PROJECTION)
          .toArray(),

        db
          .collection("series")
          .find(searchQuery)
          .limit(limit)
          .sort({ rating: -1, views: -1 })
          .project(SEARCH_PROJECTION)
          .toArray(),
      ]);

      // Serialize and combine results
      const allResults = [
        ...films.map((film) => serializeSearchResult(film, "film")),
        ...series.map((serie) => serializeSearchResult(serie, "series")),
      ].sort((a, b) => (b.rating || 0) - (a.rating || 0));

      return {
        success: true,
        results: allResults,
        total: allResults.length,
        query: query.trim(),
        filters,
      };
    } catch (error) {
      console.error("❌ Error in advanced search:", error);

      return {
        success: false,
        error: error.message,
        results: [],
        total: 0,
      };
    }
  }
);

/**
 * 🔍 Get search suggestions (autocomplete)
 */
export const getSearchSuggestions = cache(async (query, limit = 10) => {
  if (!query || query.trim().length < 2) {
    return {
      success: true,
      suggestions: [],
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const searchRegex = buildSearchRegex(query, true); // startsWith = true

    // Get suggestions from both collections
    const [filmTitles, seriesTitles] = await Promise.all([
      db
        .collection("films")
        .find({ title: searchRegex })
        .limit(limit)
        .project({ title: 1 })
        .toArray(),

      db
        .collection("series")
        .find({ title: searchRegex })
        .limit(limit)
        .project({ title: 1 })
        .toArray(),
    ]);

    // Combine and deduplicate suggestions
    const suggestions = [
      ...new Set([
        ...filmTitles.map((f) => f.title),
        ...seriesTitles.map((s) => s.title),
      ]),
    ].slice(0, limit);

    return {
      success: true,
      suggestions,
    };
  } catch (error) {
    console.error("❌ Error getting search suggestions:", error);

    return {
      success: false,
      error: error.message,
      suggestions: [],
    };
  }
});
