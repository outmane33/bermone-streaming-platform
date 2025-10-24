// series.js - REFACTORED
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import {
  BASE_SORT_CONFIGS,
  buildContentAggregationPipeline,
  buildPaginationResponse,
  buildErrorResponse,
  toObjectId,
  serializeDocument,
  ITEMS_PER_PAGE,
} from "./db-utils";

// 🚀 Get Series with filters and sorting
export const getSeries = cache(
  async (filters = {}, sortId = "all", page = 1) => {
    try {
      const client = await clientPromise;
      const collection = client.db().collection("series");

      const sortConfig = BASE_SORT_CONFIGS[sortId] || BASE_SORT_CONFIGS.all;

      const pipeline = buildContentAggregationPipeline(
        filters,
        sortConfig,
        page
      );
      const [result] = await collection.aggregate(pipeline).toArray();

      return {
        success: true,
        ...buildPaginationResponse(result, page),
      };
    } catch (error) {
      console.error("❌ Error fetching series:", error);
      return buildErrorResponse("series", error, page);
    }
  }
);

// 🚀 Get single series by slug
export const getSerieBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("series");

    const decodedSlug = decodeURIComponent(slug);
    const serie = await collection.findOne({ slug: decodedSlug });

    if (!serie) {
      return {
        success: false,
        error: "Serie not found",
        serie: null,
      };
    }

    return {
      success: true,
      serie: serializeDocument(serie),
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

    const seriesObjectId = toObjectId(seriesId);

    const seasons = await collection
      .find({ seriesId: seriesObjectId })
      .sort({ seasonNumber: 1 })
      .toArray();

    if (!seasons || seasons.length === 0) {
      return {
        success: false,
        message: "No seasons found for this series",
        seasons: [],
      };
    }

    return {
      success: true,
      seasons: seasons.map((season) => ({
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
      })),
      count: seasons.length,
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

// 🚀 Get single season by slug
export const getSeasonBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const decodedSlug = decodeURIComponent(slug);

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

    const seasonObjectId = toObjectId(seasonId);

    const episodes = await collection
      .find({ seasonId: seasonObjectId })
      .sort({ episodeNumber: 1 })
      .toArray();

    if (!episodes || episodes.length === 0) {
      return {
        success: false,
        message: "No episodes found for this season",
        episodes: [],
      };
    }

    return {
      success: true,
      episodes: episodes.map((episode) => ({
        _id: episode._id.toString(),
        seriesId: episode.seriesId.toString(),
        seasonId: episode.seasonId.toString(),
        episodeNumber: episode.episodeNumber,
        duration: episode.duration,
        slug: episode.slug,
        createdAt: episode.createdAt?.toISOString(),
        updatedAt: episode.updatedAt?.toISOString(),
      })),
      count: episodes.length,
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

// 🚀 Get single episode by slug
export const getEpisodeBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();

    const decodedSlug = decodeURIComponent(slug);

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

// 🎯 Get All Episodes (with pagination)
export const getEpisodes = cache(async (page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("episodes");

    const skip = (page - 1) * ITEMS_PER_PAGE;

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
    console.error("❌ Error fetching episodes:", error);
    return buildErrorResponse("episodes", error, page);
  }
});
