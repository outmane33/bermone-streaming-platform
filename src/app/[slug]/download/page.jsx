import { Suspense } from "react";
import { Download } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";
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
      {/* 🔒 Extra safety: noindex meta tag (redundant but safe) */}
      <meta name="robots" content="noindex, nofollow" />

      <div className="relative overflow-hidden w-full">
        <BlurBg position="top" size="96" />
        <BlurBg position="bottom" size="96" />

        <div className="px-2 sm:px-4 flex items-center justify-center w-full">
          <div className="w-full">
            <div
              className={`relative ${DESIGN_TOKENS.glass.medium} rounded-2xl p-6 sm:p-8 shadow-2xl`}
            >
              <BlurBg position="top" size="32" />
              <BlurBg position="bottom" size="40" />

              <div className="relative mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-3 bg-gradient-to-r ${DESIGN_TOKENS.gradients.purple} rounded-xl`}
                  >
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Secure Download
                    </h1>
                    <p className="text-white/60 text-sm">
                      Select quality and server to proceed
                    </p>
                  </div>
                </div>

                <div
                  className={`h-1 bg-gradient-to-r ${DESIGN_TOKENS.gradients.purple} via-purple-500 to-pink-500 rounded-full`}
                />
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
