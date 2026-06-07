import { HeroBadges } from "./HeroBadges";
import HeroDetailsGrid from "./HeroDetailsGrid";
import SocialShare from "./SocialShare";
import Button from "./Button";
import MediaActionButton from "./MediaActionButton";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { handleWatch, handleDownload } from "@/actions/mediaActions";
import SeasonDownloadButton from "../Season Download Button/SeasonDownloadButton";

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
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
      partOfTVSeries: { "@type": "TVSeries", name: media.seriesTitle },
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
      partOfTVSeries: { "@type": "TVSeries", name: media.seriesTitle },
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
  const contentTypeLabel =
    type?.toUpperCase() === "FILM"
      ? "فيلم"
      : media?.seriesSlug?.includes("انمي") || media?.slug?.includes("انمي")
        ? "انمي"
        : "مسلسل";
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
    rating: media?.rating || null,
    duration: media?.duration,
    story: media?.description,
    category,
    genre: media?.genre || null,
    country: media?.country,
    language: media?.language,
    isLastEpisode: media?.isLastEpisode || false,
    episodeType: media?.episodeType || null,
  };

  // Pre-bind server actions — slug never rendered in HTML
  const watchAction = handleWatch.bind(null, media.slug);
  const downloadAction = handleDownload.bind(null, media.slug);

  const jsonLd = generateJsonLd(media, type);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative rounded-3xl border border-white/30">
        <div className="absolute inset-0 bg-white/5 md:bg-white/10 md:backdrop-blur-md shadow-lg rounded-3xl" />

        <div className="relative p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Poster */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="relative group w-72 sm:w-80 lg:w-96 h-[400px] sm:h-[444px] lg:h-[533px]">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${DESIGN_TOKENS.gradients.cyan}/20 to-purple-500/20 rounded-xl`}
                />
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGES_URL}/${mappedMedia.poster}`}
                  alt={getAltText(media, type)}
                  fill
                  className="relative object-cover rounded-xl shadow-2xl border-4 border-white/10 transition-transform duration-300"
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
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mr-2">
                    {contentTypeLabel} •{" "}
                  </span>
                  {mappedMedia.title}
                  {mappedMedia.isLastEpisode && (
                    <span className="text-2xl sm:text-3xl text-red-400 mr-3">
                      • الحلقة الأخيرة
                    </span>
                  )}
                  {mappedMedia.episodeType === "فلر" && (
                    <span className="text-2xl sm:text-3xl text-yellow-400 mr-3">
                      • حلقة فلر
                    </span>
                  )}
                  {mappedMedia.episodeType === "حلقة خاصة" && (
                    <span className="text-2xl sm:text-3xl text-pink-400 mr-3">
                      • حلقة خاصة
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  {mappedMedia.rating > 0 && (
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
                  )}
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

              <div className="flex items-center justify-between">
                {(type?.toUpperCase() === "FILM" ||
                  type?.toUpperCase() === "EPISODE") && (
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {/* ✅ Watch — no URL in HTML */}
                    <MediaActionButton
                      action={watchAction}
                      className="group relative font-semibold overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer px-3 lg:px-6 py-2 lg:py-2.5 text-base bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    >
                      <span className="flex items-center gap-2 lg:gap-3 justify-center">
                        <ICON_MAP.Play size={24} className="fill-white" />
                        <span>مشاهدة الآن</span>
                      </span>
                    </MediaActionButton>

                    {/* ✅ Download — no URL in HTML */}
                    <MediaActionButton
                      action={downloadAction}
                      className="group relative font-semibold overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer px-3 lg:px-6 py-2 lg:py-2.5 text-base border border-white/30 text-white bg-white/10 hover:bg-white/20"
                    >
                      <span className="flex items-center gap-2 lg:gap-3 justify-center">
                        <ICON_MAP.ArrowDownToLine size={24} />
                        <span>تحميل</span>
                      </span>
                    </MediaActionButton>
                  </div>
                )}

                {(type?.toUpperCase() === "SEASON" ||
                  type?.toUpperCase() === "EPISODE") && (
                  <Link href={`${seriesSlug}`}>
                    <Button variant="secondary" icon={ICON_MAP.ArrowLeft}>
                      عودة إلى السلسلة
                    </Button>
                  </Link>
                )}

                {type?.toUpperCase() === "SEASON" &&
                  (media?.links?.length > 0 || media?.services?.length > 0) && (
                    <SeasonDownloadButton slug={media.slug} />
                  )}
              </div>

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
