"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";

// 🎯 Constants
const SEARCH_LIMIT = 20; // Maximum results to return

/**
 * 🔍 Search for films and series in the database
 * @param {string} query - Search query string
 * @returns {Promise} - Search results with films and series
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

    // Create regex for case-insensitive search
    const searchRegex = new RegExp(query.trim(), "i");

    // Search in films and series collections in parallel
    const [films, series] = await Promise.all([
      // Search films
      db
        .collection("films")
        .find({
          $or: [
            { title: searchRegex },
            { originalTitle: searchRegex },
            { description: searchRegex },
          ],
        })
        .limit(SEARCH_LIMIT)
        .project({
          _id: 1,
          title: 1,
          originalTitle: 1,
          image: 1,
          releaseYear: 1,
          rating: 1,
          genre: 1,
          slug: 1,
          quality: 1,
        })
        .toArray(),

      // Search series
      db
        .collection("series")
        .find({
          $or: [
            { title: searchRegex },
            { originalTitle: searchRegex },
            { description: searchRegex },
          ],
        })
        .limit(SEARCH_LIMIT)
        .project({
          _id: 1,
          title: 1,
          originalTitle: 1,
          image: 1,
          releaseYear: 1,
          rating: 1,
          genre: 1,
          slug: 1,
          quality: 1,
        })
        .toArray(),
    ]);

    // Serialize and combine results
    const serializedFilms = films.map((film) => ({
      id: film._id.toString(),
      _id: film._id.toString(),
      title: film.title,
      originalTitle: film.originalTitle,
      image: film.image,
      year: film.releaseYear,
      rating: film.rating,
      genre: film.genre,
      slug: film.slug,
      quality: film.quality,
      type: "فيلم", // "Film" in Arabic
      contentType: "film",
    }));

    const serializedSeries = series.map((serie) => ({
      id: serie._id.toString(),
      _id: serie._id.toString(),
      title: serie.title,
      originalTitle: serie.originalTitle,
      image: serie.image,
      year: serie.releaseYear,
      rating: serie.rating,
      genre: serie.genre,
      slug: serie.slug,
      quality: serie.quality,
      type: "مسلسل", // "Series" in Arabic
      contentType: "series",
    }));

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
 * @param {string} query - Search query string
 * @param {object} filters - Filter options (genre, year, etc.)
 * @param {number} limit - Maximum results to return
 * @returns {Promise} - Filtered search results
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

      // Build search query
      const searchRegex = new RegExp(query.trim(), "i");
      const baseQuery = {
        $or: [
          { title: searchRegex },
          { originalTitle: searchRegex },
          { description: searchRegex },
        ],
      };

      // Add filters
      if (filters.genre?.length > 0) {
        baseQuery.genre = { $in: filters.genre };
      }

      if (filters.year?.length > 0) {
        baseQuery.releaseYear = {
          $in: filters.year.map((y) => parseInt(y, 10)),
        };
      }

      if (filters.quality?.length > 0) {
        baseQuery.quality = { $in: filters.quality };
      }

      if (filters.language?.length > 0) {
        baseQuery.language = { $in: filters.language };
      }

      if (filters.country?.length > 0) {
        baseQuery.country = { $in: filters.country };
      }

      // Search both collections
      const [films, series] = await Promise.all([
        db
          .collection("films")
          .find(baseQuery)
          .limit(limit)
          .sort({ rating: -1, views: -1 })
          .project({
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
          })
          .toArray(),

        db
          .collection("series")
          .find(baseQuery)
          .limit(limit)
          .sort({ rating: -1, views: -1 })
          .project({
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
          })
          .toArray(),
      ]);

      // Serialize results
      const allResults = [
        ...films.map((film) => ({
          id: film._id.toString(),
          _id: film._id.toString(),
          ...film,
          _id: undefined,
          type: "فيلم",
          contentType: "film",
        })),
        ...series.map((serie) => ({
          id: serie._id.toString(),
          _id: serie._id.toString(),
          ...serie,
          _id: undefined,
          type: "مسلسل",
          contentType: "series",
        })),
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
 * @param {string} query - Search query string
 * @param {number} limit - Maximum suggestions to return
 * @returns {Promise} - Search suggestions
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

    const searchRegex = new RegExp(`^${query.trim()}`, "i"); // Starts with query

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
