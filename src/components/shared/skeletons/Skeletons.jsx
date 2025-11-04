import { DESIGN_TOKENS } from "@/lib/data";

const SKELETON = {
  base: "animate-pulse",
  bg: "bg-white/10",
  bgLight: "bg-white/5",
  border: "border border-white/20",
};

const getGlassClass = (token) => {
  // Assumes token = "bg-white/10 backdrop-blur-md ..."
  return `bg-white/5 md:${token.replace("bg-", "bg-")}`;
};

export const SkeletonCard = () => (
  <div
    className={`${getGlassClass(
      DESIGN_TOKENS.glass.light
    )} rounded-lg overflow-hidden ${SKELETON.base}`}
  >
    <div className={`aspect-[2/3] ${SKELETON.bgLight}`} />
    <div className="p-3 space-y-2">
      <div className={`h-4 ${SKELETON.bg} rounded w-3/4`} />
      <div className={`h-3 ${SKELETON.bg} rounded w-1/2`} />
    </div>
  </div>
);

export const SkeletonCarousel = () => (
  <div className="mb-8">
    <div className="flex gap-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex-shrink-0 w-64 ${SKELETON.base} ${SKELETON.border} rounded-lg overflow-hidden`}
        >
          <div className={`aspect-video ${SKELETON.bg} rounded-lg`} />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonFilterBar = () => (
  <div
    className={`hidden lg:flex gap-2 mb-6 ${SKELETON.bg} rounded-xl lg:backdrop-blur-md ${SKELETON.border} px-4 py-3 ${SKELETON.base}`}
  >
    {[...Array(6)].map((_, i) => (
      <div key={i} className={`h-10 ${SKELETON.bgLight} rounded-lg w-24`} />
    ))}
  </div>
);

export const SkeletonPagination = () => (
  <div className={`flex justify-center gap-2 py-8 ${SKELETON.base}`}>
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`h-10 w-10 ${SKELETON.bg} rounded-lg`} />
    ))}
  </div>
);

export const SkeletonHero = () => (
  <div className="relative rounded-3xl">
    <div
      className={`absolute inset-0 ${getGlassClass(
        DESIGN_TOKENS.glass.medium
      )} shadow-lg rounded-3xl`}
    />
    <div className="relative p-6 sm:p-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <div className={`relative group ${SKELETON.base}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl" />
            <div
              className={`relative w-72 sm:w-80 lg:w-96 h-[400px] sm:h-[444px] lg:h-[533px] ${SKELETON.bgLight} rounded-xl shadow-2xl border-4 border-white/10`}
            />
          </div>
        </div>
        <div
          className={`flex-1 flex flex-col justify-center gap-6 ${SKELETON.base}`}
        >
          <div className="flex gap-2 mb-2">
            <div className={`h-7 w-20 ${SKELETON.bg} rounded-lg`} />
            <div className={`h-7 w-16 ${SKELETON.bg} rounded-lg`} />
          </div>
          <div className="space-y-3">
            <div
              className={`h-10 sm:h-12 lg:h-14 ${SKELETON.bg} rounded-lg w-3/4`}
            />
            <div
              className={`h-10 sm:h-12 lg:h-14 ${SKELETON.bg} rounded-lg w-2/3`}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-32 ${SKELETON.bg} rounded-xl`} />
            <div className={`h-12 w-24 ${SKELETON.bg} rounded-xl`} />
          </div>
          <div className="space-y-2">
            <div className={`h-4 ${SKELETON.bg} rounded w-full`} />
            <div className={`h-4 ${SKELETON.bg} rounded w-5/6`} />
            <div className={`h-4 ${SKELETON.bg} rounded w-4/6`} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={`h-3 ${SKELETON.bg} rounded w-16`} />
                <div className={`h-4 ${SKELETON.bg} rounded w-28`} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className={`h-12 w-36 ${SKELETON.bg} rounded-xl`} />
            <div className={`h-12 w-28 ${SKELETON.bg} rounded-xl`} />
          </div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-10 w-10 ${SKELETON.bg} rounded-lg`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonRelated = () => (
  <div className="relative">
    <div className="mb-8">
      <div
        className={`h-9 w-48 ${SKELETON.bg} rounded-lg ${SKELETON.base} ml-auto`}
      />
      <div className="h-1 bg-gradient-to-l from-cyan-500/30 via-purple-500/30 to-transparent rounded-full mt-3" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);
