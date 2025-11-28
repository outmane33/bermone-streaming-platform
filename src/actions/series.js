"use server";
import connectToDatabase from "@/lib/mongodb";
import { cache } from "react";
import {
  BASE_SORT_CONFIGS,
  buildContentAggregationPipeline,
  buildPaginationResponse,
  toObjectId,
  serializeDocument,
  PUBLIC_CONTENT_PROJECTION,
  withErrorHandling,
} from "./db-utils";
import { validatePage } from "@/lib/validation";
import { MAX_EPISODES, MAX_SEASONS, ITEMS_PER_PAGE } from "@/lib/data";
import { cleanSlug } from "@/lib/pageUtils";

export const getSeries = cache(
  withErrorHandling(async (filters = {}, sortId = "all", page = 1) => {
    const { db } = await connectToDatabase();
    const sortConfig = BASE_SORT_CONFIGS[sortId] || BASE_SORT_CONFIGS.all;
    const pipeline = buildContentAggregationPipeline(filters, sortConfig, page);
    const [result] = await db
      .collection("series")
      .aggregate(pipeline)
      .toArray();
    return { success: true, ...buildPaginationResponse(result, page) };
  }, "series")
);

export const getSerieBySlug = cache(
  withErrorHandling(async (slug) => {
    const { db } = await connectToDatabase();
    const doc = await db
      .collection("series")
      .findOne({ slug: cleanSlug(slug) });
    if (!doc) return { success: false, error: "Serie not found", serie: null };
    return { success: true, serie: serializeDocument(doc) };
  }, "serie")
);

export const getSeasonsBySeries = cache(
  withErrorHandling(async (seriesId) => {
    const { db } = await connectToDatabase();
    const seasons = await db
      .collection("seasons")
      .find({ seriesId: toObjectId(seriesId) })
      .sort({ seasonNumber: 1 })
      .limit(MAX_SEASONS)
      .project(PUBLIC_CONTENT_PROJECTION)
      .toArray();

    if (!seasons.length) {
      return { success: false, message: "No seasons found", seasons: [] };
    }

    return {
      success: true,
      seasons: seasons.map(serializeDocument),
      count: seasons.length,
    };
  }, "seasons")
);

export const getSeasonBySlug = cache(
  withErrorHandling(async (slug) => {
    const { db } = await connectToDatabase();
    const season = await db
      .collection("seasons")
      .findOne({ slug: cleanSlug(slug) });

    if (!season) {
      return {
        success: false,
        error: "Season not found",
        season: null,
        series: null,
      };
    }

    const series = await db
      .collection("series")
      .findOne({ _id: season.seriesId });
    return {
      success: true,
      season: serializeDocument(season),
      series: series ? serializeDocument(series) : null,
    };
  }, "season")
);

export const getEpisodesBySeason = cache(
  withErrorHandling(async (seasonId) => {
    const { db } = await connectToDatabase();
    const episodes = await db
      .collection("episodes")
      .find(
        { seasonId: toObjectId(seasonId) },
        { projection: PUBLIC_CONTENT_PROJECTION }
      )
      .sort({ episodeNumber: 1 })
      .limit(MAX_EPISODES)
      .toArray();

    if (!episodes.length) {
      return { success: false, message: "No episodes found", episodes: [] };
    }

    return {
      success: true,
      episodes: episodes.map(serializeDocument),
      count: episodes.length,
    };
  }, "episodes")
);

export const getEpisodeBySlug = cache(
  withErrorHandling(async (slug) => {
    const { db } = await connectToDatabase();
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

    if (!result.length) {
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
      episode: serializeDocument(data),
      season: serializeDocument(data.season),
      series: serializeDocument(data.series),
    };
  }, "episode")
);

export const getEpisodes = cache(
  withErrorHandling(async (page = 1) => {
    const { db } = await connectToDatabase();
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
                mergedEpisodes: 1,
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
    const [result] = await db
      .collection("episodes")
      .aggregate(pipeline)
      .toArray();
    return { success: true, ...buildPaginationResponse(result, validPage) };
  }, "episodes")
);
