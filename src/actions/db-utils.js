// lib/db-utils.js (NOT a server action file - remove "use server")
import { ObjectId } from "mongodb";
import sanitize from "mongo-sanitize";
import { CURRENT_YEAR, ITEMS_PER_PAGE, MAX_RESPONSE_SIZE } from "@/lib/data";
import { validatePage } from "@/lib/validation";

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
  const cleanFilters = sanitize(filters);
  const cleanAdditional = sanitize(additionalFilters);
  const matchQuery = { ...cleanAdditional };

  if (cleanFilters.genre?.length > 0) {
    matchQuery.genre = { $in: cleanFilters.genre };
  }

  if (cleanFilters.year?.length > 0) {
    const validYears = cleanFilters.year
      .map((y) => parseInt(y, 10))
      .filter(
        (y) => !isNaN(y) && y >= 1900 && y <= new Date().getFullYear() + 2
      );

    if (validYears.length > 0) {
      matchQuery.releaseYear = { $in: validYears };
    }
  }

  if (cleanFilters.language?.length > 0) {
    matchQuery.language = { $in: cleanFilters.language };
  }

  if (cleanFilters.country?.length > 0) {
    matchQuery.country = { $in: cleanFilters.country };
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
  // Validate page
  const validPage = validatePage(page);
  const skip = (validPage - 1) * ITEMS_PER_PAGE;

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
  const totalItems = Math.min(
    result.metadata[0]?.total || 0,
    MAX_RESPONSE_SIZE
  );
  const documents = result.data || [];

  // Limit total pages
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

// 🎯 Standard Error Response
export const buildErrorResponse = (contentType, error, page = 1) => {
  // Log the actual error on the server
  console.error(`Error with ${contentType}:`, error);

  // Return generic message to client
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

// 🎯 Convert string to ObjectId safely
export const toObjectId = (id) => {
  if (!id) return null;

  // Validate ObjectId format before creating
  if (typeof id === "string") {
    if (!/^[a-f\d]{24}$/i.test(id)) {
      throw new Error("Invalid ObjectId format");
    }
    return new ObjectId(id);
  }

  return id;
};

// 🎯 Build Search Regex
export const buildSearchRegex = (query, startsWith = false) => {
  const trimmedQuery = query.trim();
  // Escape regex special characters
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(startsWith ? `^${escapedQuery}` : escapedQuery, "i");
};
