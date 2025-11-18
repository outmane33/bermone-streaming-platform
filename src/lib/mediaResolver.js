import { getFilmBySlug } from "@/actions/films";
import {
  getSerieBySlug,
  getSeasonBySlug,
  getEpisodeBySlug,
} from "@/actions/series";
import { detectContentTypeFromSlug } from "@/lib/contentUtils";

export const CONTENT_TYPES = {
  FILM: "film",
  SERIES: "serie",
  SEASON: "season",
  EPISODE: "episode",
};

const CONTENT_STRATEGIES = {
  [CONTENT_TYPES.EPISODE]: {
    detect: (slug) => detectContentTypeFromSlug(slug) === "episode",
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
    detect: (slug) => detectContentTypeFromSlug(slug) === "season",
    fetch: getSeasonBySlug,
    validate: (result) => result.success && result.season && result.series,
    transform: (result) => ({ season: result.season, series: result.series }),
  },
  [CONTENT_TYPES.SERIES]: {
    detect: (slug) => detectContentTypeFromSlug(slug) === "series",
    fetch: getSerieBySlug,
    validate: (result) => result.success && result.serie,
    transform: (result) => result.serie,
  },
  [CONTENT_TYPES.FILM]: {
    detect: (slug) => detectContentTypeFromSlug(slug) === "film",
    fetch: getFilmBySlug,
    validate: (result) => result.success && result.film,
    transform: (result) => result.film,
  },
};

export async function resolveMediaBySlug(slug) {
  const detectedType = Object.keys(CONTENT_STRATEGIES).find((type) =>
    CONTENT_STRATEGIES[type].detect(slug)
  );

  if (detectedType) {
    const result = await tryFetchType(slug, detectedType);
    if (result) return result;
  }

  for (const type of Object.keys(CONTENT_STRATEGIES).filter(
    (t) => t !== detectedType
  )) {
    const result = await tryFetchType(slug, type);
    if (result) return result;
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

export async function getAllMediaSlugs() {
  try {
    const { getFilms } = require("@/actions/films");
    const { getSeries } = require("@/actions/series");
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
    console.error("❌ Failed to fetch media slugs for sitemap");
    return [];
  }
}
