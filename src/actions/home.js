"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";

// 🎯 Constants
const ITEMS_PER_PAGE = 18;

// 🎯 Build match query based on filters
function buildMatchQuery(filters = {}) {
  const matchQuery = {};

  if (filters.genre?.length > 0) {
    matchQuery.genre = { $in: filters.genre };
  }

  if (filters.year?.length > 0) {
    matchQuery.releaseYear = { $in: filters.year.map((y) => parseInt(y, 10)) };
  }

  if (filters.language?.length > 0) {
    matchQuery.language = { $in: filters.language };
  }

  if (filters.country?.length > 0) {
    matchQuery.country = { $in: filters.country };
  }

  return matchQuery;
}

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

    // Calculate how many items we need to fetch to ensure we have enough for this page
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

    // Helper function to convert all ObjectIds to strings
    const convertObjectIds = (item) => ({
      ...item,
      _id: item._id.toString(),
      services: item.services?.map((service) => ({
        ...service,
        _id: service._id?.toString(),
        qualities: service.qualities?.map((quality) =>
          typeof quality === "object" && quality._id
            ? { ...quality, _id: quality._id.toString() }
            : quality
        ),
      })),
    });

    // Merge and sort by createdAt
    const merged = [
      ...filmsData.map((item) => ({
        ...convertObjectIds(item),
        type: "film",
      })),
      ...seriesData.map((item) => ({
        ...convertObjectIds(item),
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

    return {
      success: false,
      error: error.message,
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

// 🚀 Get new series (by category)
export const getNewSeries = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("series");

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Combine category filter with user filters
    const matchQuery = {
      "category.isNew": true,
      ...buildMatchQuery(filters),
    };

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
                views: 1,
                services: 1,
                type: { $literal: "series" },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    const totalSeries = result.metadata[0]?.total || 0;
    const documents = result.data || [];

    return {
      success: true,
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSeries / ITEMS_PER_PAGE),
        totalItems: totalSeries,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: page < Math.ceil(totalSeries / ITEMS_PER_PAGE),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching new series:", error);

    return {
      success: false,
      error: error.message,
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

// 🚀 Get new movies (by category)
export const getNewMovies = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("films");

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Combine category filter with user filters
    const matchQuery = {
      "category.isNew": true,
      ...buildMatchQuery(filters),
    };

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
                views: 1,
                services: 1,
                type: { $literal: "film" },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    const totalMovies = result.metadata[0]?.total || 0;
    const documents = result.data || [];

    return {
      success: true,
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMovies / ITEMS_PER_PAGE),
        totalItems: totalMovies,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: page < Math.ceil(totalMovies / ITEMS_PER_PAGE),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching new movies:", error);

    return {
      success: false,
      error: error.message,
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

// 🚀 Get latest episodes
export const getLatestEpisodes = cache(async (filters = {}, page = 1) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // For episodes, we need to filter by series properties
    // First, get matching series IDs if filters are applied
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
                services: {
                  $map: {
                    input: "$services",
                    as: "service",
                    in: {
                      serviceName: "$$service.serviceName",
                      qualities: "$$service.qualities",
                      _id: { $toString: "$$service._id" },
                    },
                  },
                },
                createdAt: 1,
                updatedAt: 1,
                season: {
                  _id: { $toString: "$season._id" },
                  seasonNumber: "$season.seasonNumber",
                  image: "$season.image",
                  title: "$season.title",
                },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    const totalEpisodes = result.metadata[0]?.total || 0;
    const documents = result.data || [];

    return {
      success: true,
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEpisodes / ITEMS_PER_PAGE),
        totalItems: totalEpisodes,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: page < Math.ceil(totalEpisodes / ITEMS_PER_PAGE),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching latest episodes:", error);

    return {
      success: false,
      error: error.message,
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
