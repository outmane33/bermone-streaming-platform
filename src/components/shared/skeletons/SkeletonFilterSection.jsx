import { DESIGN_TOKENS } from "@/lib/data";
import {
  SkeletonCard,
  SkeletonCarousel,
  SkeletonFilterBar,
  SkeletonPagination,
} from "./Skeletons";

export function SkeletonFilterSection() {
  return (
    <div className="space-y-8">
      <SkeletonCarousel />

      <SkeletonFilterBar />

      <div className={DESIGN_TOKENS.grid.container}>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <SkeletonPagination />
    </div>
  );
}
