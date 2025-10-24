// lib/pageUtils.js

import { notFound } from "next/navigation";

/**
 * Validates query parameters against allowed list
 */
export function validateQueryParams(searchParams, validParams) {
  const queryKeys = Object.keys(searchParams || {});
  const hasInvalidParams = queryKeys.some((key) => !validParams.includes(key));

  if (hasInvalidParams) {
    notFound();
  }
}

/**
 * Validates sort ID against allowed list
 */
export function validateSortId(sortId, validSortIds) {
  if (sortId && !validSortIds.includes(sortId)) {
    notFound();
  }
}

/**
 * Builds filters object from search params
 */
export function buildFilters(params, includeQuality = true) {
  const filters = {
    genre: params?.genre?.split(",").filter(Boolean) || [],
    year: params?.year?.split(",").filter(Boolean) || [],
    language: params?.language?.split(",").filter(Boolean) || [],
    country: params?.country?.split(",").filter(Boolean) || [],
  };

  if (includeQuality) {
    filters.quality = params?.quality?.split(",").filter(Boolean) || [];
  }

  return filters;
}

/**
 * Parses and validates common page parameters
 */
export function parsePageParams(params, validSortIds, validQueryParams) {
  // Validate query parameters
  validateQueryParams(params, validQueryParams);

  // Extract and validate sort
  const sortId = params?.sort || null;
  validateSortId(sortId, validSortIds);

  // Extract page
  const page = parseInt(params?.page || "1", 10);

  return { sortId, page };
}

/**
 * Standard carousel data structure
 */
export function createCarouselProps(documents) {
  return {
    carouselMida: documents,
  };
}
