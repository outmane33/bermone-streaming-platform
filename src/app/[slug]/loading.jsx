import { SkeletonCard } from "@/components/shared/skeletons/Skeletons";
import React from "react";

// Hero Section Skeleton
const SkeletonHero = () => (
  <div className="relative rounded-3xl">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-3xl" />

    <div className="relative p-6 sm:p-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Poster Skeleton */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <div className="relative group animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl" />
            <div className="relative w-72 sm:w-80 lg:w-96 h-[400px] sm:h-[444px] lg:h-[533px] bg-white/5 rounded-xl shadow-2xl border-4 border-white/10" />
          </div>
        </div>

        {/* Info Section Skeleton */}
        <div className="flex-1 flex flex-col justify-center gap-6 animate-pulse">
          {/* Badges */}
          <div className="flex gap-2 mb-2">
            <div className="h-7 w-20 bg-white/10 rounded-lg" />
            <div className="h-7 w-16 bg-white/10 rounded-lg" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="h-10 sm:h-12 lg:h-14 bg-white/10 rounded-lg w-3/4" />
            <div className="h-10 sm:h-12 lg:h-14 bg-white/10 rounded-lg w-2/3" />
          </div>

          {/* Rating & Duration */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-32 bg-white/10 rounded-xl" />
            <div className="h-12 w-24 bg-white/10 rounded-xl" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-5/6" />
            <div className="h-4 bg-white/10 rounded w-4/6" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-white/10 rounded w-16" />
                <div className="h-4 bg-white/10 rounded w-28" />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <div className="h-12 w-36 bg-white/10 rounded-xl" />
            <div className="h-12 w-28 bg-white/10 rounded-xl" />
          </div>

          {/* Social Share */}
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-10 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Related Section Skeleton
const SkeletonRelated = () => (
  <div className="relative">
    {/* Section Header */}
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div></div>
        <div className="h-9 w-48 bg-white/10 rounded-lg animate-pulse" />
      </div>
      <div className="h-1 bg-gradient-to-l from-cyan-500/30 via-purple-500/30 to-transparent rounded-full mt-3"></div>
    </div>

    {/* Cards Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Main Loading Component
export default function Loading() {
  return (
    <div className="space-y-6 mb-12">
      <SkeletonHero />
      <SkeletonRelated />
    </div>
  );
}
