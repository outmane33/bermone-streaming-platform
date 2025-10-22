// app/[slug]/download/page.js (Server Component)
import { Download } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";
import { getAvailableQualities } from "@/actions/download";
import { notFound } from "next/navigation";
import SecureDownloadClient from "@/components/download/SecureDownloadClient";

const BlurBg = ({ position = "top", size = "96" }) => {
  const posClass = position === "top" ? "top-0 left-0" : "bottom-0 right-0";
  const gradient =
    position === "top"
      ? "from-cyan-500/10 to-purple-500/10"
      : "from-pink-500/10 to-purple-500/10";

  return (
    <div
      className={`absolute ${posClass} w-${size} h-${size} bg-gradient-to-br ${gradient} rounded-full blur-3xl`}
    />
  );
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getAvailableQualities(slug);

  if (!result.success) {
    return {
      title: "Download Not Found",
    };
  }

  return {
    title: `Download - ${decodeURIComponent(slug)}`,
    description: `Download in multiple qualities and servers`,
  };
}

export default async function DownloadPage({ params }) {
  const { slug } = await params;
  //wait 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // STEP 1: Only fetch available qualities
  const result = await getAvailableQualities(slug);

  if (!result.success || result.qualities.length === 0) {
    notFound();
  }

  return (
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

            {/* Header */}
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

            {/* Client Component - Pass only qualities and slug */}
            <SecureDownloadClient
              qualities={result.qualities}
              slug={slug}
              contentType={result.type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
