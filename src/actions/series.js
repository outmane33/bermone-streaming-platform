// series.js
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
} from "./db-utils";
import { validatePage } from "@/lib/validation";
import { MAX_EPISODES, MAX_SEASONS, ITEMS_PER_PAGE } from "@/lib/data";
import { cleanSlug } from "@/lib/pageUtils";

// Reusable serializer for seasons/episodes
const serializeSeason = (season) => ({
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
});

const serializeEpisode = (episode) => ({
  _id: episode._id.toString(),
  seriesId: episode.seriesId.toString(),
  seasonId: episode.seasonId.toString(),
  episodeNumber: episode.episodeNumber,
  duration: episode.duration,
  slug: episode.slug,
  createdAt: episode.createdAt?.toISOString(),
  updatedAt: episode.updatedAt?.toISOString(),
});

export const getSeries = cache(
  async (filters = {}, sortId = "all", page = 1) => {
    try {
      const client = await clientPromise;
      const sortConfig = BASE_SORT_CONFIGS[sortId] || BASE_SORT_CONFIGS.all;
      const pipeline = buildContentAggregationPipeline(
        filters,
        sortConfig,
        page
      );
      const [result] = await client
        .db()
        .collection("series")
        .aggregate(pipeline)
        .toArray();
      return { success: true, ...buildPaginationResponse(result, page) };
    } catch (error) {
      return buildErrorResponse("series", error, page);
    }
  }
);

export const getSerieBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const doc = await client
      .db()
      .collection("series")
      .findOne({ slug: cleanSlug(slug) });
    if (!doc) return { success: false, error: "Serie not found", serie: null };
    return { success: true, serie: serializeDocument(doc) };
  } catch (error) {
    return buildErrorResponse("serie", error);
  }
});

export const getSeasonsBySeries = cache(async (seriesId) => {
  try {
    const client = await clientPromise;
    const seasons = await client
      .db()
      .collection("seasons")
      .find({ seriesId: toObjectId(seriesId) })
      .sort({ seasonNumber: 1 })
      .limit(MAX_SEASONS)
      .toArray();

    if (!seasons.length)
      return { success: false, message: "No seasons found", seasons: [] };

    return {
      success: true,
      seasons: seasons.map(serializeSeason),
      count: seasons.length,
    };
  } catch (error) {
    return buildErrorResponse("seasons", error);
  }
});

export const getSeasonBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const season = await db
      .collection("seasons")
      .findOne({ slug: cleanSlug(slug) });
    if (!season)
      return {
        success: false,
        error: "Season not found",
        season: null,
        series: null,
      };

    const series = await db
      .collection("series")
      .findOne({ _id: season.seriesId });
    return {
      success: true,
      season: serializeSeason(season),
      series: series ? serializeDocument(series) : null,
    };
  } catch (error) {
    return buildErrorResponse("season", error);
  }
});

export const getEpisodesBySeason = cache(async (seasonId) => {
  try {
    const client = await clientPromise;
    const episodes = await client
      .db()
      .collection("episodes")
      .find({ seasonId: toObjectId(seasonId) })
      .sort({ episodeNumber: 1 })
      .limit(MAX_EPISODES)
      .toArray();

    if (!episodes.length)
      return { success: false, message: "No episodes found", episodes: [] };

    return {
      success: true,
      episodes: episodes.map(serializeEpisode),
      count: episodes.length,
    };
  } catch (error) {
    return buildErrorResponse("episodes", error);
  }
});

export const getEpisodeBySlug = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const pipeline = [
      { $match: { slug: cleanSlug(slug) } },
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
    if (!result.length)
      return {
        success: false,
        error: "Episode not found",
        episode: null,
        season: null,
        series: null,
      };

    const data = result[0];
    return {
      success: true,
      episode: serializeEpisode(data),
      season: serializeSeason(data.season),
      series: serializeDocument(data.series),
    };
  } catch (error) {
    return buildErrorResponse("episode", error);
  }
});

export const getEpisodes = cache(async (page = 1) => {
  try {
    const client = await clientPromise;
    const validPage = validatePage(page);
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
            { $skip: (validPage - 1) * ITEMS_PER_PAGE },
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
    const [result] = await client
      .db()
      .collection("episodes")
      .aggregate(pipeline)
      .toArray();
    return { success: true, ...buildPaginationResponse(result, validPage) };
  } catch (error) {
    return buildErrorResponse("episodes", error, page);
  }
});
