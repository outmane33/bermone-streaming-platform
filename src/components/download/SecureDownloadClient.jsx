"use client";
import React, { useState } from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import { getServicesForQuality, getDownloadLinks } from "@/actions/download";
import ServerSelector from "./ServerSelector";
import QualitySelector from "./QualitySelector";

const decodeDownloadLink = (encodedLink) => {
  try {
    if (
      encodedLink.startsWith("http://") ||
      encodedLink.startsWith("https://")
    ) {
      return encodedLink;
    }
    const decoded = atob(encodedLink);
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    } else {
      console.error("❌ Decoded value is not a valid URL:", decoded);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to decode link:", error);
    return null;
  }
};

const Section = ({ title, icon: Icon, children, step }) => (
  <div className="relative mb-8">
    <div className="flex items-center gap-2 mb-4">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} text-white font-bold text-sm`}
      >
        {step}
      </div>
      {Icon && <Icon className="w-5 h-5 text-white/80" />}
      <p className="text-white/80 text-sm font-semibold">{title}</p>
    </div>
    {children}
  </div>
);

export default function SecureDownloadClient({ qualities, slug }) {
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const handleQualitySelect = async (quality, index) => {
    setSelectedQuality(index);
    setSelectedService(null);
    setShowDownloadButton(false);
    setDownloadLinks(null);
    setLoadingServices(true);

    try {
      const result = await getServicesForQuality(slug, quality);
      setAvailableServices(result.success ? result.services : []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setAvailableServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServiceSelect = (_service, index) => {
    setSelectedService(index);
    setShowDownloadButton(true);
    setDownloadLinks(null);
  };

  const handleDownloadClick = async () => {
    setLoadingLinks(true);
    setCountdown(3);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const result = await getDownloadLinks(
        slug,
        qualities[selectedQuality],
        availableServices[selectedService].serviceName
      );
      if (result.success) setDownloadLinks(result.links);
    } catch (error) {
      console.error("Error fetching download links:", error);
    } finally {
      setLoadingLinks(false);
    }
  };

  return (
    <div className="relative">
      <Section title="Select Quality" icon={ICON_MAP.Film} step={1}>
        <QualitySelector
          qualities={qualities}
          selectedQuality={selectedQuality}
          onSelect={handleQualitySelect}
          loading={loadingServices}
        />
      </Section>

      {selectedQuality !== null && (
        <Section title="Select Server" icon={ICON_MAP.Server} step={2}>
          <ServerSelector
            services={availableServices}
            selectedService={selectedService}
            onSelect={handleServiceSelect}
            loading={loadingLinks}
          />
        </Section>
      )}

      {showDownloadButton && !downloadLinks && (
        <Section title="Get Download Links" icon={ICON_MAP.Shield} step={3}>
          <button
            onClick={handleDownloadClick}
            disabled={loadingLinks}
            className={`w-full p-6 rounded-xl cursor-pointer ${
              loadingLinks
                ? "bg-white/10 cursor-wait"
                : `bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} hover:from-cyan-600 hover:to-blue-700`
            } text-white font-bold text-lg flex items-center justify-center gap-3 ${
              DESIGN_TOKENS.effects.hoverScale
            } ${DESIGN_TOKENS.effects.transition}`}
          >
            {loadingLinks ? (
              <>
                <ICON_MAP.Lock className="w-6 h-6 animate-pulse" />
                {countdown !== null ? (
                  <span>Verifying... {countdown}s</span>
                ) : (
                  <span>Processing...</span>
                )}
              </>
            ) : (
              <>
                <ICON_MAP.Download className="w-6 h-6" />
                <span>Get Download Links</span>
              </>
            )}
          </button>
        </Section>
      )}

      {downloadLinks && (
        <Section title="Download Links Ready" icon={ICON_MAP.Download} step={4}>
          <div className="space-y-3">
            <div
              className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-6 ${DESIGN_TOKENS.glass.hover} ${DESIGN_TOKENS.effects.transition}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <ICON_MAP.CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-white">
                    {downloadLinks.serviceName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {downloadLinks.quality}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {downloadLinks.encodedDownloadLink ? (
                  <button
                    onClick={() => {
                      const decodedUrl = decodeDownloadLink(
                        downloadLinks.encodedDownloadLink
                      );
                      if (decodedUrl) {
                        window.open(
                          decodedUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${DESIGN_TOKENS.gradients.purple} hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-colors shadow-lg`}
                  >
                    <ICON_MAP.Download className="w-5 h-5" />
                    Download Now
                  </button>
                ) : (
                  <div className="text-red-400">
                    ❌ No download link available
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
