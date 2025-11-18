"use client";
import React, { useState, useEffect } from "react";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";
import { getServicesForQuality, getDownloadLinks } from "@/actions/download";
import ServerSelector from "./ServerSelector";
import QualitySelector from "./QualitySelector";

const Section = ({ title, icon: Icon, children, step }) => (
  <div className="relative mb-6 sm:mb-8">
    <div className="flex items-center gap-2 mb-3">
      <div
        className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ${DESIGN_TOKENS.gradients.cyan} text-white font-bold text-xs sm:text-sm`}
      >
        {step}
      </div>
      {Icon && (
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/80 flex-shrink-0" />
      )}
      <p className="text-white/80 text-sm sm:text-base font-semibold">
        {title}
      </p>
    </div>
    <div>{children}</div>
  </div>
);

export default function SecureDownloadClient({ qualities, slug }) {
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [downloadData, setDownloadData] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const handleQualitySelect = async (quality) => {
    setSelectedQuality(quality);
    setSelectedService(null);
    setShowDownloadButton(false);
    setDownloadData(null);
    setLoadingServices(true);
    try {
      const result = await getServicesForQuality(slug, quality);
      setAvailableServices(result.success ? result.services : []);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServerSelect = (serviceName) => {
    setSelectedService(serviceName);
    setShowDownloadButton(true);
    setDownloadData(null);
  };

  const handleDownloadClick = async () => {
    setLoadingLinks(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : null));
    }, 1000);

    await new Promise((r) => setTimeout(r, 3000));
    clearInterval(interval);

    try {
      const result = await getDownloadLinks(
        slug,
        selectedQuality,
        selectedService
      );
      if (result.success && result.downloadUrl) {
        setDownloadData({
          url: result.downloadUrl,
          quality: selectedQuality,
          service: selectedService,
        });
      } else {
        alert("فشل الحصول على رابط التحميل. يُرجى تجربة سيرفر آخر.");
      }
    } catch {
      alert("خطأ في الشبكة. الرجاء التحقق من الاتصال والمحاولة مجددًا.");
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleDownload = () =>
    window.open(downloadData.url, "_blank", "noopener,noreferrer");

  return (
    <div className="relative space-y-6">
      <Section title="اختر الجودة" icon={ICON_MAP.Film} step={1}>
        <QualitySelector
          qualities={qualities}
          selectedQuality={selectedQuality}
          onSelect={handleQualitySelect}
          loading={loadingServices}
        />
      </Section>

      {selectedQuality && (
        <Section title="اختر السيرفر" icon={ICON_MAP.Server} step={2}>
          <ServerSelector
            services={availableServices}
            selectedService={selectedService}
            onSelect={handleServerSelect}
            loading={loadingLinks}
          />
        </Section>
      )}

      {showDownloadButton && !downloadData && (
        <Section title="احصل على رابط التحميل" icon={ICON_MAP.Shield} step={3}>
          <button
            onClick={handleDownloadClick}
            disabled={loadingLinks}
            className={`
              w-full py-3.5 sm:py-4 px-4 rounded-xl font-bold text-base sm:text-lg 
              flex items-center justify-center gap-2 sm:gap-3 cursor-pointer
              ${DESIGN_TOKENS.effects.hoverScale} ${
              DESIGN_TOKENS.effects.transition
            }
              ${
                loadingLinks
                  ? "bg-white/10 cursor-wait"
                  : `${DESIGN_TOKENS.gradients.cyan} hover:from-cyan-600 hover:to-blue-700 text-white`
              }
            `}
            aria-busy={loadingLinks}
          >
            {loadingLinks ? (
              <>
                <ICON_MAP.Lock className="w-5 h-5 animate-pulse" />
                <span className="whitespace-nowrap">
                  {countdown !== null
                    ? `جارٍ تأمين الرابط... ${countdown}ث`
                    : "قيد المعالجة..."}
                </span>
              </>
            ) : (
              <>
                <ICON_MAP.Download className="w-5 h-5" />
                <span>احصل على رابط آمن</span>
              </>
            )}
          </button>
        </Section>
      )}

      {downloadData && (
        <Section title="التحميل جاهز" icon={ICON_MAP.Download} step={4}>
          <div
            className={`${DESIGN_TOKENS.glass.medium} rounded-xl p-4 sm:p-5`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4">
              <ICON_MAP.CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">
                  {downloadData.service}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {downloadData.quality}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 
                rounded-lg font-semibold shadow-md hover:shadow-lg 
                ${DESIGN_TOKENS.effects.hoverScale} ${DESIGN_TOKENS.glass.medium}
                bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} hover:from-cyan-600 hover:to-blue-700 text-white
                transition-all duration-300
              `}
            >
              <ICON_MAP.Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>تنزيل {downloadData.quality}</span>
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}
