import { CONTENT_TYPES } from "./mediaResolver";

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
export const serializers = {
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
        title: `الموسم ${data.seasonNumber}`,
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
      title: `${series.title} - الموسم ${season.seasonNumber}`,
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
        title: `الحلقة ${data.episode.episodeNumber}`,
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

// Metadata generation
export const metadataGenerators = {
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
