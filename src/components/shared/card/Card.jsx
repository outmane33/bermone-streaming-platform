"use client";

import { COMPONENT_STYLES, ICON_MAP } from "@/lib/data";
import CardWrapper from "./CardWrapper";
import Image from "next/image";

const TopBadges = ({
  isNew,
  rating,
  episodeNumber,
  seasonNumber,
  filmCount,
  mergedEpisodes,
}) => {
  const badgeStyles = COMPONENT_STYLES.badge;

  return (
    <div className="absolute top-3 left-3 right-3 z-20 md:flex items-start justify-between hidden">
      <div className="flex flex-col gap-2">
        {filmCount && (
          <span
            className={`${badgeStyles.base} bg-black/40 border border-purple-500/30 flex items-center gap-1.5`}
          >
            <ICON_MAP.Film size={14} />
            {filmCount} أفلام
          </span>
        )}
        {episodeNumber && (
          <span
            className={`${badgeStyles.base} ${badgeStyles.variants.episode}`}
          >
            {mergedEpisodes?.length > 0 ? (
              `${seasonNumber && `S${seasonNumber}`} E${mergedEpisodes.join(
                "-"
              )}`
            ) : (
              <>
                {seasonNumber && `S${seasonNumber}`} E{episodeNumber}
              </>
            )}
          </span>
        )}
      </div>

      {rating && (
        <div
          className={`flex items-center gap-1 ${COMPONENT_STYLES.metaInfo.base} px-2.5 py-1.5 rounded-full`}
        >
          <ICON_MAP.Star
            size={14}
            className="text-yellow-400 fill-yellow-400"
          />
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
          <ICON_MAP.Calendar
            size={10}
            className={`${metaStyles.icon} md:w-3 md:h-3`}
          />
          <span className="font-semibold">{year}</span>
        </div>
      )}
      {duration && (
        <div className={`${metaStyles.base} hidden md:flex`}>
          <ICON_MAP.Clock size={12} className={metaStyles.icon} />
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
          className="px-2.5 py-1 bg-black/30 text-white font-semibold rounded-lg text-xs transition-colors duration-200 shadow-lg"
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
    <div className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-2xl shadow-cyan-500/50 transform transition-transform duration-300 group-hover:scale-110">
      <ICON_MAP.Play size={28} className="text-white fill-white" />
    </div>
  </div>
);

const CardContainer = ({
  children,
  href,
  className = "",
  onNavigateComplete,
}) => (
  <CardWrapper href={href} onNavigateComplete={onNavigateComplete}>
    <div className="block cursor-pointer">
      <article
        className={`group relative rounded-xl transition duration-500 hover:scale-[1.02] ${className}`}
      >
        {children}
      </article>
    </div>
  </CardWrapper>
);

const CardContent = ({ image, title, children }) => (
  <div className="relative bg-black/30 backdrop-blur-sm md:bg-black/30 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition duration-500 h-full rounded-xl">
    <div className="relative overflow-hidden aspect-[3/4] rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 transition duration-500" />
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        className="object-cover transition duration-700 group-hover:scale-110 rounded-xl"
        loading="lazy"
      />
      <PlayButtonOverlay />
      {children}
    </div>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-purple-500/0 opacity-0 group-hover:opacity-20 transition duration-500 pointer-events-none" />
  </div>
);

export default function Card({
  media,
  className = "",
  isEpisode = false,
  isFilmCollection = false,
  onNavigateComplete,
}) {
  if (!media) return null;
  const content = media?.slug?.includes("مسلسل") ? "مسلسل" : "فيلم";

  if (isFilmCollection) {
    const films = media?.films || [];
    const oldestFilm = films.reduce(
      (oldest, current) =>
        current.releaseYear < oldest.releaseYear ? current : oldest,
      films[0] || {}
    );
    const years = films
      .map((f) => f.releaseYear)
      .filter(Boolean)
      .sort();
    const yearRange =
      years.length > 1 ? `${years[0]} - ${years[years.length - 1]}` : years[0];
    const avgRating = films.length
      ? (
          films.reduce((sum, film) => sum + (film.rating || 0), 0) /
          films.length
        ).toFixed(1)
      : null;

    return (
      <CardContainer
        href={`/${oldestFilm.slug}`}
        className={className}
        onNavigateComplete={onNavigateComplete}
      >
        <CardContent
          image={media?.image || films[0]?.image}
          title={media?.name}
        >
          <TopBadges filmCount={films.length} rating={avgRating} />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4">
            <MetaInfo year={yearRange} />
            <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 line-clamp-2 drop-shadow-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition text-right">
              {media?.name}
            </h3>
          </div>
        </CardContent>
      </CardContainer>
    );
  }

  if (isEpisode) {
    return (
      <CardContainer
        href={`/${media?.slug}`}
        className={className}
        onNavigateComplete={onNavigateComplete}
      >
        <CardContent
          image={media?.season?.image || media?.image}
          title={`الحلقة ${media?.episodeNumber}`}
        >
          <TopBadges
            episodeNumber={media?.episodeNumber}
            seasonNumber={media?.season?.seasonNumber}
            mergedEpisodes={media?.mergedEpisodes}
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4">
            <MetaInfo duration={media?.duration} />
            <h3
              className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 line-clamp-2 drop-shadow-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text transition text-right"
              dir="rtl"
            >
              مسلسل {media?.series?.title} الموسم {media?.season?.seasonNumber}{" "}
              الحلقة {media?.episodeNumber} مترجمة
            </h3>
          </div>
        </CardContent>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      href={`/${media?.slug}`}
      className={className}
      onNavigateComplete={onNavigateComplete}
    >
      <CardContent image={media.image} title={media.title}>
        <TopBadges isNew={media?.category?.isNew} rating={media.rating} />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-4">
          <MetaInfo year={media.releaseYear} duration={media.duration} />
          <h3
            className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 line-clamp-2 drop-shadow-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300 group-hover:bg-clip-text transition text-right"
            dir="rtl"
          >
            {content === "فيلم"
              ? `فيلم ${media.title} ${media.releaseYear} مترجم`
              : `مسلسل ${media.title} مترجم`}
          </h3>
          <GenreTags genre={media.genre} />
        </div>
      </CardContent>
    </CardContainer>
  );
}
