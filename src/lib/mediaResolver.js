import { getFilmBySlug } from "@/actions/films";
import {
  getSerieBySlug,
  getSeasonBySlug,
  getEpisodeBySlug,
} from "@/actions/series";

export const CONTENT_TYPES = {
  FILM: "film",
  SERIES: "serie",
  SEASON: "season",
  EPISODE: "episode",
};

const CONTENT_STRATEGIES = {
  [CONTENT_TYPES.EPISODE]: {
    detect: (slug) =>
      slug.includes("مسلسل") && slug.includes("موسم") && slug.includes("حلقة"),
    fetch: getEpisodeBySlug,
    validate: (result) =>
      result.success && result.episode && result.season && result.series,
    transform: (result) => ({
      episode: result.episode,
      season: result.season,
      series: result.series,
    }),
  },
  [CONTENT_TYPES.SEASON]: {
    detect: (slug) =>
      slug.includes("مسلسل") && slug.includes("موسم") && !slug.includes("حلقة"),
    fetch: getSeasonBySlug,
    validate: (result) => result.success && result.season && result.series,
    transform: (result) => ({ season: result.season, series: result.series }),
  },
  [CONTENT_TYPES.SERIES]: {
    detect: (slug) => slug.includes("مسلسل") && !slug.includes("موسم"),
    fetch: getSerieBySlug,
    validate: (result) => result.success && result.serie,
    transform: (result) => result.serie,
  },
  [CONTENT_TYPES.FILM]: {
    detect: (slug) => slug.includes("فيلم"),
    fetch: getFilmBySlug,
    validate: (result) => result.success && result.film,
    transform: (result) => result.film,
  },
};

export async function resolveMediaBySlug(slug) {
  const detectedType = Object.entries(CONTENT_STRATEGIES).find(
    ([_, strategy]) => strategy.detect(slug)
  )?.[0];

  if (detectedType) {
    const result = await tryFetchType(slug, detectedType);
    if (result) return result;
  }

  for (const [type, _] of Object.entries(CONTENT_STRATEGIES)) {
    if (type !== detectedType) {
      const result = await tryFetchType(slug, type);
      if (result) return result;
    }
  }

  return null;
}

async function tryFetchType(slug, type) {
  const strategy = CONTENT_STRATEGIES[type];
  const result = await strategy.fetch(slug);
  return strategy.validate(result)
    ? { type, data: strategy.transform(result) }
    : null;
}

// ✅ NEW: Fetch all media slugs for sitemap
// lib/mediaResolver.js

export async function getAllMediaSlugs() {
  try {
    const { getFilms } = require("@/actions/films");
    const { getSeries } = require("@/actions/series");

    // Fetch ALL with minimal projection
    const films = await getFilms({}, "all", 1, {
      skipPagination: true,
      projection: { slug: 1, updatedAt: 1, createdAt: 1 },
    });

    const series = await getSeries({}, "all", 1, {
      skipPagination: true,
      projection: { slug: 1, updatedAt: 1, createdAt: 1 },
    });

    const normalize = (items) =>
      (items.documents || []).map((doc) => ({
        slug: doc.slug,
        lastUpdated: doc.updatedAt || doc.createdAt,
      }));

    return [...normalize(films), ...normalize(series)];
  } catch (error) {
    console.error("❌ Failed to fetch media slugs for sitemap:", error);
    return [];
  }
}
