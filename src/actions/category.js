"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";

// 🎯 Constants
const ITEMS_PER_PAGE = 18;

// 🎯 Sort configurations for FILMS
const FILMS_SORT_CONFIGS = {
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

// 🎯 Sort configurations for SERIES
const SERIES_SORT_CONFIGS = {
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

// 🎯 Build MongoDB aggregation query for EPISODES (anime episodes)
function buildEpisodesAggregationPipeline(sortConfig, page) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  return [
    {
      $lookup: {
        from: "series",
        localField: "seriesId",
        foreignField: "_id",
        as: "series",
      },
    },
    { $unwind: { path: "$series", preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: "seasons",
        localField: "seasonId",
        foreignField: "_id",
        as: "season",
      },
    },
    { $unwind: { path: "$season", preserveNullAndEmptyArrays: true } },
    { $match: sortConfig.filter },
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
              seriesId: { $toString: "$seriesId" },
              seasonId: { $toString: "$seasonId" },
              episodeNumber: 1,
              duration: 1,
              slug: 1,
              services: {
                $map: {
                  input: "$services",
                  as: "service",
                  in: {
                    serviceName: "$service.serviceName",
                    qualities: "$service.qualities",
                    _id: { $toString: "$service._id" },
                  },
                },
              },
              createdAt: 1,
              updatedAt: 1,
              series: {
                _id: { $toString: "$series._id" },
                title: "$series.title",
                image: "$series.image",
                slug: "$series.slug",
                rating: "$series.rating",
                genre: "$series.genre",
              },
              season: {
                _id: { $toString: "$season._id" },
                seasonNumber: "$season.seasonNumber",
                image: "$season.image",
              },
            },
          },
        ],
      },
    },
  ];
}

// 🎯 Build MongoDB aggregation query for FILMS/SERIES
function buildContentAggregationPipeline(filters, sortConfig, page) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const matchQuery = {};

  const sortFilter =
    typeof sortConfig.filter === "function"
      ? sortConfig.filter(filters.year?.length > 0)
      : sortConfig.filter;

  Object.assign(matchQuery, sortFilter);

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
              seasons: 1,
              totalEpisodes: 1,
              status: 1,
            },
          },
        ],
      },
    },
  ];
}

// 🎯 Build MongoDB aggregation query for FILM COLLECTIONS
function buildFilmCollectionsAggregationPipeline(page) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

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

// 🚀 Main action - works for films and series (including anime content)
export const getContent = cache(
  async (contentType, filters = {}, sortId = null, page = 1) => {
    try {
      // REMOVED "animes" validation
      if (!["films", "series"].includes(contentType)) {
        throw new Error("Invalid content type. Must be 'films' or 'series'");
      }

      const client = await clientPromise;

      // Determine sort configs based on content type
      const sortConfigs =
        contentType === "films" ? FILMS_SORT_CONFIGS : SERIES_SORT_CONFIGS;

      const sortConfig =
        sortId && sortConfigs[sortId]
          ? sortConfigs[sortId]
          : {
              sort: { createdAt: -1 },
              filter: {},
            };

      let pipeline;
      let collectionName;
      let resultContentType;

      // 🎬 Special handling for film collections
      if (sortConfig.type === "filmCollections") {
        collectionName = "filmcollections";
        pipeline = buildFilmCollectionsAggregationPipeline(page);
        resultContentType = "filmCollections";
      }
      // 🎬 Special handling for episodes-based sorts
      else if (sortConfig.type === "episodes") {
        collectionName = "episodes";
        pipeline = buildEpisodesAggregationPipeline(sortConfig, page);
        resultContentType = "episodes";
      }
      // Regular films/series query
      else {
        collectionName = contentType;
        pipeline = buildContentAggregationPipeline(filters, sortConfig, page);
        resultContentType = contentType;
      }

      const collection = client.db().collection(collectionName);
      const [result] = await collection.aggregate(pipeline).toArray();

      const totalItems = result.metadata[0]?.total || 0;
      const documents = result.data || [];

      return {
        success: true,
        documents,
        contentType: resultContentType,
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
      console.error(`❌ Error fetching ${contentType}:`, error);

      return {
        success: false,
        error: error.message,
        documents: [],
        contentType,
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

// 🎯 Backward compatibility
export const getFilms = cache(async (filters = {}, sortId = null, page = 1) => {
  return getContent("films", filters, sortId, page);
});

export const getSeries = cache(
  async (filters = {}, sortId = null, page = 1) => {
    return getContent("series", filters, sortId, page);
  }
);

// 🎬 Get Latest Anime Episodes - standalone function
export const getAnimeEpisodes = cache(async (page = 1) => {
  try {
    const client = await clientPromise;
    const collection = client.db().collection("episodes");
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const pipeline = [
      {
        $lookup: {
          from: "series",
          localField: "seriesId",
          foreignField: "_id",
          as: "series",
        },
      },
      { $unwind: { path: "$series", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "seasons",
          localField: "seasonId",
          foreignField: "_id",
          as: "season",
        },
      },
      { $unwind: { path: "$season", preserveNullAndEmptyArrays: true } },
      { $match: { "series.category.isAnimeseries": true } },
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
                slug: 1,
                services: {
                  $map: {
                    input: "$services",
                    as: "service",
                    in: {
                      serviceName: "$service.serviceName",
                      qualities: "$service.qualities",
                      _id: { $toString: "$service._id" },
                    },
                  },
                },
                createdAt: 1,
                updatedAt: 1,
                series: {
                  _id: { $toString: "$series._id" },
                  title: "$series.title",
                  image: "$series.image",
                  slug: "$series.slug",
                  rating: "$series.rating",
                  genre: "$series.genre",
                },
                season: {
                  _id: { $toString: "$season._id" },
                  seasonNumber: "$season.seasonNumber",
                  image: "$season.image",
                },
              },
            },
          ],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();
    const totalItems = result.metadata[0]?.total || 0;
    const documents = result.data || [];

    return {
      success: true,
      documents,
      contentType: "episodes",
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
    console.error("❌ Error fetching anime episodes:", error);
    return {
      success: false,
      error: error.message,
      documents: [],
      contentType: "episodes",
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
