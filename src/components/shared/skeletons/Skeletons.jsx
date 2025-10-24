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

export const SkeletonCarousel = () => (
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

export const SkeletonFilterBar = () => (
  <div className="hidden lg:flex gap-2 mb-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 px-4 py-3 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-10 bg-white/5 rounded-lg w-24" />
    ))}
  </div>
);

export const SkeletonPagination = () => (
  <div className="flex justify-center gap-2 py-8 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 w-10 bg-white/10 rounded-lg" />
    ))}
  </div>
);
