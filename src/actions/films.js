// films.js - REFACTORED
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import sanitize from "mongo-sanitize";
import {
  BASE_SORT_CONFIGS,
  buildContentAggregationPipeline,
  buildPaginationResponse,
  toObjectId,
  serializeDocument,
} from "./db-utils";
import { MAX_RELATED, ITEMS_PER_PAGE } from "@/lib/data";

// 🎯 Film-specific sort configurations (extend base configs)
const FILMS_SORT_CONFIGS = {
  ...BASE_SORT_CONFIGS,
  // Add any film-specific configs here if needed
};

// 🚀 Get Films with filters and sorting
export const getFilms = cache(async (filters = {}, sortId = null, page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("films");

    const sortConfig = sortId
      ? FILMS_SORT_CONFIGS[sortId] || FILMS_SORT_CONFIGS.all
      : { sort: { createdAt: -1 }, filter: {} };

    const pipeline = buildContentAggregationPipeline(filters, sortConfig, page);
    const [result] = await collection.aggregate(pipeline).toArray();
    return {
      success: true,
      ...buildPaginationResponse(result, page),
    };
  } catch (error) {
    console.error("❌ Error fetching films:", error); // Keep for server logs
    return {
      success: false,
      error: "An error occurred while fetching films", // ✅ Generic message
      documents: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
});

// 🚀 Get single film by slug
export const getFilmBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("films");

    const cleanSlug = sanitize(decodeURIComponent(slug));
    const film = await collection.findOne({ slug: cleanSlug });

    if (!film) {
      return {
        success: false,
        error: "Film not found",
        film: null,
      };
    }

    return {
      success: true,
      film: serializeDocument(film),
    };
  } catch (error) {
    console.error("❌ Error fetching film by slug:", error);
    return {
      success: false,
      error: "An error occurred while fetching the film", // ✅ Generic
      film: null,
    };
  }
});

// 🎯 Get film collection by film ID
export const getFilmCollection = cache(async (filmId) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const filmObjectId = toObjectId(filmId);

    const collection = await db.collection("filmcollections").findOne({
      films: filmObjectId,
    });

    if (!collection) {
      return {
        success: false,
        message: "Film not in any collection",
        collection: null,
        films: [],
      };
    }

    const films = await db
      .collection("films")
      .find({ _id: { $in: collection.films } })
      .sort({ releaseYear: 1 })
      .limit(100)
      .toArray();

    return {
      success: true,
      collection: {
        _id: collection._id.toString(),
        name: collection.name,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      films: films.map(serializeDocument),
    };
  } catch (error) {
    console.error("❌ Error fetching film collection:", error);
    return {
      success: false,
      error: "An error occurred while fetching the collection", // ✅ Generic
      collection: null,
      films: [],
    };
  }
});

// 🎯 Get related films based on similarity
export const getRelatedFilms = cache(
  async (filmId, filmData = {}, limit = 12) => {
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || 12, 1),
      MAX_RELATED
    );
    try {
      const client = await clientPromise;
      const collection = client.db().collection("films");

      const filmObjectId = toObjectId(filmId);
      const { genre = [], releaseYear, language } = filmData;

      const matchQuery = {
        _id: { $ne: filmObjectId },
      };

      const orConditions = [];

      if (genre.length > 0) {
        orConditions.push({ genre: { $in: genre } });
      }

      if (releaseYear) {
        orConditions.push({
          releaseYear: {
            $gte: releaseYear - 3,
            $lte: releaseYear + 3,
          },
        });
      }

      if (language) {
        orConditions.push({ language });
      }

      if (orConditions.length > 0) {
        matchQuery.$or = orConditions;
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $addFields: {
            genreMatch: {
              $size: {
                $ifNull: [{ $setIntersection: ["$genre", genre] }, []],
              },
            },
            yearMatch: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$releaseYear", releaseYear - 3] },
                    { $lte: ["$releaseYear", releaseYear + 3] },
                  ],
                },
                1,
                0,
              ],
            },
            languageMatch: {
              $cond: [{ $eq: ["$language", language] }, 1, 0],
            },
          },
        },
        {
          $addFields: {
            similarityScore: {
              $add: [
                { $multiply: ["$genreMatch", 3] },
                "$yearMatch",
                "$languageMatch",
              ],
            },
          },
        },
        { $sort: { similarityScore: -1, rating: -1, views: -1 } },
        { $limit: safeLimit },
        {
          $project: {
            _id: { $toString: "$_id" },
            title: 1,
            genre: 1,
            rating: 1,
            releaseYear: 1,
            language: 1,
            country: 1,
            image: 1,
            slug: 1,
            category: 1,
            duration: 1,
          },
        },
      ];

      const films = await collection.aggregate(pipeline).toArray();

      return {
        success: true,
        films,
        count: films.length,
      };
    } catch (error) {
      console.error("❌ Error fetching related films:", error);
      return {
        success: false,
        error: "An error occurred while fetching related films",
        films: [],
      };
    }
  }
);
