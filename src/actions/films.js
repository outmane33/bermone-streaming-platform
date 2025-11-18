"use server";
import connectToDatabase from "@/lib/mongodb";
import { cache } from "react";
import {
  buildContentAggregationPipeline,
  buildPaginationResponse,
  serializeDocument,
  PUBLIC_CONTENT_PROJECTION,
  BASE_SORT_CONFIGS,
  withErrorHandling,
  toObjectId,
} from "./db-utils";
import { MAX_RELATED } from "@/lib/data";

export const getFilms = cache(
  withErrorHandling(async (filters = {}, sortId = null, page = 1) => {
    const { db } = await connectToDatabase();
    const sortConfig = BASE_SORT_CONFIGS[sortId] || {
      sort: { createdAt: -1 },
      filter: {},
    };
    const pipeline = buildContentAggregationPipeline(filters, sortConfig, page);
    const [result] = await db.collection("films").aggregate(pipeline).toArray();
    return { success: true, ...buildPaginationResponse(result, page) };
  }, "films")
);

export const getFilmBySlug = cache(
  withErrorHandling(async (slug) => {
    const { db } = await connectToDatabase();
    const cleanSlug = decodeURIComponent(slug).trim();

    const film = await db.collection("films").findOne(
      { slug: cleanSlug },
      {
        projection: {
          services: 0,
        },
      }
    );

    if (!film) throw new Error("Film not found");
    return { success: true, film: serializeDocument(film) };
  }, "film")
);
export const getFilmCollection = cache(
  withErrorHandling(async (filmId) => {
    const { db } = await connectToDatabase();
    const filmObjectId = toObjectId(filmId);
    const collection = await db
      .collection("filmcollections")
      .findOne(
        { films: filmObjectId },
        { projection: PUBLIC_CONTENT_PROJECTION }
      );
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
      .find(
        { _id: { $in: collection.films } },
        { projection: PUBLIC_CONTENT_PROJECTION }
      )
      .sort({ releaseYear: 1 })
      .limit(100)
      .toArray();
    return {
      success: true,
      collection: serializeDocument(collection),
      films: films.map(serializeDocument),
    };
  }, "filmCollection")
);

export const getRelatedFilms = cache(
  withErrorHandling(async (filmId, filmData = {}, limit = 12) => {
    const safeLimit = Math.min(
      Math.max(parseInt(limit, 10) || 12, 1),
      MAX_RELATED
    );
    const { db } = await connectToDatabase();
    const filmObjectId = toObjectId(filmId);
    const { genre = [], releaseYear, language } = filmData;

    const matchQuery = { _id: { $ne: filmObjectId } };
    const orConditions = [];
    if (genre.length > 0) orConditions.push({ genre: { $in: genre } });
    if (releaseYear)
      orConditions.push({
        releaseYear: { $gte: releaseYear - 3, $lte: releaseYear + 3 },
      });
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
      { $project: PUBLIC_CONTENT_PROJECTION },
    ];

    const films = await db.collection("films").aggregate(pipeline).toArray();
    return {
      success: true,
      films: films.map(serializeDocument),
      count: films.length,
    };
  }, "relatedFilms")
);
