import { DESIGN_TOKENS } from "@/lib/data";
import {
  SkeletonCard,
  SkeletonCarousel,
  SkeletonFilterBar,
  SkeletonPagination,
} from "../skeletons/Skeletons";

// components/shared/skeletons/Skeletons.jsx
export function SkeletonFilterSection() {
  return (
    <div className="space-y-8">
      <SkeletonCarousel />

      {/* Filter skeleton */}
      <SkeletonFilterBar />

      {/* Grid skeleton */}
      <div className={DESIGN_TOKENS.grid.container}>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Pagination skeleton */}
      <SkeletonPagination />
    </div>
  );
}
