import { getFilmCollection, getRelatedFilms } from "@/actions/films";
import { getSeasonsBySeries, getEpisodesBySeason } from "@/actions/series";
import { serializers } from "./mediaSerializers";
import { CONTENT_TYPES } from "./mediaResolver";

export const relatedHandlers = {
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
      title: "ربّما يعجبك ايضاََ",
    };
  },

  [CONTENT_TYPES.SERIES]: async (data) => {
    const { success, seasons } = await getSeasonsBySeries(data._id);
    return {
      content:
        success && seasons
          ? seasons.map((s) => serializers[CONTENT_TYPES.SEASON](s))
          : [],
      title: "المواسم",
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
      title: "الحلقات",
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
