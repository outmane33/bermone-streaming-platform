"use server";
import connectToDatabase from "@/lib/mongodb"; // ← updated import
import { cache } from "react";
import {
  buildMatchQuery,
  buildPaginationResponse,
  buildErrorResponse,
  serializeDocument,
  buildContentAggregationPipeline,
} from "./db-utils";
import { validatePage } from "@/lib/validation";
import { ITEMS_PER_PAGE } from "@/lib/data";

export const getLatestAdded = cache(async (filters = {}, page = 1) => {
  try {
    const { client, db } = await connectToDatabase(); // ← new
    const validPage = validatePage(page);
    const skip = (validPage - 1) * ITEMS_PER_PAGE;
    const matchQuery = buildMatchQuery(filters);

    const totalCount = await Promise.all([
      db.collection("films").countDocuments(matchQuery),
      db.collection("series").countDocuments(matchQuery),
    ]);
    const totalItems = totalCount[0] + totalCount[1];

    const itemsToFetch = skip + ITEMS_PER_PAGE * 2;
    const [filmsData, seriesData] = await Promise.all([
      db
        .collection("films")
        .find(matchQuery, { projection: { services: 0 } })
        .sort({ createdAt: -1 })
        .limit(itemsToFetch)
        .toArray(),
      db
        .collection("series")
        .find(matchQuery, { projection: { services: 0 } })
        .sort({ createdAt: -1 })
        .limit(itemsToFetch)
        .toArray(),
    ]);

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

    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }

    return {
      success: true,
      documents: merged,
      pagination: {
        currentPage: validPage,
        totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNext: validPage < Math.ceil(totalItems / ITEMS_PER_PAGE),
        hasPrev: validPage > 1,
      },
    };
  } catch (error) {
    return buildErrorResponse("latestAdded", error, page);
  }
});

const buildTypedAggregationPipeline = (filters, page, contentType) => {
  const type = contentType === "films" ? "film" : "series";
  return buildContentAggregationPipeline(
    filters,
    { sort: { createdAt: -1, rating: -1 }, filter: { "category.isNew": true } },
    page,
    { type: { $literal: type } }
  );
};

export const getNewMovies = cache(async (filters = {}, page = 1) => {
  try {
    const { client, db } = await connectToDatabase(); // ← new
    const pipeline = buildTypedAggregationPipeline(filters, page, "films");
    const [result] = await client
      .db()
      .collection("films")
      .aggregate(pipeline)
      .toArray();
    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }
    return { success: true, ...buildPaginationResponse(result, page) };
  } catch (error) {
    return buildErrorResponse("films", error, page);
  }
});

export const getNewSeries = cache(async (filters = {}, page = 1) => {
  try {
    const { client, db } = await connectToDatabase(); // ← new
    const pipeline = buildTypedAggregationPipeline(filters, page, "series");
    const [result] = await client
      .db()
      .collection("series")
      .aggregate(pipeline)
      .toArray();
    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }
    return { success: true, ...buildPaginationResponse(result, page) };
  } catch (error) {
    return buildErrorResponse("series", error, page);
  }
});

export const getLatestEpisodes = cache(async (filters = {}, page = 1) => {
  try {
    const { client, db } = await connectToDatabase(); // ← new
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
    // Close client in production (optional but safe)
    if (process.env.NODE_ENV !== "development") {
      await client.close();
    }
    return { success: true, ...buildPaginationResponse(result, page) };
  } catch (error) {
    return buildErrorResponse("episodes", error, page);
  }
});
