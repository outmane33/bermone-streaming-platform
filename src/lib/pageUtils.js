// lib/pageUtils.js

import { notFound } from "next/navigation";
import { FILTER_CONFIG } from "@/lib/data";
import { validatePage } from "./validation";

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
 * Validates filter values against allowed options
 */
export function validateFilterValues(params) {
  const filterKeys = ["genre", "year", "language", "country"];

  for (const key of filterKeys) {
    if (params?.[key]) {
      const values = params[key].split(",").filter(Boolean);
      const allowedOptions = FILTER_CONFIG[key]?.options || [];

      // Check if all values are in the allowed options
      const hasInvalidValues = values.some(
        (value) => !allowedOptions.includes(value)
      );

      if (hasInvalidValues) {
        notFound();
      }
    }
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

  const MAX_FILTER_ITEMS = 3;
  if (
    filters.genre.length > MAX_FILTER_ITEMS ||
    filters.year.length > MAX_FILTER_ITEMS ||
    filters.language.length > MAX_FILTER_ITEMS ||
    filters.country.length > MAX_FILTER_ITEMS
  ) {
    throw new Error("Too many filter values");
  }

  return filters;
}

/**
 * Parses and validates common page parameters
 */
export function parsePageParams(params, validSortIds, validQueryParams) {
  // Validate query parameters
  validateQueryParams(params, validQueryParams);

  // Validate filter values
  validateFilterValues(params);

  // Extract and validate sort
  const sortId = params?.sort || null;
  validateSortId(sortId, validSortIds);

  // Extract page
  const page = validatePage(params?.page || "1");

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
