"use server";
import connectToDatabase from "@/lib/mongodb";
import { cache } from "react";
import {
  buildMatchQuery,
  buildPaginationResponse,
  serializeDocument,
  buildContentAggregationPipeline,
  withErrorHandling,
} from "./db-utils";
import { validatePage } from "@/lib/validation";
import { ITEMS_PER_PAGE, MAX_RESPONSE_SIZE } from "@/lib/data";

const buildNewContentPipeline = (contentType, filters, page) => {
  const type = contentType === "films" ? "film" : "series";
  return buildContentAggregationPipeline(
    filters,
    { sort: { createdAt: -1, rating: -1 }, filter: { "category.isNew": true } },
    page,
    { type: { $literal: type } }
  );
};

export const getLatestAdded = cache(
  withErrorHandling(async (filters = {}, page = 1) => {
    const { db } = await connectToDatabase();
    const validPage = validatePage(page);
    const matchQuery = buildMatchQuery(filters);

    const cappedLimit = Math.min(ITEMS_PER_PAGE * 10, MAX_RESPONSE_SIZE);
    const [filmsData, seriesData] = await Promise.all([
      db
        .collection("films")
        .find(matchQuery)
        .project({ services: 0 })
        .sort({ createdAt: -1 })
        .limit(cappedLimit)
        .toArray(),
      db
        .collection("series")
        .find(matchQuery)
        .project({ services: 0 })
        .sort({ createdAt: -1 })
        .limit(cappedLimit)
        .toArray(),
    ]);

    const filmsMapped = filmsData.map((item) => ({
      ...serializeDocument(item),
      type: "film",
    }));
    const seriesMapped = seriesData.map((item) => ({
      ...serializeDocument(item),
      type: "series",
    }));

    const merged = [...filmsMapped, ...seriesMapped].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const totalItems = Math.min(merged.length, MAX_RESPONSE_SIZE);
    const documents = merged.slice(
      (validPage - 1) * ITEMS_PER_PAGE,
      validPage * ITEMS_PER_PAGE
    );
    return {
      success: true,
      ...buildPaginationResponse(
        {
          data: documents,
          metadata: [{ total: totalItems }],
        },
        validPage
      ),
    };
  }, "latestAdded")
);

export const getNewMovies = cache(
  withErrorHandling(async (filters = {}, page = 1) => {
    const { db } = await connectToDatabase();
    const pipeline = buildNewContentPipeline("films", filters, page);
    const [result] = await db.collection("films").aggregate(pipeline).toArray();
    return { success: true, ...buildPaginationResponse(result, page) };
  }, "films")
);

export const getNewSeries = cache(
  withErrorHandling(async (filters = {}, page = 1) => {
    const { db } = await connectToDatabase();
    const pipeline = buildNewContentPipeline("series", filters, page);
    const [result] = await db
      .collection("series")
      .aggregate(pipeline)
      .toArray();
    return { success: true, ...buildPaginationResponse(result, page) };
  }, "series")
);

export const getLatestEpisodes = cache(
  withErrorHandling(async (filters = {}, page = 1) => {
    const { db } = await connectToDatabase();
    const validPage = validatePage(page);
    const skip = (validPage - 1) * ITEMS_PER_PAGE;

    let seriesIds = null;
    if (Object.keys(filters).length > 0) {
      const seriesMatchQuery = buildMatchQuery(filters);
      const matchingSeries = await db
        .collection("series")
        .find(seriesMatchQuery, { projection: { _id: 1 } })
        .toArray();
      seriesIds = matchingSeries.map((s) => s._id);
      if (seriesIds.length === 0) {
        return {
          success: true,
          documents: [],
          pagination: {
            currentPage: validPage,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: ITEMS_PER_PAGE,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
    }

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
        $lookup: {
          from: "series",
          localField: "seriesId",
          foreignField: "_id",
          as: "series",
        },
      },
      { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: { $toString: "$_id" },
          slug: 1,
          seriesId: { $toString: "$seriesId" },
          seasonId: { $toString: "$seasonId" },
          episodeNumber: 1,
          duration: 1,
          mergedEpisodes: 1,
          createdAt: 1,
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
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: ITEMS_PER_PAGE }],
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
