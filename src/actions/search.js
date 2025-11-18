"use server";
import connectToDatabase from "@/lib/mongodb";
import { cache } from "react";
import { buildSearchRegex, serializeDocument } from "./db-utils";
import { SEARCH_LIMIT } from "@/lib/data";

const serializeSearchResult = (item, contentType) => ({
  ...serializeDocument(item),
  contentType,
  relevanceScore: item.relevanceScore || 0,
});

const buildSearchPipeline = (query, limit) => {
  const regex = buildSearchRegex(query);
  return [
    {
      $match: {
        $or: [
          { title: regex },
          { originalTitle: regex },
          { description: regex },
          { dbId: regex },
        ],
      },
    },
    {
      $addFields: {
        titleLower: { $toLower: { $ifNull: ["$title", ""] } },
        originalTitleLower: { $toLower: { $ifNull: ["$originalTitle", ""] } },
        relevanceScore: {
          $sum: [
            {
              $cond: [
                {
                  $or: [
                    { $eq: [{ $toLower: "$title" }, query.toLowerCase()] },
                    {
                      $eq: [
                        { $toLower: "$originalTitle" },
                        query.toLowerCase(),
                      ],
                    },
                  ],
                },
                10000,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ["$title", ""] },
                    regex: `^${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
                    options: "i",
                  },
                },
                5000,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: { $ifNull: ["$title", ""] },
                    regex: `\\b${query.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      "\\$&"
                    )}\\b`,
                    options: "i",
                  },
                },
                1000,
                0,
              ],
            },
            { $ifNull: ["$rating", 0] },
          ],
        },
      },
    },
    { $sort: { relevanceScore: -1, rating: -1 } },
    { $limit: limit },
    {
      $project: {
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
        relevanceScore: 1,
      },
    },
  ];
};

export const searchContent = cache(async (query) => {
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return { success: true, films: [], series: [], results: [], total: 0 };
  }
  if (query.length > 100) {
    return { success: false, error: "Query too long" };
  }
  const forbidden = /(\$|\.\.\/|<script|javascript:|onerror=)/i;
  if (forbidden.test(query)) {
    return { success: false, error: "Invalid search query" };
  }

  const cleanQuery = query.trim();
  try {
    const { db } = await connectToDatabase();
    const filmPipeline = buildSearchPipeline(cleanQuery, SEARCH_LIMIT);
    const seriesPipeline = buildSearchPipeline(cleanQuery, SEARCH_LIMIT);
    const [films, series] = await Promise.all([
      db.collection("films").aggregate(filmPipeline).toArray(),
      db.collection("series").aggregate(seriesPipeline).toArray(),
    ]);

    const serializedFilms = films.map((f) => serializeSearchResult(f, "film"));
    const serializedSeries = series.map((s) =>
      serializeSearchResult(s, "series")
    );
    const allResults = [...serializedFilms, ...serializedSeries]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, SEARCH_LIMIT);
    return {
      success: true,
      films: serializedFilms,
      series: serializedSeries,
      results: allResults,
      total: allResults.length,
      query: cleanQuery,
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
