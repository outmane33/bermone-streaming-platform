import { Suspense } from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import DownloadContentWrapper from "@/components/download/DownloadContentWrapper";
import DownloadSkeleton from "@/components/shared/skeletons/DownloadSkeleton";
import { BlurBg } from "@/components/media/BlurBg";

export async function generateMetadata() {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DownloadPage({ params }) {
  const { slug } = await params;

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />

      <div className="relative overflow-hidden w-full min-h-[100dvh] flex flex-col">
        <BlurBg position="top" size="96" />
        <BlurBg position="bottom" size="96" />

        <div className="flex-1 px-1 sm:px-4 pt-4 pb-6 flex items-start justify-center">
          <div className="w-full">
            <div
              className={`relative ${DESIGN_TOKENS.glass.medium} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl`}
            >
              <BlurBg position="top" size="32" />
              <BlurBg position="bottom" size="40" />

              <div className="relative mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 sm:p-3 bg-gradient-to-r ${DESIGN_TOKENS.glass.medium} rounded-xl`}
                  >
                    <ICON_MAP.Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      تنزيل
                    </h1>
                    <p className="text-white/60 text-xs sm:text-sm">
                      اختر الجودة والسيرفر للمتابعة
                    </p>
                  </div>
                </div>

                <div className="h-0.5 sm:h-1 bg-gradient-to-l from-cyan-500 via-purple-500 to-transparent rounded-full mt-2 sm:mt-3"></div>
              </div>

              <Suspense fallback={<DownloadSkeleton />}>
                <DownloadContentWrapper slug={slug} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
