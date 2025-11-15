import { CONTENT_TYPES } from "./mediaResolver";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

function truncateDescription(str, max = 155) {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.substr(0, str.lastIndexOf(" ", max)) + "...";
}

const getGenreText = (genres) =>
  Array.isArray(genres) ? genres.join(", ") : "";

const makeAbsoluteUrl = (path) =>
  path?.startsWith("http") ? path : `${SITE_URL}${path}`;

const serializeId = (id) =>
  id?.toString() || (typeof id === "object" ? JSON.stringify(id) : id);
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
  description: media.description,
  metaDescription: media.metaDescription,
  genre: media.genre || [],
  releaseYear: media.releaseYear,
  image: media.image,
  duration: media.duration,
  rating: media.rating,
  country: media.country,
  language: media.language,
  trailer: media.trailer,
  status: media.status,
  createdAt: media.createdAt?.toISOString(),
  updatedAt: media.updatedAt?.toISOString(),
  category: serializeCategory(media.category),
  slug: media.slug,
});

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
        title: `الحلقة ${
          data?.episode?.mergedEpisodes?.length > 1
            ? `${data?.episode?.mergedEpisodes?.join("-")}`
            : data.episode.episodeNumber
        }`,
        image: data.seasonImage,
        duration: data.episode.duration,
        episodeNumber: data.episode.episodeNumber,
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
      title: `${series.title} - S${season.seasonNumber}E${
        episode?.mergedEpisodes?.length > 1
          ? `${episode?.mergedEpisodes?.join("-")}`
          : episode.episodeNumber
      }`,
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
      type: CONTENT_TYPES.EPISODE,
      country: series.country,
      language: series.language,
      isLastEpisode,
    };
  },
};

export const metadataGenerators = {
  [CONTENT_TYPES.FILM]: (data) => {
    const genre = getGenreText(data.genre);
    const rating = data.rating ? ` - تقييم ${data.rating}` : "";
    const fullImageUrl = makeAbsoluteUrl(data.image);

    return {
      title: `مشاهدة فيلم ${data.title} ${data.releaseYear} مترجم${rating}`,
      description: truncateDescription(
        data.metaDescription ||
          data.description ||
          `مشاهدة وتحميل فيلم ${data.title} ${
            data.releaseYear
          } مترجم اون لاين بجودة عالية${
            genre ? ` | ${genre}` : ""
          }${rating} | قصة الفيلم: ${data.description || ""}`
      ),
      keywords: `${data.title}, فيلم ${data.title}, مشاهدة ${
        data.title
      }, تحميل ${data.title}, ${data.title} مترجم, ${data.title} ${
        data.releaseYear
      }${genre ? `, ${genre}` : ""}`,
      alternates: { canonical: `${SITE_URL}/${data.slug}` },
      robots: { index: true, follow: true },
      openGraph: {
        title: `فيلم ${data.title} ${data.releaseYear} مترجم`,
        description: truncateDescription(data.description, 160),
        type: "video.movie",
        url: `${SITE_URL}/${data.slug}`,
        images: [
          {
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: `ملصق فيلم ${data.title}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `فيلم ${data.title} ${data.releaseYear} مترجم`,
        description: truncateDescription(data.description, 160),
        images: [fullImageUrl],
      },
    };
  },

  [CONTENT_TYPES.SERIES]: (data) => {
    const genre = getGenreText(data.genre);
    const rating = data.rating ? ` - تقييم ${data.rating}` : "";
    const seasons = data.seasons ? ` ${data.seasons.length} مواسم` : "";
    const fullImageUrl = makeAbsoluteUrl(data.image);

    return {
      title: `مشاهدة مسلسل ${data.title} ${data.releaseYear} مترجم${rating}`,
      description: truncateDescription(
        data.metaDescription ||
          data.description ||
          `مشاهدة وتحميل مسلسل ${data.title} ${
            data.releaseYear
          } مترجم جميع المواسم والحلقات اون لاين بجودة عالية${
            genre ? ` | ${genre}` : ""
          }${rating}${seasons} | قصة المسلسل: ${data.description || ""}`
      ),
      keywords: `${data.title}, مسلسل ${data.title}, مشاهدة ${
        data.title
      }, تحميل ${data.title}, ${data.title} مترجم, ${data.title} ${
        data.releaseYear
      }, جميع مواسم ${data.title}${genre ? `, ${genre}` : ""}`,
      alternates: { canonical: `${SITE_URL}/${data.slug}` },
      robots: { index: true, follow: true },
      openGraph: {
        title: `مسلسل ${data.title} ${data.releaseYear} مترجم`,
        description: truncateDescription(data.description, 160),
        type: "video.tv_show",
        url: `${SITE_URL}/${data.slug}`,
        images: [
          {
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: `ملصق مسلسل ${data.title}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `مسلسل ${data.title} ${data.releaseYear} مترجم`,
        description: truncateDescription(data.description, 160),
        images: [fullImageUrl],
      },
    };
  },

  [CONTENT_TYPES.SEASON]: (data) => {
    const { series, season } = data;
    const genre = getGenreText(series.genre);
    const rating = season.rating ? ` - تقييم ${season.rating}` : "";
    const fullImageUrl = makeAbsoluteUrl(season.image);

    return {
      title: `مشاهدة مسلسل ${series.title} الموسم ${season.seasonNumber} مترجم${rating}`,
      description: truncateDescription(
        data.metaDescription ||
          series.description ||
          `مشاهدة وتحميل الموسم ${season.seasonNumber} من مسلسل ${
            series.title
          } ${season.releaseYear} مترجم جميع الحلقات اون لاين بجودة عالية${
            genre ? ` | ${genre}` : ""
          }${rating}`
      ),
      keywords: `${series.title} الموسم ${season.seasonNumber}, مسلسل ${
        series.title
      } الموسم ${season.seasonNumber}, مشاهدة ${series.title} الموسم ${
        season.seasonNumber
      }, تحميل ${series.title} الموسم ${season.seasonNumber}${
        genre ? `, ${genre}` : ""
      }`,
      alternates: { canonical: `${SITE_URL}/${season.slug}` },
      robots: { index: true, follow: true },
      openGraph: {
        title: `${series.title} - الموسم ${season.seasonNumber} مترجم`,
        description: truncateDescription(series.description, 160),
        type: "video.tv_show",
        url: `${SITE_URL}/${season.slug}`,
        images: [
          {
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: `${series.title} الموسم ${season.seasonNumber}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${series.title} - الموسم ${season.seasonNumber}`,
        description: truncateDescription(series.description, 160),
        images: [fullImageUrl],
      },
    };
  },

  [CONTENT_TYPES.EPISODE]: (data) => {
    const { series, season, episode } = data;
    const genre = getGenreText(series.genre);
    const rating = season.rating ? ` - تقييم ${season.rating}` : "";
    const fullImageUrl = makeAbsoluteUrl(season.image);

    return {
      title: `مشاهدة مسلسل ${series.title} الموسم ${season.seasonNumber} الحلقة ${episode.episodeNumber} مترجمة${rating}`,
      description: truncateDescription(
        data.metaDescription ||
          series.description ||
          `مشاهدة وتحميل الحلقة ${episode.episodeNumber} من الموسم ${
            season.seasonNumber
          } من مسلسل ${series.title} ${
            season.releaseYear
          } مترجمة اون لاين بجودة عالية${genre ? ` | ${genre}` : ""}${rating}`
      ),
      keywords: `${series.title} الموسم ${season.seasonNumber} الحلقة ${
        episode.episodeNumber
      }, مسلسل ${series.title} S${season.seasonNumber}E${
        episode.episodeNumber
      }, مشاهدة ${series.title} الحلقة ${episode.episodeNumber}, تحميل ${
        series.title
      } الحلقة ${episode.episodeNumber}${genre ? `, ${genre}` : ""}`,
      alternates: { canonical: `${SITE_URL}/${episode.slug}` },
      robots: { index: true, follow: true },
      openGraph: {
        title: `${series.title} - الموسم ${season.seasonNumber} الحلقة ${episode.episodeNumber}`,
        description: truncateDescription(series.description, 160),
        type: "video.episode",
        url: `${SITE_URL}/${episode.slug}`,
        images: [
          {
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: `${series.title} S${season.seasonNumber}E${episode.episodeNumber}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${series.title} S${season.seasonNumber}E${episode.episodeNumber}`,
        description: truncateDescription(series.description, 160),
        images: [fullImageUrl],
      },
    };
  },
};
