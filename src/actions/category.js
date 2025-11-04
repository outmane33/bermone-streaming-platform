// category.js
"use server";
import { cache } from "react";
import clientPromise from "@/lib/mongodb";
import {
  BASE_SORT_CONFIGS,
  buildContentAggregationPipeline,
  buildEpisodeAggregationPipeline,
  buildPaginationResponse,
  buildErrorResponse,
} from "@/actions/db-utils";
import { validatePage } from "@/lib/validation";
import { ITEMS_PER_PAGE } from "@/lib/data";

// Extend base configs with category-specific ones
const FILMS_SORT_CONFIGS = {
  ...BASE_SORT_CONFIGS,
  foreignMovies: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isForeignmovies": true },
  },
  asianMovies: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isAsianmovies": true },
  },
  animeMovies: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isAnimemovies": true },
  },
  movieSeries: {
    type: "filmCollections",
    sort: { createdAt: -1 },
    filter: {},
  },
};

const SERIES_SORT_CONFIGS = {
  ...BASE_SORT_CONFIGS,
  foreignSeries: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isForeignseries": true },
  },
  asianSeries: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isAsianseries": true },
  },
  animeSeries: {
    sort: { createdAt: -1, rating: -1 },
    filter: { "category.isAnimeseries": true },
  },
  topSeries: {
    sort: { rating: -1, createdAt: -1 },
    filter: { rating: { $gte: 7 } },
  },
  latestAnimeEpisodes: {
    type: "episodes",
    sort: { createdAt: -1 },
    filter: { "series.category.isAnimeseries": true },
  },
};

// Reuse film collections pipeline logic if it becomes common — for now keep minimal
function buildFilmCollectionsAggregationPipeline(page) {
  const validPage = validatePage(page);
  const skip = (validPage - 1) * ITEMS_PER_PAGE;
  return [
    {
      $lookup: {
        from: "films",
        localField: "films",
        foreignField: "_id",
        as: "filmDetails",
      },
    },
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
              name: 1,
              createdAt: 1,
              updatedAt: 1,
              image: { $arrayElemAt: ["$filmDetails.image", 0] },
              filmCount: { $size: "$filmDetails" },
              films: {
                $map: {
                  input: "$filmDetails",
                  as: "film",
                  in: {
                    _id: { $toString: "$$film._id" },
                    title: "$$film.title",
                    image: "$$film.image",
                    rating: "$$film.rating",
                    releaseYear: "$$film.releaseYear",
                    slug: "$$film.slug",
                  },
                },
              },
            },
          },
        ],
      },
    },
  ];
}

export const getContent = cache(
  async (contentType, filters = {}, sortId = null, page = 1) => {
    try {
      if (!["films", "series"].includes(contentType)) {
        throw new Error("Invalid content type. Must be 'films' or 'series'");
      }

      const validPage = validatePage(page);
      const client = await clientPromise;
      const sortConfigs =
        contentType === "films" ? FILMS_SORT_CONFIGS : SERIES_SORT_CONFIGS;

      if (sortId && !sortConfigs[sortId]) {
        throw new Error("Invalid sort ID");
      }

      const sortConfig =
        sortId && sortConfigs[sortId]
          ? sortConfigs[sortId]
          : { sort: { createdAt: -1 }, filter: {} };

      let pipeline;
      let collectionName;
      let resultContentType;

      if (sortConfig.type === "filmCollections") {
        collectionName = "filmcollections";
        pipeline = buildFilmCollectionsAggregationPipeline(validPage);
        resultContentType = "filmCollections";
      } else if (sortConfig.type === "episodes") {
        collectionName = "episodes";
        pipeline = buildEpisodeAggregationPipeline(sortConfig, validPage);
        resultContentType = "episodes";
      } else {
        collectionName = contentType;
        pipeline = buildContentAggregationPipeline(
          filters,
          sortConfig,
          validPage
        );
        resultContentType = contentType;
      }

      const collection = client.db().collection(collectionName);
      const [result] = await collection.aggregate(pipeline).toArray();

      if (!result) {
        return buildErrorResponse(
          resultContentType,
          new Error("Empty result"),
          validPage
        );
      }

      const { documents, pagination } = buildPaginationResponse(
        result,
        validPage
      );
      return {
        success: true,
        documents,
        contentType: resultContentType,
        pagination,
      };
    } catch (error) {
      return buildErrorResponse(
        sortId?.includes("Episode") ? "episodes" : contentType,
        error,
        validatePage(page)
      );
    }
  }
);
