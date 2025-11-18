import { ObjectId } from "mongodb";
import sanitize from "mongo-sanitize";
import {
  CURRENT_YEAR,
  ITEMS_PER_PAGE,
  MAX_RESPONSE_SIZE,
  EXCLUDED_SERVERS,
} from "@/lib/data";

export const PUBLIC_CONTENT_PROJECTION = {
  services: 0,
  dbId: 0,
  createdAt: 0,
  updatedAt: 0,
  originalTitle: 0,
  views: 0,
  __v: 0,
};

export const serializeDocument = (doc) => {
  if (!doc) return null;
  let { services, dbId, originalTitle, views, __v, ...serialized } = doc;
  if (Array.isArray(services)) {
    serialized.services = services.filter(
      (s) => !EXCLUDED_SERVERS.includes(s.serviceName)
    );
  }
  if (serialized._id) {
    serialized._id =
      typeof serialized._id === "string"
        ? serialized._id
        : serialized._id.toString();
  }
  if (serialized.seriesId) serialized.seriesId = serialized.seriesId.toString();
  if (serialized.seasonId) serialized.seasonId = serialized.seasonId.toString();
  return serialized;
};

export const serializeDocuments = (docs) => docs.map(serializeDocument);

export const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === "string") {
    if (!/^[a-f\d]{24}$/i.test(id)) throw new Error("Invalid ObjectId format");
    return new ObjectId(id);
  }
  return id;
};

export const buildMatchQuery = (filters = {}, additionalFilters = {}) => {
  const cleanFilters = sanitize(filters);
  const matchQuery = { ...additionalFilters };
  if (cleanFilters.genre?.length > 0)
    matchQuery.genre = { $in: cleanFilters.genre };
  if (cleanFilters.year?.length > 0) {
    const validYears = cleanFilters.year
      .map((y) => parseInt(y, 10))
      .filter(
        (y) => !isNaN(y) && y >= 1900 && y <= new Date().getFullYear() + 2
      );
    if (validYears.length > 0) matchQuery.releaseYear = { $in: validYears };
  }
  if (cleanFilters.language?.length > 0)
    matchQuery.language = { $in: cleanFilters.language };
  if (cleanFilters.country?.length > 0)
    matchQuery.country = { $in: cleanFilters.country };
  return matchQuery;
};

export const buildPaginationStage = (page, limit = ITEMS_PER_PAGE) => {
  const skip = (page - 1) * limit;
  return [{ $skip: skip }, { $limit: limit }];
};

export const withPaginationStage = (dataPipeline, page) => {
  const skipStage = (page - 1) * ITEMS_PER_PAGE;
  return [
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          ...dataPipeline,
          { $skip: skipStage },
          { $limit: ITEMS_PER_PAGE },
        ],
      },
    },
  ];
};

export const buildBaseProjection = (overrides = {}) => ({
  _id: { $toString: "$_id" },
  title: 1,
  genre: 1,
  rating: 1,
  releaseYear: 1,
  image: 1,
  slug: 1,
  category: 1,
  duration: 1,
  updatedAt: 1,
  createdAt: 1,
  ...overrides,
});

export const BASE_SORT_CONFIGS = {
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
  all: {
    sort: { createdAt: -1 },
    filter: {},
  },
};

export const buildContentAggregationPipeline = (
  filters,
  sortConfig,
  page,
  options = {}
) => {
  const { skipPagination = false, projection = {}, type } = options;
  const sortFilter =
    typeof sortConfig.filter === "function"
      ? sortConfig.filter(filters.year?.length > 0)
      : sortConfig.filter;
  const matchQuery = buildMatchQuery(filters, sortFilter);
  const defaultProjection = buildBaseProjection(projection);
  if (type) {
    defaultProjection.type = { $literal: type };
  }

  const dataPipeline = [
    { $match: matchQuery },
    { $sort: sortConfig.sort },
    { $project: defaultProjection },
  ];

  return skipPagination
    ? dataPipeline
    : withPaginationStage(dataPipeline, page);
};

export const buildEpisodeAggregationPipeline = (
  sortConfig,
  page,
  additionalMatch = {}
) => {
  const dataPipeline = [
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
    { $match: { ...sortConfig.filter, ...additionalMatch } },
    { $sort: sortConfig.sort },
    {
      $project: {
        _id: { $toString: "$_id" },
        seriesId: { $toString: "$seriesId" },
        seasonId: { $toString: "$seasonId" },
        episodeNumber: 1,
        duration: 1,
        slug: 1,
        createdAt: 1,
        updatedAt: 1,
        mergedEpisodes: 1,
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
  ];

  return withPaginationStage(dataPipeline, page);
};

export const buildFilmCollectionsAggregationPipeline = (page) => {
  const dataPipeline = [
    {
      $lookup: {
        from: "films",
        localField: "films",
        foreignField: "_id",
        as: "filmDetails",
      },
    },
    { $sort: { createdAt: -1 } },
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
  ];
  return withPaginationStage(dataPipeline, page);
};

export const buildPaginationResponse = (result, page) => {
  const totalItems = Math.min(
    result.metadata[0]?.total || 0,
    MAX_RESPONSE_SIZE
  );
  const documents = result.data || [];
  const maxPages = Math.ceil(MAX_RESPONSE_SIZE / ITEMS_PER_PAGE);
  return {
    documents,
    pagination: {
      currentPage: page,
      totalPages: Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), maxPages),
      totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
      hasNext:
        page < Math.min(Math.ceil(totalItems / ITEMS_PER_PAGE), maxPages),
      hasPrev: page > 1,
    },
  };
};

export const buildErrorResponse = (contentType, error, page = 1) => {
  console.error(`Error with ${contentType}:`, error);
  return {
    success: false,
    error: `An error occurred while fetching ${contentType}`,
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
};

export const buildSearchRegex = (query, startsWith = false) => {
  const trimmedQuery = query.trim();
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(startsWith ? `^${escapedQuery}` : escapedQuery, "i");
};

export const withErrorHandling = (fn, fallbackContentType = "unknown") => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const page = args.find((arg) => typeof arg === "number") || 1;
      return buildErrorResponse(fallbackContentType, error, page);
    }
  };
};
