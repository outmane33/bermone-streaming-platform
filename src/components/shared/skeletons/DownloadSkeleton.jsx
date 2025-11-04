import { DESIGN_TOKENS } from "@/lib/data";

export default function DownloadSkeleton() {
  return (
    <div className="relative">
      {/* Step 1: Quality Selection Skeleton */}
      <div className="relative mb-8">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}/20`}
          />
          <div className="w-4 h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded-lg w-32" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl ${DESIGN_TOKENS.glass.light} backdrop-blur-md animate-pulse`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/10 rounded" />
                  <div className="h-5 bg-white/10 rounded w-16" />
                </div>
                <div className="w-6 h-6 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Server Selection Skeleton (faded) */}
      <div className="relative mb-8 opacity-50">
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}/20`}
          />
          <div className="w-4 h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded-lg w-32" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl ${DESIGN_TOKENS.glass.light} backdrop-blur-md animate-pulse`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 bg-white/10 rounded-lg" />
                <div className="h-4 bg-white/10 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-white/60 animate-pulse">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
          <span className="text-sm">Loading available qualities...</span>
        </div>
      </div>
    </div>
  );
}
