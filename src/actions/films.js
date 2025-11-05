"use server";
import connectToDatabase from "@/lib/mongodb"; // ← updated import
import { cache } from "react";
import {
  BASE_SORT_CONFIGS,
  buildContentAggregationPipeline,
  buildPaginationResponse,
  buildErrorResponse,
  toObjectId,
  serializeDocument,
} from "./db-utils";
import { MAX_RELATED } from "@/lib/data";

const FILMS_SORT_CONFIGS = {
  ...BASE_SORT_CONFIGS,
};

export const getFilms = cache(async (filters = {}, sortId = null, page = 1) => {
  try {
    const { client, db } = await connectToDatabase(); // ← new
    const collection = db.collection("films");
    const sortConfig =
      sortId && FILMS_SORT_CONFIGS[sortId]
        ? FILMS_SORT_CONFIGS[sortId]
        : { sort: { createdAt: -1 }, filter: {} };

    const pipeline = buildContentAggregationPipeline(filters, sortConfig, page);
    const [result] = await collection.aggregate(pipeline).toArray();
    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }
    return {
      success: true,
      ...buildPaginationResponse(result, page),
    };
  } catch (error) {
    return buildErrorResponse("films", error, page);
  }
});

export const getFilmBySlug = cache(async (slug) => {
  try {
    const { client, db } = await connectToDatabase();
    const collection = db.collection("films");
    const cleanSlug = decodeURIComponent(slug).trim();

    const film = await collection.findOne(
      { slug: cleanSlug },
      {
        projection: {
          services: 0,
          dbId: 0,
          createdAt: 0,
          updatedAt: 0,
          originalTitle: 0,
          views: 0,
        },
      }
    );
    if (!film) {
      return { success: false, error: "Film not found", film: null };
    }
    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }
    return { success: true, film: serializeDocument(film) };
  } catch (error) {
    return buildErrorResponse("film", error);
  }
});

export const getFilmCollection = cache(async (filmId) => {
  try {
    const { client, db } = await connectToDatabase(); // ← new
    const filmObjectId = toObjectId(filmId);

    const collection = await db.collection("filmcollections").findOne(
      { films: filmObjectId },
      {
        projection: {
          services: 0,
          dbId: 0,
          createdAt: 0,
          updatedAt: 0,
          originalTitle: 0,
          views: 0,
          __v: 0,
        },
      }
    );

    if (!collection) {
      return {
        success: false,
        message: "Film not in any collection",
        collection: null,
        films: [],
      };
    }

    // Add projection to films query
    const films = await db
      .collection("films")
      .find(
        { _id: { $in: collection.films } },
        {
          projection: {
            services: 0,
            dbId: 0,
            createdAt: 0,
            updatedAt: 0,
            originalTitle: 0,
            views: 0,
            __v: 0,
          },
        }
      )
      .sort({ releaseYear: 1 })
      .limit(100)
      .toArray();

    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }
    return {
      success: true,
      collection: serializeDocument(collection),
      films: films.map(serializeDocument),
    };
  } catch (error) {
    return buildErrorResponse("filmCollection", error);
  }
});

export const getRelatedFilms = cache(
  async (filmId, filmData = {}, limit = 12) => {
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || 12, 1),
      MAX_RELATED
    );
    try {
      const { client, db } = await connectToDatabase(); // ← new
      const collection = db().collection("films");
      const filmObjectId = toObjectId(filmId);
      const { genre = [], releaseYear, language } = filmData;

      const matchQuery = { _id: { $ne: filmObjectId } };
      const orConditions = [];
      if (genre.length > 0) orConditions.push({ genre: { $in: genre } });
      if (releaseYear) {
        orConditions.push({
          releaseYear: { $gte: releaseYear - 3, $lte: releaseYear + 3 },
        });
      }
      if (language) orConditions.push({ language });

      if (orConditions.length > 0) matchQuery.$or = orConditions;

      const pipeline = [
        { $match: matchQuery },
        {
          $addFields: {
            genreMatch: {
              $size: { $ifNull: [{ $setIntersection: ["$genre", genre] }, []] },
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
            languageMatch: { $cond: [{ $eq: ["$language", language] }, 1, 0] },
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

      // Close client in production (optional but safe)
      if (process.env.NODE_ENV !== "development") {
        await client.close();
      }
      return { success: true, films, count: films.length };
    } catch (error) {
      return buildErrorResponse("relatedFilms", error);
    }
  }
);
