import { Play, Star, Calendar, Clock, Film } from "lucide-react";
import { COMPONENT_STYLES, DESIGN_TOKENS } from "@/lib/data";
import CardWrapper from "./CardWrapper";

const TopBadges = ({
  isNew,
  quality,
  rating,
  episodeNumber,
  seasonNumber,
  filmCount,
}) => {
  const badgeStyles = COMPONENT_STYLES.badge;

  return (
    <div className="absolute top-3 left-3 right-3 z-20 md:flex items-start justify-between hidden">
      <div className="flex flex-col gap-2">
        {filmCount && (
          <span
            className={`${badgeStyles.base} bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm text-white border border-purple-500/30 flex items-center gap-1.5`}
          >
            <Film size={14} />
            {filmCount} أفلام
          </span>
        )}
        {episodeNumber && (
          <span
            className={`${badgeStyles.base} ${badgeStyles.variants.episode}`}
          >
            {seasonNumber ? `S${seasonNumber}` : ""} E{episodeNumber}
          </span>
        )}
        {isNew && (
          <span className={`${badgeStyles.base} ${badgeStyles.variants.new}`}>
            جديد
          </span>
        )}
        {quality && (
          <span
            className={`${badgeStyles.base} bg-yellow-600/90 backdrop-blur-sm text-white border border-yellow-500/30`}
          >
            {quality}
          </span>
        )}
      </div>

      {rating && (
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-white">{rating}</span>
        </div>
      )}
    </div>
  );
};

const MetaInfo = ({ year, duration }) => {
  const metaStyles = COMPONENT_STYLES.metaInfo;

  return (
    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-200 mb-1.5 md:mb-3">
      {year && (
        <div className={metaStyles.base}>
          <Calendar size={10} className={`${metaStyles.icon} md:w-3 md:h-3`} />
          <span className="font-semibold">{year}</span>
        </div>
      )}
      {duration && (
        <div className={`${metaStyles.base} hidden md:flex`}>
          <Clock size={12} className={metaStyles.icon} />
          <span className="font-semibold">{duration}</span>
        </div>
      )}
    </div>
  );
};

const GenreTags = ({ genre }) => {
  if (!genre?.length) return null;

  return (
    <div className="md:flex flex-wrap gap-1.5 justify-end hidden">
      {genre.map((g) => (
        <span
          key={g}
          className="px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/30 rounded-lg text-xs text-white font-semibold hover:bg-white/25 transition-colors duration-200 shadow-lg"
        >
          {g}
        </span>
      ))}
    </div>
  );
};

const PlayButtonOverlay = () => (
  <div
    className="absolute inset-0 z-20 md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden"
    aria-hidden="true"
  >
    <div className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/50 transform transition-transform duration-300 group-hover:scale-110">
      <Play size={28} className="text-white fill-white" />
    </div>
  </div>
);

export default function Card({
  media,
  className = "",
  isEpisode = false,
  isFilmCollection = false,
}) {
  // Film collection
  if (isFilmCollection) {
    const displayData = {
      image: media?.image || media?.films?.[0]?.image,
      name: media?.name,
      filmCount: media?.filmCount || media?.films?.length || 0,
      films: media?.films || [],
      avgRating: media?.films?.length
        ? (
            media.films.reduce((sum, film) => sum + (film.rating || 0), 0) /
            media.films.length
          ).toFixed(1)
        : null,
      yearRange: media?.films?.length
        ? (() => {
            const years = media.films
              .map((f) => f.releaseYear)
              .filter(Boolean)
              .sort();
            return years.length > 1
              ? `${years[0]} - ${years[years.length - 1]}`
              : years[0];
          })()
        : null,
    };

    const oldestFilm = media.films.reduce((oldest, current) => {
      return current.releaseYear < oldest.releaseYear ? current : oldest;
    });
    const slug = oldestFilm.slug;

    return (
      <CardWrapper href={`/${slug}`}>
        <div className="block cursor-pointer">
          <article
            className={`group relative rounded-xl transition-all duration-500 hover:scale-105 ${className}`}
          >
            <div
              className={`relative ${DESIGN_TOKENS.glass.light} shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 h-full rounded-xl`}
            >
              <div className="relative overflow-hidden aspect-[3/4] rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:from-purple-500/10 group-hover:via-pink-500/10 z-10 transition-all duration-500" />

                <img
                  src={displayData.image}
                  alt={displayData.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-xl"
                  loading="lazy"
                />

                <PlayButtonOverlay />
                <TopBadges
                  filmCount={displayData.filmCount}
                  rating={displayData.avgRating}
                />

                <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4">
                  <MetaInfo year={displayData.yearRange} />
                  <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 line-clamp-2 drop-shadow-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-300 text-right">
                    {displayData.name}
                  </h3>
                </div>
              </div>

              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
            </div>
          </article>
        </div>
      </CardWrapper>
    );
  }

  // Episode
  if (isEpisode) {
    const displayData = {
      image: media?.season?.image || media?.image,
      title: `الحلقة ${media?.episodeNumber}`,
      duration: media?.duration,
      episodeNumber: media?.episodeNumber,
      seasonNumber: media?.season?.seasonNumber,
      slug: media?.slug,
    };

    return (
      <CardWrapper href={`/${displayData.slug}`}>
        <div className="block cursor-pointer">
          <article
            className={`group relative rounded-xl transition-all duration-500 hover:scale-105 ${className}`}
          >
            <div
              className={`relative ${DESIGN_TOKENS.glass.light} shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 h-full rounded-xl`}
            >
              <div className="relative overflow-hidden aspect-[3/4] rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:from-cyan-500/10 group-hover:via-purple-500/10 z-10 transition-all duration-500" />

                <img
                  src={displayData.image}
                  alt={displayData.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-xl"
                  loading="lazy"
                />

                <PlayButtonOverlay />
                <TopBadges
                  episodeNumber={displayData.episodeNumber}
                  seasonNumber={displayData.seasonNumber}
                />

                <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4">
                  <MetaInfo duration={displayData.duration} />
                  <h3 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 line-clamp-2 drop-shadow-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all duration-300 text-right">
                    {displayData.title}
                  </h3>
                </div>
              </div>

              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-purple-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
            </div>
          </article>
        </div>
      </CardWrapper>
    );
  }

  // Regular media
  if (!media) return null;

  return (
    <CardWrapper href={`/${media?.slug}`}>
      <div className="block cursor-pointer">
        <article
          className={`group relative rounded-xl transition-all duration-500 hover:scale-105 ${className}`}
        >
          <div
            className={`relative ${DESIGN_TOKENS.glass.light} shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 h-full rounded-xl`}
          >
            <div className="relative overflow-hidden aspect-[3/4] rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent group-hover:from-cyan-500/10 group-hover:via-purple-500/10 z-10 transition-all duration-500" />

              <img
                src={media.image}
                alt={media.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-xl"
                loading="lazy"
              />

              <PlayButtonOverlay />
              <TopBadges
                isNew={media?.category?.isNew}
                quality={media.quality}
                rating={media.rating}
              />

              <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4">
                <MetaInfo year={media.releaseYear} duration={media.duration} />
                <h3 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 line-clamp-2 drop-shadow-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all duration-300 text-right">
                  {media.title}
                </h3>
                <GenreTags genre={media.genre} />
              </div>
            </div>

            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-purple-500/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          </div>
        </article>
      </div>
    </CardWrapper>
  );
}
