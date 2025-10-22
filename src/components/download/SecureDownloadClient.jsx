// components/download/SecureDownloadClient.js (Client Component)
"use client";
import React, { useState } from "react";
import {
  CheckCircle,
  Film,
  Server,
  Download,
  Loader2,
  Lock,
  Shield,
} from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";
import {
  getServicesForQuality,
  getDownloadLinks,
  logDownloadAction,
} from "@/actions/download";

const ButtonBase = ({ children, className = "", ...props }) => (
  <button
    className={`${DESIGN_TOKENS.effects.transition} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const QualityButton = ({ quality, isSelected, onClick, disabled }) => {
  const states = isSelected
    ? "bg-white/20 border-white/40 scale-95 shadow-2xl border-2"
    : disabled
    ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
    : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-95 hover:shadow-xl border";

  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-xl backdrop-blur-md overflow-hidden ${states}`}
      aria-label={`Select quality ${quality}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <Film
            className={`w-5 h-5 ${
              isSelected ? "text-cyan-400" : "text-white/80"
            }`}
          />
          <div className="text-right">
            <p className="text-white font-bold text-lg">{quality}</p>
          </div>
        </div>
        {isSelected && (
          <CheckCircle className="w-6 h-6 text-cyan-400 animate-pulse" />
        )}
      </div>
    </ButtonBase>
  );
};

const ServerButton = ({ server, isSelected, onClick, disabled }) => {
  const states = isSelected
    ? "bg-white/20 border-white/40 scale-95 shadow-2xl border-2"
    : disabled
    ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
    : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-95 hover:shadow-xl border";

  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-xl overflow-hidden ${states}`}
      aria-label={`Download from ${server}`}
      aria-pressed={isSelected}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 hover:opacity-20 transition-opacity" />
      <div className="relative flex flex-col items-center gap-2">
        <div
          className={`p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-transform ${
            isSelected ? "scale-110" : ""
          }`}
        >
          <Server className="w-5 h-5 text-white" />
        </div>
        <p className="text-white font-bold text-sm">{server}</p>
      </div>
      {isSelected && (
        <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-cyan-400 animate-pulse" />
      )}
    </ButtonBase>
  );
};

const Section = ({ title, icon: Icon, children, step }) => (
  <div className="relative mb-8">
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm">
        {step}
      </div>
      {Icon && <Icon className="w-5 h-5 text-white/80" />}
      <p className="text-white/80 text-sm font-semibold">{title}</p>
    </div>
    {children}
  </div>
);

export default function SecureDownloadClient({ qualities, slug, contentType }) {
  // Step 1: Quality selection
  const [selectedQuality, setSelectedQuality] = useState(null);

  // Step 2: Service selection
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Step 3: Download button and links
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // STEP 1: Handle quality selection
  const handleQualitySelect = async (quality, index) => {
    setSelectedQuality(index);
    setSelectedService(null);
    setShowDownloadButton(false);
    setDownloadLinks(null);
    setLoadingServices(true);

    // Log action
    await logDownloadAction("QUALITY_SELECTED", {
      quality,
      slug,
      contentType,
      timestamp: new Date().toISOString(),
    });

    try {
      // STEP 2: Fetch available services for this quality
      const result = await getServicesForQuality(slug, quality);

      if (result.success) {
        setAvailableServices(result.services);
      } else {
        setAvailableServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setAvailableServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // STEP 2: Handle service selection
  const handleServiceSelect = async (service, index) => {
    setSelectedService(index);
    setShowDownloadButton(true);
    setDownloadLinks(null);

    // Log action
    await logDownloadAction("SERVICE_SELECTED", {
      quality: qualities[selectedQuality],
      service: service.serviceName,
      slug,
      contentType,
      timestamp: new Date().toISOString(),
    });
  };

  // STEP 3: Handle download button click
  const handleDownloadClick = async () => {
    setLoadingLinks(true);
    setCountdown(3);

    // Log action
    await logDownloadAction("DOWNLOAD_INITIATED", {
      quality: qualities[selectedQuality],
      service: availableServices[selectedService].serviceName,
      slug,
      contentType,
      timestamp: new Date().toISOString(),
    });

    // Security countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // Wait 3 seconds before fetching links
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      // Fetch download links
      const result = await getDownloadLinks(
        slug,
        qualities[selectedQuality],
        availableServices[selectedService].serviceName
      );

      if (result.success) {
        setDownloadLinks(result.links);

        // Log success
        await logDownloadAction("LINKS_RETRIEVED", {
          quality: qualities[selectedQuality],
          service: availableServices[selectedService].serviceName,
          slug,
          contentType,
          hasDownload: !!result.links.downloadLink,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error fetching download links:", error);

      // Log error
      await logDownloadAction("LINKS_FETCH_FAILED", {
        quality: qualities[selectedQuality],
        service: availableServices[selectedService].serviceName,
        slug,
        contentType,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoadingLinks(false);
    }
  };

  return (
    <div className="relative">
      {/* STEP 1: Quality Selection */}
      <Section title="Select Quality" icon={Film} step={1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {qualities.map((quality, idx) => (
            <QualityButton
              key={idx}
              quality={quality}
              isSelected={selectedQuality === idx}
              onClick={() => handleQualitySelect(quality, idx)}
              disabled={loadingServices}
            />
          ))}
        </div>
      </Section>

      {/* STEP 2: Service Selection */}
      {selectedQuality !== null && (
        <Section title="Select Server" icon={Server} step={2}>
          {loadingServices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="ml-3 text-white/80">Loading servers...</span>
            </div>
          ) : availableServices.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fadeIn">
              {availableServices.map((service, idx) => (
                <ServerButton
                  key={idx}
                  server={service.serviceName}
                  isSelected={selectedService === idx}
                  onClick={() => handleServiceSelect(service, idx)}
                  disabled={loadingLinks}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              No servers available for this quality
            </div>
          )}
        </Section>
      )}

      {/* STEP 3: Download Button */}
      {showDownloadButton && !downloadLinks && (
        <Section title="Get Download Links" icon={Shield} step={3}>
          <div className="animate-fadeIn">
            <ButtonBase
              onClick={handleDownloadClick}
              disabled={loadingLinks}
              className={`w-full p-6 rounded-xl ${
                loadingLinks
                  ? "bg-white/10 cursor-wait"
                  : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              } text-white font-bold text-lg flex items-center justify-center gap-3`}
            >
              {loadingLinks ? (
                <>
                  <Lock className="w-6 h-6 animate-pulse" />
                  {countdown !== null ? (
                    <span>Verifying... {countdown}s</span>
                  ) : (
                    <span>Processing...</span>
                  )}
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  <span>Get Download Links</span>
                </>
              )}
            </ButtonBase>
          </div>
        </Section>
      )}

      {/* STEP 4: Download Links */}
      {downloadLinks && (
        <Section title="Download Links Ready" icon={Download} step={4}>
          <div className="space-y-3 animate-fadeIn">
            <div
              className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-6 hover:${DESIGN_TOKENS.glass.strong} transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
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
                {downloadLinks.downloadLink && (
                  <a
                    href={downloadLinks.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-colors shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Download Now
                  </a>
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
