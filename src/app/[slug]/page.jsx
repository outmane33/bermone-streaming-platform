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

export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Try to get film first
  const { success: filmSuccess, film } = await getFilmBySlug(slug);
  if (filmSuccess && film) {
    return {
      title: `${film.title} (${film.releaseYear}) - Watch Online`,
      description:
        film.description || `Watch ${film.title} online in ${film.quality}`,
    };
  }

  // If not a film, try series
  const { success: serieSuccess, serie } = await getSerieBySlug(slug);
  if (serieSuccess && serie) {
    return {
      title: `${serie.title} (${serie.releaseYear}) - Watch Online`,
      description:
        serie.description ||
        `Watch ${serie.title} series online in ${serie.quality}`,
    };
  }

  // If not a series, try season
  const {
    success: seasonSuccess,
    season,
    series,
  } = await getSeasonBySlug(slug);
  if (seasonSuccess && season && series) {
    return {
      title: `${series.title} - Season ${season.seasonNumber} (${season.releaseYear}) - Watch Online`,
      description:
        series.description ||
        `Watch ${series.title} Season ${season.seasonNumber} online`,
    };
  }

  // If not a season, try episode
  const {
    success: episodeSuccess,
    episode,
    season: episodeSeason,
    series: episodeSeries,
  } = await getEpisodeBySlug(slug);
  if (episodeSuccess && episode && episodeSeason && episodeSeries) {
    return {
      title: `${episodeSeries.title} - S${episodeSeason.seasonNumber}E${episode.episodeNumber} - Watch Online`,
      description: `Watch ${episodeSeries.title} Season ${episodeSeason.seasonNumber} Episode ${episode.episodeNumber} online`,
    };
  }

  return {
    title: "Content Not Found",
  };
}

// Helper function to serialize MongoDB objects
function serializeMedia(media) {
  return {
    _id: media._id?.toString(),
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
    services:
      media.services?.map((service) => ({
        serviceName: service.serviceName,
        qualities:
          service.qualities?.map((quality) => {
            // Handle both string qualities and quality objects
            if (typeof quality === "string") {
              return quality;
            }
            // If it's an object, ensure all nested _id fields are converted to strings
            return {
              quality: quality.quality,
              iframe: quality.iframe,
              downloadLink: quality.downloadLink,
              _id:
                quality._id?.toString() ||
                (typeof quality._id === "object"
                  ? JSON.stringify(quality._id)
                  : quality._id),
            };
          }) || [],
        _id: service._id?.toString(),
      })) || [],
    createdAt: media.createdAt?.toISOString(),
    updatedAt: media.updatedAt?.toISOString(),
    category: {
      isNew: media.category?.isNew || false,
      isPopular: media.category?.isPopular || false,
      isTop: media.category?.isTop || false,
      isForeignmovies: media.category?.isForeignmovies || false,
      isAsianmovies: media.category?.isAsianmovies || false,
      isAnimemovies: media.category?.isAnimemovies || false,
      isForeignseries: media.category?.isForeignseries || false,
      isAsianseries: media.category?.isAsianseries || false,
      isAnimeseries: media.category?.isAnimeseries || false,
    },
    slug: media.slug,
    // Add serie-specific fields if they exist
    ...(media.seasons && { seasons: media.seasons }),
    type: media.seasons ? "serie" : "film", // Add type identifier
  };
}

// Helper function to serialize seasons for RelatedSection
function serializeSeason(season) {
  return {
    _id: season._id,
    title: `Season ${season.seasonNumber}`,
    image: season.image,
    rating: season.rating,
    releaseYear: season.releaseYear,
    slug: season.slug,
    status: season.status,
    seasonNumber: season.seasonNumber,
    type: "season", // Add type identifier
  };
}

// Helper function to serialize episodes for RelatedSection
function serializeEpisode(episode, seasonImage) {
  return {
    _id: episode._id,
    slug: episode.slug,
    title: `Episode ${episode.episodeNumber}`,
    image: seasonImage, // Use season image for episodes
    duration: episode.duration,
    episodeNumber: episode.episodeNumber,
    services: episode.services,
    type: "episode", // Add type identifier
  };
}

// Helper function to serialize season for HeroSection
function serializeSeasonForHero(season, series) {
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
    type: "season",
  };
}

// Helper function to serialize episode for HeroSection
function serializeEpisodeForHero(episode, season, series, allEpisodes = []) {
  // Check if this is the last episode of a completed season
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
    type: "episode",
    country: series.country,
    language: series.language,
    isLastEpisode: isLastEpisode, // Add this flag
  };
}

export default async function MediaPage({ params }) {
  const { slug } = await params;

  // Try to get film first
  const { success: filmSuccess, film } = await getFilmBySlug(slug);

  if (filmSuccess && film) {
    const serializedFilm = serializeMedia(film);

    // Check if film belongs to a collection
    const {
      success: collectionSuccess,
      collection,
      films: collectionFilms,
    } = await getFilmCollection(film._id);

    let relatedContent = [];
    let sectionTitle = "Related Films";

    if (collectionSuccess && collectionFilms?.length > 0) {
      // Film is in a collection - show collection films
      relatedContent = collectionFilms
        .filter((f) => f._id.toString() !== film._id.toString()) // Exclude current film
        .map(serializeMedia);
      sectionTitle = collection.name;
    } else {
      // Film not in collection - show related films
      const { success: relatedSuccess, films: relatedFilms } =
        await getRelatedFilms(film._id, {
          genre: film.genre,
          releaseYear: film.releaseYear,
          language: film.language,
        });

      if (relatedSuccess && relatedFilms?.length > 0) {
        relatedContent = relatedFilms.map(serializeMedia);
      }
    }

    return (
      <div className="space-y-6 mb-12">
        <HeroSection media={serializedFilm} />

        {relatedContent.length > 0 && (
          <RelatedSection relatedMedia={relatedContent} title={sectionTitle} />
        )}
      </div>
    );
  }

  // If not found as film, try series
  const { success: serieSuccess, serie } = await getSerieBySlug(slug);

  if (serieSuccess && serie) {
    const serializedSerie = serializeMedia(serie);

    // Fetch seasons for this series
    const { success: seasonsSuccess, seasons } = await getSeasonsBySeries(
      serie._id
    );

    let relatedContent = [];
    let sectionTitle = "Seasons";

    if (seasonsSuccess && seasons?.length > 0) {
      relatedContent = seasons.map(serializeSeason);
    }

    return (
      <div className="space-y-6 mb-12">
        <HeroSection media={serializedSerie} type="serie" />

        {relatedContent.length > 0 && (
          <RelatedSection relatedMedia={relatedContent} title={sectionTitle} />
        )}
      </div>
    );
  }

  // If not found as series, try season
  const {
    success: seasonSuccess,
    season,
    series,
  } = await getSeasonBySlug(slug);

  if (seasonSuccess && season && series) {
    const serializedSeason = serializeSeasonForHero(season, series);

    // Fetch episodes for this season
    const { success: episodesSuccess, episodes } = await getEpisodesBySeason(
      season._id
    );

    console.log("📄 Episodes found:", episodes ? episodes.length : "No");
    let relatedContent = [];
    let sectionTitle = "Episodes";

    if (episodesSuccess && episodes?.length > 0) {
      relatedContent = episodes.map((ep) => serializeEpisode(ep, season.image));
    }
    console.log("serializedSeason:", serializedSeason);
    return (
      <div className="space-y-6 mb-12">
        <HeroSection media={serializedSeason} type="season" />

        {relatedContent.length > 0 && (
          <RelatedSection relatedMedia={relatedContent} title={sectionTitle} />
        )}
      </div>
    );
  }

  // If not found as season, try episode
  const {
    success: episodeSuccess,
    episode,
    season: episodeSeason,
    series: episodeSeries,
  } = await getEpisodeBySlug(slug);

  if (episodeSuccess && episode && episodeSeason && episodeSeries) {
    // Fetch all episodes for this season FIRST
    const { success: episodesSuccess, episodes } = await getEpisodesBySeason(
      episodeSeason._id
    );

    console.log("📄 Season episodes found:", episodes ? episodes.length : "No");

    // Pass all episodes to serializeEpisodeForHero for last episode detection
    const serializedEpisode = serializeEpisodeForHero(
      episode,
      episodeSeason,
      episodeSeries,
      episodes || [] // Pass all episodes array
    );

    let relatedContent = [];
    let sectionTitle = `Season ${episodeSeason.seasonNumber} Episodes`;

    if (episodesSuccess && episodes?.length > 0) {
      relatedContent = episodes.map((ep) =>
        serializeEpisode(ep, episodeSeason.image)
      );
    }

    return (
      <div className="space-y-6 mb-12">
        <HeroSection media={serializedEpisode} />

        {relatedContent.length > 0 && (
          <RelatedSection relatedMedia={relatedContent} title={sectionTitle} />
        )}
      </div>
    );
  }

  // If neither found, show 404
  notFound();
}
