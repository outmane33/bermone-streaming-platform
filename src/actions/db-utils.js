// lib/db-utils.js (NOT a server action file - remove "use server")
import { ObjectId } from "mongodb";

// 🎯 Constants
export const ITEMS_PER_PAGE = 18;
export const SEARCH_LIMIT = 20;
export const CURRENT_YEAR = new Date().getFullYear();

// 🔄 Serialization Helpers
export const serializeObjectId = (id) => {
  if (!id) return null;
  return typeof id === "string" ? id : id.toString();
};

export const serializeDocument = (doc) => {
  if (!doc) return null;

  const serialized = { ...doc };

  // Convert _id
  if (serialized._id) {
    serialized._id = serializeObjectId(serialized._id);
  }

  // Convert related IDs
  if (serialized.seriesId)
    serialized.seriesId = serializeObjectId(serialized.seriesId);
  if (serialized.seasonId)
    serialized.seasonId = serializeObjectId(serialized.seasonId);

  return serialized;
};

export const serializeDocuments = (docs) => docs.map(serializeDocument);

// 🎯 Common Sort Configurations
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

// 🎯 Build Match Query from Filters
export const buildMatchQuery = (filters = {}, additionalFilters = {}) => {
  const matchQuery = { ...additionalFilters };

  if (filters.genre?.length > 0) {
    matchQuery.genre = { $in: filters.genre };
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

  return matchQuery;
};

// 🎯 Build Standard Content Aggregation Pipeline
export const buildContentAggregationPipeline = (
  filters,
  sortConfig,
  page,
  projection = {}
) => {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Apply sort-specific filters
  const sortFilter =
    typeof sortConfig.filter === "function"
      ? sortConfig.filter(filters.year?.length > 0)
      : sortConfig.filter;

  const matchQuery = buildMatchQuery(filters, sortFilter);

  // Default projection for content
  const defaultProjection = {
    _id: { $toString: "$_id" },
    title: 1,
    genre: 1,
    rating: 1,
    releaseYear: 1,
    image: 1,
    slug: 1,
    category: 1,
    duration: 1,
    ...projection,
  };

  return [
    { $match: matchQuery },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: sortConfig.sort },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          { $project: defaultProjection },
        ],
      },
    },
  ];
};

// 🎯 Build Episode Aggregation Pipeline (with series lookup)
export const buildEpisodeAggregationPipeline = (
  sortConfig,
  page,
  additionalMatch = {}
) => {
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
    { $match: { ...sortConfig.filter, ...additionalMatch } },
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
};

// 🎯 Standard Pagination Response
export const buildPaginationResponse = (result, page) => {
  const totalItems = result.metadata[0]?.total || 0;
  const documents = result.data || [];

  return {
    documents,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
      totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
      hasNext: page < Math.ceil(totalItems / ITEMS_PER_PAGE),
      hasPrev: page > 1,
    },
  };
};

// 🎯 Standard Error Response
export const buildErrorResponse = (contentType, error, page = 1) => {
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
};

// 🎯 Convert string to ObjectId safely
export const toObjectId = (id) => {
  if (!id) return null;
  return typeof id === "string" ? new ObjectId(id) : id;
};

// 🎯 Build Search Regex
export const buildSearchRegex = (query, startsWith = false) => {
  const trimmedQuery = query.trim();
  return new RegExp(startsWith ? `^${trimmedQuery}` : trimmedQuery, "i");
};
