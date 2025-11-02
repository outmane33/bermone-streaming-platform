// search.js
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import sanitize from "mongo-sanitize";
import { SEARCH_LIMIT } from "@/lib/data";

// 🎯 Helper function to serialize search results
const serializeSearchResult = (item, contentType) => ({
  id: item._id.toString(),
  _id: item._id.toString(),
  title: item.title,
  image: item.image,
  releaseYear: item.releaseYear,
  rating: item.rating,
  genre: item.genre,
  slug: item.slug,
  contentType,
  relevanceScore: item.relevanceScore || 0, // Include for debugging
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
 * 🎯 Build optimized aggregation pipeline for relevance-based search
 */
const buildSearchPipeline = (query, limit) => {
  const normalizedQuery = query.toLowerCase().trim();
  const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return [
    // Stage 1: Match documents using indexes
    {
      $match: {
        $or: [
          { title: { $regex: escapedQuery, $options: "i" } },
          { originalTitle: { $regex: escapedQuery, $options: "i" } },
          { description: { $regex: escapedQuery, $options: "i" } },
          { dbId: { $regex: escapedQuery, $options: "i" } },
        ],
      },
    },

    // Stage 2: Calculate relevance score
    {
      $addFields: {
        titleLower: { $toLower: { $ifNull: ["$title", ""] } },
        originalTitleLower: { $toLower: { $ifNull: ["$originalTitle", ""] } },
        relevanceScore: {
          $sum: [
            // Exact match: 10000 points
            {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: "$title" }, normalizedQuery] },
                    { $eq: [{ $toLower: "$originalTitle" }, normalizedQuery] },
                  ],
                },
                10000,
                0,
              ],
            },

            // Starts with: 5000 points
            {
              $cond: [
                {
                  $or: [
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$title", ""] },
                        regex: `^${escapedQuery}`,
                        options: "i",
                      },
                    },
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$originalTitle", ""] },
                        regex: `^${escapedQuery}`,
                        options: "i",
                      },
                    },
                  ],
                },
                5000,
                0,
              ],
            },

            // Contains as word: 1000 points
            {
              $cond: [
                {
                  $or: [
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$title", ""] },
                        regex: `\\b${escapedQuery}\\b`,
                        options: "i",
                      },
                    },
                    {
                      $regexMatch: {
                        input: { $ifNull: ["$originalTitle", ""] },
                        regex: `\\b${escapedQuery}\\b`,
                        options: "i",
                      },
                    },
                  ],
                },
                1000,
                0,
              ],
            },

            // Rating bonus (max 10 points)
            { $ifNull: ["$rating", 0] },
          ],
        },
      },
    },

    // Stage 3: Sort by relevance
    { $sort: { relevanceScore: -1, rating: -1 } },

    // Stage 4: Limit results
    { $limit: limit },

    // Stage 5: Project only needed fields
    {
      $project: {
        ...SEARCH_PROJECTION,
        relevanceScore: 1,
      },
    },
  ];
};

/**
 * 🔍 Search for films and series in the database
 */
export const searchContent = cache(async (query) => {
  // ✅ 1. Type validation
  if (!query || typeof query !== "string") {
    return { success: true, films: [], series: [], results: [], total: 0 };
  }

  const trimmedQuery = query.trim();

  // ✅ 2. Minimum length check
  if (trimmedQuery.length < 2) {
    return { success: true, films: [], series: [], results: [], total: 0 };
  }

  // ✅ 3. Maximum length check (prevent DoS)
  if (trimmedQuery.length > 100) {
    return { success: false, error: "Query too long" };
  }

  // ✅ 4. Forbidden patterns check (prevent injection)
  const FORBIDDEN_PATTERNS = /(\$|\.\.\/|<script|javascript:|onerror=)/i;
  if (FORBIDDEN_PATTERNS.test(trimmedQuery)) {
    return { success: false, error: "Invalid search query" };
  }

  // ✅ 5. Sanitize input
  const cleanQuery = sanitize(trimmedQuery);

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

    // Build aggregation pipelines
    const filmPipeline = buildSearchPipeline(cleanQuery, SEARCH_LIMIT);
    const seriesPipeline = buildSearchPipeline(cleanQuery, SEARCH_LIMIT);

    // Execute searches in parallel using aggregation
    const [films, series] = await Promise.all([
      db.collection("films").aggregate(filmPipeline).toArray(),
      db.collection("series").aggregate(seriesPipeline).toArray(),
    ]);

    // Serialize results
    const serializedFilms = films.map((film) =>
      serializeSearchResult(film, "film")
    );

    const serializedSeries = series.map((serie) =>
      serializeSearchResult(serie, "series")
    );

    // Combine and sort by relevance score (already calculated in DB)
    const allResults = [...serializedFilms, ...serializedSeries]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, SEARCH_LIMIT);

    return {
      success: true,
      films: serializedFilms,
      series: serializedSeries,
      results: allResults,
      total: allResults.length,
      query: trimmedQuery,
    };
  } catch (error) {
    console.error("❌ Error searching content:", error);

    return {
      success: false,
      error: "An error occurred while searching",
      films: [],
      series: [],
      results: [],
      total: 0,
    };
  }
});
