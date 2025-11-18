"use server";
import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import {
  BASE_SORT_CONFIGS,
  buildContentAggregationPipeline,
  buildFilmCollectionsAggregationPipeline,
  buildEpisodeAggregationPipeline,
  buildPaginationResponse,
  withErrorHandling,
} from "@/actions/db-utils";
import { validatePage } from "@/lib/validation";

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
  movieSeries: { type: "filmCollections", sort: { createdAt: -1 }, filter: {} },
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

export const getContent = cache(
  withErrorHandling(
    async (contentType, filters = {}, sortId = null, page = 1) => {
      const validPage = validatePage(page);
      if (!["films", "series"].includes(contentType)) {
        throw new Error("Invalid content type. Must be 'films' or 'series'");
      }

      const sortConfigs =
        contentType === "films" ? FILMS_SORT_CONFIGS : SERIES_SORT_CONFIGS;
      if (sortId && !sortConfigs[sortId]) {
        throw new Error("Invalid sort ID");
      }

      const sortConfig =
        sortId && sortConfigs[sortId]
          ? sortConfigs[sortId]
          : { sort: { createdAt: -1 }, filter: {} };

      const { db } = await connectToDatabase();
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

      const collection = db.collection(collectionName);
      const [result] = await collection.aggregate(pipeline).toArray();
      if (!result?.data) {
        throw new Error("Empty result");
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
    },
    "content"
  )
);
