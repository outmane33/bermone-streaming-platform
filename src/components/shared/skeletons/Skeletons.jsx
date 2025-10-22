// Shared Skeleton Card Component
export const SkeletonCard = () => (
  <div className="rounded-lg overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 animate-pulse">
    <div className="aspect-[2/3] bg-white/5" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  </div>
);
