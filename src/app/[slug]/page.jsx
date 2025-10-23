import { notFound } from "next/navigation";
import {
  getFilmBySlug,
  getFilmCollection,
  getRelatedFilms,
} from "@/actions/films";
import {
  getSerieBySlug,
  getSeasonsBySeries,
  getSeasonBySlug,
  getEpisodesBySeason,
  getEpisodeBySlug,
} from "@/actions/series";
import RelatedSection from "@/components/shared/realatedSection/RelatedSection";
import HeroSection from "@/components/shared/heroSection/HeroSection";

const CONTENT_TYPES = {
  FILM: "film",
  SERIES: "serie",
  SEASON: "season",
  EPISODE: "episode",
};

// Content type detection and fetching strategies
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

// Resolve media by trying detected type first, then fallback to all types
async function resolveMediaBySlug(slug) {
  // Try detected type first (fast path)
  const detectedType = Object.entries(CONTENT_STRATEGIES).find(
    ([_, strategy]) => strategy.detect(slug)
  )?.[0];

  if (detectedType) {
    const result = await tryFetchType(slug, detectedType);
    if (result) return result;
  }

  // Fallback: try all types in order
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

// Unified serialization utilities
const serializeId = (id) =>
  id?.toString() || (typeof id === "object" ? JSON.stringify(id) : id);

const serializeQuality = (quality) =>
  typeof quality === "string"
    ? quality
    : {
        quality: quality.quality,
        iframe: quality.iframe,
        downloadLink: quality.downloadLink,
        _id: serializeId(quality._id),
      };

const serializeServices = (services) =>
  services?.map((service) => ({
    serviceName: service.serviceName,
    qualities: service.qualities?.map(serializeQuality) || [],
    _id: serializeId(service._id),
  })) || [];

const serializeCategory = (category) => ({
  isNew: category?.isNew || false,
  isPopular: category?.isPopular || false,
  isTop: category?.isTop || false,
  isForeignmovies: category?.isForeignmovies || false,
  isAsianmovies: category?.isAsianmovies || false,
  isAnimemovies: category?.isAnimemovies || false,
  isForeignseries: category?.isForeignseries || false,
  isAsianseries: category?.isAsianseries || false,
  isAnimeseries: category?.isAnimeseries || false,
});

const serializeMediaBase = (media) => ({
  _id: serializeId(media._id),
  title: media.title,
  originalTitle: media.originalTitle,
  dbId: media.dbId,
  description: media.description,
  metaDescription: media.metaDescription,
  genre: media.genre || [],
  releaseYear: media.releaseYear,
  image: media.image,
  duration: media.duration,
  rating: media.rating,
  country: media.country,
  language: media.language,
  views: media.views,
  trailer: media.trailer,
  status: media.status,
  services: serializeServices(media.services),
  createdAt: media.createdAt?.toISOString(),
  updatedAt: media.updatedAt?.toISOString(),
  category: serializeCategory(media.category),
  slug: media.slug,
});

// Type-specific serializers
const serializers = {
  [CONTENT_TYPES.FILM]: (data) => ({
    ...serializeMediaBase(data),
    type: CONTENT_TYPES.FILM,
  }),

  [CONTENT_TYPES.SERIES]: (data) => ({
    ...serializeMediaBase(data),
    seasons: data.seasons,
    type: CONTENT_TYPES.SERIES,
  }),

  [CONTENT_TYPES.SEASON]: (data, forHero = false) => {
    if (!forHero) {
      return {
        _id: data._id,
        title: `Season ${data.seasonNumber}`,
        image: data.image,
        rating: data.rating,
        releaseYear: data.releaseYear,
        slug: data.slug,
        status: data.status,
        seasonNumber: data.seasonNumber,
        type: CONTENT_TYPES.SEASON,
      };
    }

    const { season, series } = data;
    return {
      _id: season._id,
      title: `${series.title} - Season ${season.seasonNumber}`,
      originalTitle: series.originalTitle,
      description: series.description,
      genre: series.genre || [],
      releaseYear: season.releaseYear,
      image: season.image,
      rating: season.rating,
      status: season.status,
      slug: season.slug,
      seasonNumber: season.seasonNumber,
      seriesId: season.seriesId,
      seriesSlug: series.slug,
      seriesTitle: series.title,
      type: CONTENT_TYPES.SEASON,
    };
  },

  [CONTENT_TYPES.EPISODE]: (data, forHero = false) => {
    if (!forHero) {
      return {
        _id: data.episode._id,
        slug: data.episode.slug,
        title: `Episode ${data.episode.episodeNumber}`,
        image: data.seasonImage,
        duration: data.episode.duration,
        episodeNumber: data.episode.episodeNumber,
        services: data.episode.services,
        type: CONTENT_TYPES.EPISODE,
      };
    }

    const { episode, season, series, allEpisodes = [] } = data;
    const isLastEpisode =
      season.status === "مكتمل" &&
      allEpisodes.length > 0 &&
      episode.episodeNumber ===
        Math.max(...allEpisodes.map((ep) => ep.episodeNumber));

    return {
      _id: episode._id,
      title: `${series.title} - S${season.seasonNumber}E${episode.episodeNumber}`,
      originalTitle: series.originalTitle,
      description: series.description,
      genre: series.genre || [],
      releaseYear: season.releaseYear,
      image: season.image,
      rating: season.rating || series.rating,
      duration: episode.duration,
      status: season.status,
      slug: episode.slug,
      episodeNumber: episode.episodeNumber,
      seasonNumber: season.seasonNumber,
      seriesId: episode.seriesId,
      seasonId: episode.seasonId,
      seriesSlug: series.slug,
      seasonSlug: season.slug,
      seriesTitle: series.title,
      services: episode.services || [],
      type: CONTENT_TYPES.EPISODE,
      country: series.country,
      language: series.language,
      isLastEpisode,
    };
  },
};

// Related content handlers
const relatedHandlers = {
  [CONTENT_TYPES.FILM]: async (data) => {
    const {
      success: collectionSuccess,
      collection,
      films: collectionFilms,
    } = await getFilmCollection(data._id);

    if (collectionSuccess && collectionFilms?.length > 0) {
      return {
        content: collectionFilms
          .filter((f) => f._id.toString() !== data._id.toString())
          .map((f) => serializers[CONTENT_TYPES.FILM](f)),
        title: collection.name,
      };
    }

    const { success, films } = await getRelatedFilms(data._id, {
      genre: data.genre,
      releaseYear: data.releaseYear,
      language: data.language,
    });

    return {
      content:
        success && films
          ? films.map((f) => serializers[CONTENT_TYPES.FILM](f))
          : [],
      title: "Related Films",
    };
  },

  [CONTENT_TYPES.SERIES]: async (data) => {
    const { success, seasons } = await getSeasonsBySeries(data._id);
    return {
      content:
        success && seasons
          ? seasons.map((s) => serializers[CONTENT_TYPES.SEASON](s))
          : [],
      title: "Seasons",
    };
  },

  [CONTENT_TYPES.SEASON]: async (data) => {
    const { success, episodes } = await getEpisodesBySeason(data.season._id);
    return {
      content:
        success && episodes
          ? episodes.map((ep) =>
              serializers[CONTENT_TYPES.EPISODE]({
                episode: ep,
                seasonImage: data.season.image,
              })
            )
          : [],
      title: "Episodes",
    };
  },

  [CONTENT_TYPES.EPISODE]: async (data) => {
    const { success, episodes } = await getEpisodesBySeason(data.season._id);
    return {
      content:
        success && episodes
          ? episodes.map((ep) =>
              serializers[CONTENT_TYPES.EPISODE]({
                episode: ep,
                seasonImage: data.season.image,
              })
            )
          : [],
      title: `Season ${data.season.seasonNumber} Episodes`,
      allEpisodes: episodes || [],
    };
  },
};

// Metadata generation
const metadataGenerators = {
  [CONTENT_TYPES.FILM]: (data) => ({
    title: `${data.title} (${data.releaseYear}) - Watch Online`,
    description:
      data.description || `Watch ${data.title} online in ${data.quality}`,
  }),

  [CONTENT_TYPES.SERIES]: (data) => ({
    title: `${data.title} (${data.releaseYear}) - Watch Online`,
    description:
      data.description ||
      `Watch ${data.title} series online in ${data.quality}`,
  }),

  [CONTENT_TYPES.SEASON]: (data) => ({
    title: `${data.series.title} - Season ${data.season.seasonNumber} (${data.season.releaseYear}) - Watch Online`,
    description:
      data.series.description ||
      `Watch ${data.series.title} Season ${data.season.seasonNumber} online`,
  }),

  [CONTENT_TYPES.EPISODE]: (data) => ({
    title: `${data.series.title} - S${data.season.seasonNumber}E${data.episode.episodeNumber} - Watch Online`,
    description: `Watch ${data.series.title} Season ${data.season.seasonNumber} Episode ${data.episode.episodeNumber} online`,
  }),
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    return { title: "Content Not Found" };
  }

  return metadataGenerators[resolved.type](resolved.data);
}

export default async function MediaPage({ params }) {
  const { slug } = await params;
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    notFound();
  }

  const { type, data } = resolved;
  const relatedData = await relatedHandlers[type](data);

  const serializedMedia =
    type === CONTENT_TYPES.EPISODE
      ? serializers[type](
          { ...data, allEpisodes: relatedData.allEpisodes },
          true
        )
      : type === CONTENT_TYPES.SEASON
      ? serializers[type](data, true)
      : serializers[type](data);

  return (
    <div className="space-y-6 mb-12">
      <HeroSection media={serializedMedia} type={type} />

      {relatedData.content.length > 0 && (
        <RelatedSection
          relatedMedia={relatedData.content}
          title={relatedData.title}
        />
      )}
    </div>
  );
}
