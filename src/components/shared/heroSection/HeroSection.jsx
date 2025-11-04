import { HeroBadges } from "./HeroBadges";
import HeroDetailsGrid from "./HeroDetailsGrid";
import SocialShare from "./SocialShare";
import Button from "./Button";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Link from "next/link";

const getAltText = (media, type) => {
  const year = media.releaseYear || "";
  if (type === "EPISODE") {
    return `صورة من مسلسل ${media.title} الموسم ${media.seasonNumber} الحلقة ${media.episodeNumber} ${year}`;
  } else if (type === "SEASON") {
    return `ملصق مسلسل ${media.title} الموسم ${media.seasonNumber} ${year}`;
  } else {
    return `ملصق ${type === "FILM" ? "فيلم" : "مسلسل"} ${media.title} ${year}`;
  }
};

const generateJsonLd = (media, type) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/";
  const fullImageUrl = media.image?.startsWith("http")
    ? media.image
    : `${baseUrl}${media.image}`;

  if (type === "EPISODE") {
    return {
      "@context": "https://schema.org",
      "@type": "TVEpisode",
      name: media.title,
      partOfSeason: {
        "@type": "TVSeason",
        name: `الموسم ${media.seasonNumber}`,
      },
      partOfTVSeries: {
        "@type": "TVSeries",
        name: media.seriesTitle,
      },
      episodeNumber: media.episodeNumber,
      image: fullImageUrl,
      description: media.description,
      datePublished: `${media.releaseYear}-01-01`,
    };
  } else if (type === "SEASON") {
    return {
      "@context": "https://schema.org",
      "@type": "TVSeason",
      name: media.title,
      partOfTVSeries: {
        "@type": "TVSeries",
        name: media.seriesTitle,
      },
      seasonNumber: media.seasonNumber,
      image: fullImageUrl,
      description: media.description,
      datePublished: `${media.releaseYear}-01-01`,
    };
  } else if (type === "SERIES") {
    return {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      name: media.title,
      image: fullImageUrl,
      description: media.description,
      genre: media.genre || [],
      datePublished: `${media.releaseYear}-01-01`,
    };
  } else {
    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      name: media.title,
      image: fullImageUrl,
      description: media.description,
      genre: media.genre || [],
      datePublished: `${media.releaseYear}-01-01`,
      duration: media.duration ? `PT${media.duration}M` : undefined,
    };
  }
};

export default function HeroSection({ media, type, seriesSlug }) {
  const category = media?.category?.isForeignmovies
    ? "افلام اجنبي"
    : media?.category?.isAsianmovies
    ? "افلام اسيوي"
    : media?.category?.isAnimemovies
    ? "افلام انمي"
    : media?.category?.isForeignseries
    ? "مسلسلات اجنبية"
    : media?.category?.isAsianseries
    ? "مسلسلات اسيوية"
    : media?.category?.isAnimeseries
    ? "مسلسلات انمي"
    : null;

  const mappedMedia = {
    poster: media?.image,
    title: media?.title || media?.originalTitle,
    isNew: media?.category?.isNew || false,
    year: media?.releaseYear,
    rating: media?.rating || 0,
    duration: media?.duration,
    story: media?.description,
    category,
    genre: media?.genre || null,
    country: media?.country,
    language: media?.language,
    isLastEpisode: media?.isLastEpisode || false,
  };

  const jsonLd = generateJsonLd(media, type);
  console.log(media);
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative rounded-3xl">
        {seriesSlug && (
          <Link
            href={`/${seriesSlug}`}
            className={`
      absolute top-4 right-4 z-30
      flex items-center gap-2
      bg-white/15 md:${DESIGN_TOKENS.glass.light.replace("bg-", "bg-")}
      rounded-lg
      px-3 py-2
      text-white font-semibold text-sm
      ${DESIGN_TOKENS.effects.transition}
      ${DESIGN_TOKENS.effects.hoverLift}
    `}
            aria-label="عودة إلى السلسلة"
          >
            <ICON_MAP.ArrowLeft size={16} className="text-white" />
            <span>العودة إلى السلسلة</span>
          </Link>
        )}
        <div
          className={`absolute inset-0 
          bg-white/5 md:bg-white/10 md:backdrop-blur-md
          shadow-lg rounded-3xl`}
        />

        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Poster */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${DESIGN_TOKENS.gradients.cyan}/20 to-purple-500/20 rounded-xl`}
                />
                <img
                  src={mappedMedia.poster}
                  alt={getAltText(media, type)}
                  className={`relative w-72 sm:w-80 lg:w-96 h-[400px] sm:h-[444px] lg:h-[533px] object-cover rounded-xl shadow-2xl border-4 border-white/10 transition-transform duration-300`}
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 flex flex-col justify-center gap-6 text-white">
              <div>
                <HeroBadges
                  isNew={mappedMedia.isNew}
                  isLastEpisode={mappedMedia.isLastEpisode}
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                  {mappedMedia.title}
                  {mappedMedia.isLastEpisode && (
                    <span className="text-2xl sm:text-3xl text-red-400 mr-3">
                      • الحلقة الأخيرة
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-500/30">
                    <ICON_MAP.Star
                      size={24}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="text-2xl font-bold">
                      {mappedMedia.rating}
                    </span>
                    <span className="text-sm text-gray-300">/10</span>
                  </div>
                  {mappedMedia?.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <ICON_MAP.Clock size={18} />
                      <span className="font-semibold">
                        {mappedMedia.duration}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-100 leading-relaxed text-right font-semibold">
                {mappedMedia.story}
              </p>

              <HeroDetailsGrid media={mappedMedia} />

              {(type === "film" || type === "episode") && (
                <div className="flex flex-wrap gap-4">
                  <Link href={`${media.slug}/watch`}>
                    <Button variant="primary" icon={ICON_MAP.Play}>
                      مشاهدة الآن
                    </Button>
                  </Link>
                  <Link href={`${media.slug}/download`}>
                    <Button variant="secondary" icon={ICON_MAP.ArrowDownToLine}>
                      تحميل
                    </Button>
                  </Link>
                </div>
              )}

              <SocialShare
                shareTitle={mappedMedia.title}
                shareDescription={mappedMedia.story}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
