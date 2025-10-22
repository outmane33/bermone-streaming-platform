"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";

// 🎯 Constants
const ITEMS_PER_PAGE = 18;
const CURRENT_YEAR = new Date().getFullYear();

// 🎯 Sort configurations avec leur logique de filtrage
const SORT_CONFIGS = {
  all: {
    sort: { _id: -1 }, // ترتيب افتراضي بسيط
    filter: {},
  },
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
  const sortConfig = SORT_CONFIGS[sortId] || SORT_CONFIGS.all;

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
export const getSeries = cache(
  async (filters = {}, sortId = "all", page = 1) => {
    try {
      const client = await clientPromise;
      const collection = client.db().collection("series");

      const pipeline = buildAggregationPipeline(filters, sortId, page);
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
      console.error("❌ Error fetching films:", error);

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
  }
);

// 🎯 Get All Episodes - FIXED VERSION
export const getEpisodes = cache(async (page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("episodes");

    const skip = (page - 1) * ITEMS_PER_PAGE;

    // Aggregation pipeline with season population
    const pipeline = [
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
                seriesId: { $toString: "$seriesId" },
                seasonId: { $toString: "$seasonId" },
                episodeNumber: 1,
                duration: 1,
                // Convert all ObjectIds in services array
                services: {
                  $map: {
                    input: "$services",
                    as: "service",
                    in: {
                      quality: "$$service.quality",
                      iframe: "$$service.iframe",
                      downloadLink: "$$service.downloadLink",
                      _id: { $toString: "$$service._id" }, // Convert service._id
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

// 🚀 Get single serie by slug with React cache
export const getSerieBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("series");

    // Decode the URL-encoded slug
    const decodedSlug = decodeURIComponent(slug);

    const serie = await collection.findOne({ slug: decodedSlug });

    if (!serie) {
      return {
        success: false,
        error: "Serie not found",
        serie: null,
      };
    }

    // Convert _id to string
    serie._id = serie._id.toString();

    return {
      success: true,
      serie,
    };
  } catch (error) {
    console.error("❌ Error fetching serie by slug:", error);

    return {
      success: false,
      error: error.message,
      serie: null,
    };
  }
});

// 🎯 Get seasons by series ID
export const getSeasonsBySeries = cache(async (seriesId) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("seasons");

    // Convert seriesId to ObjectId if it's a string
    const ObjectId = require("mongodb").ObjectId;
    const seriesObjectId =
      typeof seriesId === "string" ? new ObjectId(seriesId) : seriesId;

    // Find all seasons for this series
    const seasons = await collection
      .find({ seriesId: seriesObjectId })
      .sort({ seasonNumber: 1 }) // Sort by season number ascending
      .toArray();

    if (!seasons || seasons.length === 0) {
      return {
        success: false,
        message: "No seasons found for this series",
        seasons: [],
      };
    }

    // Serialize seasons (convert ObjectIds to strings)
    const serializedSeasons = seasons.map((season) => ({
      _id: season._id.toString(),
      seriesId: season.seriesId.toString(),
      seasonNumber: season.seasonNumber,
      releaseYear: season.releaseYear,
      rating: season.rating,
      image: season.image,
      status: season.status,
      slug: season.slug,
      createdAt: season.createdAt?.toISOString(),
      updatedAt: season.updatedAt?.toISOString(),
    }));

    return {
      success: true,
      seasons: serializedSeasons,
      count: serializedSeasons.length,
    };
  } catch (error) {
    console.error("❌ Error fetching seasons by series:", error);
    return {
      success: false,
      error: error.message,
      seasons: [],
    };
  }
});

// 🚀 Get single season by slug with React cache
export const getSeasonBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Decode the URL-encoded slug
    const decodedSlug = decodeURIComponent(slug);

    // Find the season
    const season = await db
      .collection("seasons")
      .findOne({ slug: decodedSlug });

    if (!season) {
      return {
        success: false,
        error: "Season not found",
        season: null,
        series: null,
      };
    }

    // Get the series information
    const series = await db.collection("series").findOne({
      _id: season.seriesId,
    });

    return {
      success: true,
      season: {
        _id: season._id.toString(),
        seriesId: season.seriesId.toString(),
        seasonNumber: season.seasonNumber,
        releaseYear: season.releaseYear,
        rating: season.rating,
        image: season.image,
        status: season.status,
        slug: season.slug,
        createdAt: season.createdAt?.toISOString(),
        updatedAt: season.updatedAt?.toISOString(),
      },
      series: series
        ? {
            _id: series._id.toString(),
            title: series.title,
            originalTitle: series.originalTitle,
            description: series.description,
            genre: series.genre,
            releaseYear: series.releaseYear,
            slug: series.slug,
          }
        : null,
    };
  } catch (error) {
    console.error("❌ Error fetching season by slug:", error);

    return {
      success: false,
      error: error.message,
      season: null,
      series: null,
    };
  }
});

// 🎯 Get episodes by season ID
export const getEpisodesBySeason = cache(async (seasonId) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("episodes");

    // Convert seasonId to ObjectId if it's a string
    const ObjectId = require("mongodb").ObjectId;
    const seasonObjectId =
      typeof seasonId === "string" ? new ObjectId(seasonId) : seasonId;

    // Find all episodes for this season
    const episodes = await collection
      .find({ seasonId: seasonObjectId })
      .sort({ episodeNumber: 1 }) // Sort by episode number ascending
      .toArray();

    if (!episodes || episodes.length === 0) {
      return {
        success: false,
        message: "No episodes found for this season",
        episodes: [],
      };
    }

    // Serialize episodes (convert ObjectIds to strings)
    const serializedEpisodes = episodes.map((episode) => ({
      _id: episode._id.toString(),
      seriesId: episode.seriesId.toString(),
      seasonId: episode.seasonId.toString(),
      episodeNumber: episode.episodeNumber,
      duration: episode.duration,
      slug: episode.slug,
      services:
        episode.services?.map((service) => ({
          quality: service.quality,
          iframe: service.iframe,
          downloadLink: service.downloadLink,
          _id: service._id?.toString(),
        })) || [],
      createdAt: episode.createdAt?.toISOString(),
      updatedAt: episode.updatedAt?.toISOString(),
    }));

    return {
      success: true,
      episodes: serializedEpisodes,
      count: serializedEpisodes.length,
    };
  } catch (error) {
    console.error("❌ Error fetching episodes by season:", error);
    return {
      success: false,
      error: error.message,
      episodes: [],
    };
  }
});

// 🚀 Get single episode by slug with React cache
export const getEpisodeBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Decode the URL-encoded slug
    const decodedSlug = decodeURIComponent(slug);

    // Find the episode with aggregation to get related data
    const pipeline = [
      { $match: { slug: decodedSlug } },
      {
        $lookup: {
          from: "seasons",
          localField: "seasonId",
          foreignField: "_id",
          as: "season",
        },
      },
      { $unwind: "$season" },
      {
        $lookup: {
          from: "series",
          localField: "seriesId",
          foreignField: "_id",
          as: "series",
        },
      },
      { $unwind: "$series" },
    ];

    const result = await db
      .collection("episodes")
      .aggregate(pipeline)
      .toArray();

    if (!result || result.length === 0) {
      return {
        success: false,
        error: "Episode not found",
        episode: null,
        season: null,
        series: null,
      };
    }

    const data = result[0];

    return {
      success: true,
      episode: {
        _id: data._id.toString(),
        seriesId: data.seriesId.toString(),
        seasonId: data.seasonId.toString(),
        episodeNumber: data.episodeNumber,
        duration: data.duration,
        slug: data.slug,
        services:
          data.services?.map((service) => ({
            quality: service.quality,
            iframe: service.iframe,
            downloadLink: service.downloadLink,
            _id: service._id?.toString(),
          })) || [],
        createdAt: data.createdAt?.toISOString(),
        updatedAt: data.updatedAt?.toISOString(),
      },
      season: {
        _id: data.season._id.toString(),
        seasonNumber: data.season.seasonNumber,
        releaseYear: data.season.releaseYear,
        rating: data.season.rating,
        image: data.season.image,
        status: data.season.status,
        slug: data.season.slug,
      },
      series: {
        _id: data.series._id.toString(),
        title: data.series.title,
        originalTitle: data.series.originalTitle,
        description: data.series.description,
        genre: data.series.genre,
        releaseYear: data.series.releaseYear,
        slug: data.series.slug,
        rating: data.series.rating,
        country: data.series.country,
        language: data.series.language,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching episode by slug:", error);

    return {
      success: false,
      error: error.message,
      episode: null,
      season: null,
      series: null,
    };
  }
});
