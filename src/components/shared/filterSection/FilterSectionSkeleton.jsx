import React from "react";
import { SkeletonCard } from "../skeletons/Skeletons";

const SkeletonCarousel = () => (
  <div className="mb-8">
    <div className="h-6 bg-white/10 rounded w-32 mb-4 animate-pulse" />
    <div className="flex gap-4 overflow-hidden ">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-64 animate-pulse border border-white/20 rounded-lg overflow-hidden"
        >
          <div className="aspect-video bg-white/10 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonFilterBar = () => (
  <div className="hidden lg:flex gap-2 mb-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 px-4 py-3 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-10 bg-white/5 rounded-lg w-24" />
    ))}
  </div>
);

export default function FilterSectionSkeleton() {
  return (
    <div className="p-4 md:p-6">
      {/* Carousel Skeleton */}
      <SkeletonCarousel />

      {/* Mobile Filter Button Skeleton */}
      <div className="lg:hidden mb-4 h-12 bg-white/10 rounded-xl animate-pulse" />

      {/* Desktop Filter Bar Skeleton */}
      <SkeletonFilterBar />

      {/* Grid of Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
        {[...Array(12)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2 py-8 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-10 bg-white/10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
