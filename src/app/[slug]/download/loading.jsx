import { DESIGN_TOKENS } from "@/lib/data";

// Main Loading Component for Download Page
export default function Loading() {
  return (
    <div className="relative overflow-hidden w-full">
      {/* Background Blur Effects */}
      <div
        className={`absolute top-0 left-0 w-96 h-96 bg-gradient-to-br  rounded-full blur-3xl`}
      />
      <div
        className={`absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br  rounded-full blur-3xl`}
      />

      <div className="px-2 sm:px-4 flex items-center justify-center w-full">
        <div className="w-full">
          <div
            className={`relative ${DESIGN_TOKENS.glass.light} rounded-2xl p-6 sm:p-8 shadow-2xl`}
          >
            {/* Inner Blur Effects */}
            <div
              className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br  rounded-full blur-3xl`}
            />
            <div
              className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br  rounded-full blur-3xl`}
            />

            {/* Header Skeleton */}
            <div className="relative mb-6 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}/20 rounded-xl`}
                />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-white/10 rounded-lg w-40" />
                  <div className="h-4 bg-white/10 rounded-lg w-56" />
                </div>
              </div>
              <div
                className={`h-1 bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}/30 ${DESIGN_TOKENS.gradients.purple}/30 ${DESIGN_TOKENS.gradients.pink}/30 rounded-full`}
              />
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
