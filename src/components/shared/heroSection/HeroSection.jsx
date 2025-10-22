"use client";

import { Star, Clock, Play, ArrowDownToLine } from "lucide-react";
import { HeroBadges } from "./HeroBadges";
import HeroDetailsGrid from "./HeroDetailsGrid";
import SocialShare from "./SocialShare";
import Button from "./Button";
import { GLASS_STYLES } from "@/lib/data";

export default function HeroSection({ media, type = "movie" }) {
  console.log(media);
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
  // Map database fields to component structure
  const mappedMedia = {
    poster: media?.image,
    title: media?.title || media?.originalTitle,
    isNew: media?.category?.isNew || false,
    year: media?.releaseYear,
    rating: media?.rating || 0,
    duration: media?.duration,
    story: media?.description,
    category: category,
    genre: media?.genre || null,
    country: media?.country,
    language: media?.language,
    isLastEpisode: media?.isLastEpisode || false, // Add last episode flag
  };

  return (
    <div className="relative rounded-3xl">
      <div
        className={`absolute inset-0 ${GLASS_STYLES.light} shadow-lg rounded-3xl`}
      />

      <div className="relative p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl" />
              <img
                src={mappedMedia.poster}
                alt={mappedMedia.title}
                className="relative w-72 sm:w-80 lg:w-96 h-[400px] sm:h-[444px] lg:h-[533px] object-cover rounded-xl shadow-2xl border-4 border-white/10 transition-all duration-700"
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
                  <Star size={24} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold">
                    {mappedMedia.rating}
                  </span>
                  <span className="text-sm text-gray-300">/10</span>
                </div>
                {mappedMedia?.duration && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock size={18} />
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
            {type === "movie" && (
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" icon={Play}>
                  مشاهدة الآن
                </Button>
                <Button variant="secondary" icon={ArrowDownToLine}>
                  تحميل
                </Button>
              </div>
            )}

            <SocialShare />
          </div>
        </div>
      </div>
    </div>
  );
}
