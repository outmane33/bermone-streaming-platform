// home.js - REFACTORED
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import {
  buildMatchQuery,
  buildPaginationResponse,
  buildErrorResponse,
  serializeDocument,
  ITEMS_PER_PAGE,
} from "./db-utils";

// 🚀 Get latest added (films + series combined)
export const getLatestAdded = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const skip = (page - 1) * ITEMS_PER_PAGE;
    const matchQuery = buildMatchQuery(filters);

    // Get total count with filters
    const totalCount = await Promise.all([
      db.collection("films").countDocuments(matchQuery),
      db.collection("series").countDocuments(matchQuery),
    ]);

    const totalItems = totalCount[0] + totalCount[1];

    // Calculate how many items we need to fetch
    const itemsToFetch = skip + ITEMS_PER_PAGE * 2;

    // Fetch from both collections with filters
    const [filmsData, seriesData] = await Promise.all([
      db
        .collection("films")
        .find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(itemsToFetch)
        .toArray(),
      db
        .collection("series")
        .find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(itemsToFetch)
        .toArray(),
    ]);

    // Merge and sort by createdAt
    const merged = [
      ...filmsData.map((item) => ({
        ...serializeDocument(item),
        type: "film",
      })),
      ...seriesData.map((item) => ({
        ...serializeDocument(item),
        type: "series",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + ITEMS_PER_PAGE);

    return {
      success: true,
      documents: merged,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: page < Math.ceil(totalItems / ITEMS_PER_PAGE),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching latest added:", error);
    return buildErrorResponse("mixed", error, page);
  }
});

// 🚀 Get new series (by category)
export const getNewSeries = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("series");

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Combine category filter with user filters
    const matchQuery = buildMatchQuery(filters, {
      "category.isNew": true,
    });

    const pipeline = [
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1, rating: -1 } },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
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
                type: { $literal: "series" },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    return {
      success: true,
      ...buildPaginationResponse(result, page),
    };
  } catch (error) {
    console.error("❌ Error fetching new series:", error);
    return buildErrorResponse("series", error, page);
  }
});

// 🚀 Get new movies (by category)
export const getNewMovies = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("films");

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Combine category filter with user filters
    const matchQuery = buildMatchQuery(filters, {
      "category.isNew": true,
    });

    const pipeline = [
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1, rating: -1 } },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
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
                type: { $literal: "film" },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    return {
      success: true,
      ...buildPaginationResponse(result, page),
    };
  } catch (error) {
    console.error("❌ Error fetching new movies:", error);
    return buildErrorResponse("films", error, page);
  }
});

// 🚀 Get latest episodes
export const getLatestEpisodes = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // For episodes, we need to filter by series properties
    let seriesIds = null;

    if (Object.keys(filters).length > 0) {
      const seriesMatchQuery = buildMatchQuery(filters);
      const matchingSeries = await db
        .collection("series")
        .find(seriesMatchQuery, { projection: { _id: 1 } })
        .toArray();

      seriesIds = matchingSeries.map((s) => s._id);

      // If no matching series found, return empty result
      if (seriesIds.length === 0) {
        return {
          success: true,
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
    }

    const collection = db.collection("episodes");

    // Build episode match query
    const episodeMatch = seriesIds ? { seriesId: { $in: seriesIds } } : {};

    const pipeline = [
      { $match: episodeMatch },
      // Lookup season data
      {
        $lookup: {
          from: "seasons",
          localField: "seasonId",
          foreignField: "_id",
          as: "season",
        },
      },
      { $unwind: { path: "$season", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "series",
          localField: "seriesId",
          foreignField: "_id",
          as: "series",
        },
      },
      { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: ITEMS_PER_PAGE },
            {
              $project: {
                _id: { $toString: "$_id" },
                slug: 1,
                seriesId: { $toString: "$seriesId" },
                seasonId: { $toString: "$seasonId" },
                episodeNumber: 1,
                duration: 1,
                createdAt: 1,
                updatedAt: 1,
                season: {
                  _id: { $toString: "$season._id" },
                  seasonNumber: "$season.seasonNumber",
                  image: "$season.image",
                  title: "$season.title",
                },
                series: {
                  _id: { $toString: "$series._id" },
                  title: "$series.title",
                },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    return {
      success: true,
      ...buildPaginationResponse(result, page),
    };
  } catch (error) {
    console.error("❌ Error fetching latest episodes:", error);
    return buildErrorResponse("episodes", error, page);
  }
});
