"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import { ObjectId } from "mongodb";

// 🎯 Constants
const ITEMS_PER_PAGE = 18;
const CURRENT_YEAR = new Date().getFullYear();

// 🎯 Sort configurations avec leur logique de filtrage
const SORT_CONFIGS = {
  new: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isNew": true },
  },
  old: {
    sort: { releaseYear: -1, rating: -1 },
    filter: (hasYearFilter) =>
      hasYearFilter ? {} : { releaseYear: { $lte: CURRENT_YEAR - 1 } },
  },
  popular: {
    sort: { rating: -1, views: -1 },
    filter: { "category.isPopular": true },
  },
  best: {
    sort: { rating: -1, imdbRating: -1 },
    filter: { "category.isTop": true },
  },
  rating: {
    sort: { rating: -1 },
    filter: {},
  },
  year: {
    sort: { releaseYear: -1, rating: -1 },
    filter: {},
  },
};

// 🎯 Build MongoDB aggregation query
function buildAggregationPipeline(filters, sortId, page) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const sortConfig = sortId
    ? SORT_CONFIGS[sortId] || SORT_CONFIGS.new
    : {
        sort: { createdAt: -1 }, // Default sort when no filter selected
        filter: {},
      };

  // Base match query
  const matchQuery = {};

  // Apply sort-specific filters
  const sortFilter =
    typeof sortConfig.filter === "function"
      ? sortConfig.filter(filters.year?.length > 0)
      : sortConfig.filter;

  Object.assign(matchQuery, sortFilter);

  // Apply user filters
  if (filters.genre?.length > 0) {
    matchQuery.genre = { $in: filters.genre };
  }

  if (filters.quality?.length > 0) {
    matchQuery.quality = { $in: filters.quality };
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

  // Aggregation pipeline avec facet pour éviter 2 queries
  return [
    { $match: matchQuery },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: sortConfig.sort },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          {
            $project: {
              _id: { $toString: "$_id" },
              title: 1,
              genre: 1,
              rating: 1,
              releaseYear: 1,
              quality: 1,
              language: 1,
              country: 1,
              image: 1,
              slug: 1,
              category: 1,
              duration: 1,
              views: 1,
            },
          },
        ],
      },
    },
  ];
}

// 🚀 Main action avec React cache
export const getFilms = cache(async (filters = {}, sortId = null, page = 1) => {
  // Changed default from "new" to null
  try {
    const client = await clientPromise;
    const collection = client.db().collection("films");

    const pipeline = buildAggregationPipeline(filters, sortId, page);
    const [result] = await collection.aggregate(pipeline).toArray();

    const totalFilms = result.metadata[0]?.total || 0;
    const documents = result.data || [];

    return {
      success: true,
      documents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFilms / ITEMS_PER_PAGE),
        totalItems: totalFilms,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: page < Math.ceil(totalFilms / ITEMS_PER_PAGE),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching documents:", error);

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

// 🚀 Get single film by slug with React cache
// Add this function to your films.js file

// 🚀 Get single film by slug with React cache
export const getFilmBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("films");

    // Decode the URL-encoded slug
    const decodedSlug = decodeURIComponent(slug);

    const film = await collection.findOne({ slug: decodedSlug });

    if (!film) {
      return {
        success: false,
        error: "Film not found",
        film: null,
      };
    }

    // Convert _id to string
    film._id = film._id.toString();

    return {
      success: true,
      film,
    };
  } catch (error) {
    console.error("❌ Error fetching film by slug:", error);

    return {
      success: false,
      error: error.message,
      film: null,
    };
  }
});

// 🎯 Get film collection by film ID
// 🎯 Get film collection by film ID
export const getFilmCollection = cache(async (filmId) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Convert filmId to ObjectId if it's a string
    const filmObjectId =
      typeof filmId === "string" ? new ObjectId(filmId) : filmId;

    // Find collection containing this film
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

    // Get all films in this collection
    const films = await db
      .collection("films")
      .find({
        _id: { $in: collection.films },
      })
      .sort({ releaseYear: 1 }) // Sort by release year ascending
      .toArray();

    // Convert _id to string for each film
    const serializedFilms = films.map((film) => ({
      ...film,
      _id: film._id.toString(),
    }));

    return {
      success: true,
      collection: {
        _id: collection._id.toString(),
        name: collection.name,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      films: serializedFilms,
    };
  } catch (error) {
    console.error("❌ Error fetching film collection:", error);
    return {
      success: false,
      error: error.message,
      collection: null,
      films: [],
    };
  }
});

// 🎯 Get related films based on similarity
export const getRelatedFilms = cache(
  async (filmId, filmData = {}, limit = 12) => {
    try {
      const client = await clientPromise;
      const collection = client.db().collection("films");

      // Convert filmId to ObjectId if it's a string
      const filmObjectId =
        typeof filmId === "string" ? new ObjectId(filmId) : filmId;

      const { genre = [], releaseYear, language } = filmData;

      // Build match query for similar films
      const matchQuery = {
        _id: { $ne: filmObjectId }, // Exclude current film
      };

      // Add filters based on available data
      const orConditions = [];

      if (genre.length > 0) {
        orConditions.push({ genre: { $in: genre } });
      }

      if (releaseYear) {
        // Find films within 3 years range
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

      // If we have conditions, add them to match query
      if (orConditions.length > 0) {
        matchQuery.$or = orConditions;
      }

      // Aggregation pipeline with scoring for better matches
      const pipeline = [
        { $match: matchQuery },
        {
          $addFields: {
            // Calculate similarity score
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
                { $multiply: ["$genreMatch", 3] }, // Genre is most important
                "$yearMatch",
                "$languageMatch",
              ],
            },
          },
        },
        { $sort: { similarityScore: -1, rating: -1, views: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: { $toString: "$_id" },
            title: 1,
            genre: 1,
            rating: 1,
            releaseYear: 1,
            quality: 1,
            language: 1,
            country: 1,
            image: 1,
            slug: 1,
            category: 1,
            duration: 1,
            views: 1,
            similarityScore: 1,
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
        error: error.message,
        films: [],
      };
    }
  }
);
