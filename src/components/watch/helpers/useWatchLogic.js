"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getServersBySlug,
  getServerIframeBySlug,
} from "@/actions/getEpisodeServers";

export function useWatchLogic(slug) {
  const router = useRouter();
  const [servers, setServers] = useState([]);
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [isLoadingIframe, setIsLoadingIframe] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setIsLoadingServers(false);
      return;
    }

    const load = async () => {
      try {
        setIsLoadingServers(true);
        const res = await getServersBySlug(slug);
        console.log("🔍 Servers data:", res);
        if (res.success && res.servers.length > 0) {
          setServers(res.servers);
          setError(null);
        } else {
          setError(res.error || "لا توجد سيرفرات متاحة");
          setServers([]);
        }
      } catch (err) {
        console.error("❌ Error loading servers:", err);
        setError("حدث خطأ في تحميل السيرفرات");
        setServers([]);
      } finally {
        setIsLoadingServers(false);
      }
    };

    load();
  }, [slug]);

  const handlePlayVideo = async () => {
    if (hasStartedPlaying && iframeUrl) return;

    const server = servers[activeServerIdx];
    if (!server || server.status === "maintenance") {
      setError("السيرفر غير متاح حاليا");
      return;
    }

    try {
      setIsLoadingIframe(true);
      setError(null);

      const qualityParam = selectedQuality ? `${selectedQuality}p` : null;
      const res = await getServerIframeBySlug(slug, server.name, qualityParam);

      if (res.success && res.iframeUrl) {
        setIframeUrl(res.iframeUrl);
        setHasStartedPlaying(true);
      } else {
        setError(res.error || "فشل تحميل الفيديو");
      }
    } catch {
      setError("حدث خطأ في تحميل الفيديو");
    } finally {
      setIsLoadingIframe(false);
    }
  };

  const handleServerChange = async (index) => {
    setActiveServerIdx(index);

    if (hasStartedPlaying) {
      const server = servers[index];
      if (server?.status === "active") {
        try {
          setIsLoadingIframe(true);
          setError(null);

          const qualityParam = selectedQuality ? `${selectedQuality}p` : null;
          const res = await getServerIframeBySlug(
            slug,
            server.name,
            qualityParam,
          );

          if (res.success && res.iframeUrl) {
            setIframeUrl(res.iframeUrl);
          } else {
            setError(res.error || "فشل التحميل من هذا السيرفر");
          }
        } catch {
          setError("حدث خطأ في تغيير السيرفر");
        } finally {
          setIsLoadingIframe(false);
        }
      }
    }
  };

  const handleQualityChange = useCallback(
    async (quality) => {
      setSelectedQuality(quality);

      // If already playing, reload with new quality
      if (hasStartedPlaying) {
        const server = servers[activeServerIdx];
        if (server?.status === "active") {
          try {
            setIsLoadingIframe(true);
            setError(null);

            const qualityParam = `${quality}p`;
            const res = await getServerIframeBySlug(
              slug,
              server.name,
              qualityParam,
            );

            if (res.success && res.iframeUrl) {
              setIframeUrl(res.iframeUrl);
            } else {
              setError(res.error || "الجودة المطلوبة غير متاحة");
            }
          } catch {
            setError("حدث خطأ في تغيير الجودة");
          } finally {
            setIsLoadingIframe(false);
          }
        }
      }
    },
    [slug, servers, activeServerIdx, hasStartedPlaying],
  );

  return {
    servers,
    activeServerIdx,
    selectedQuality,
    iframeUrl,
    isLoadingServers,
    isLoadingIframe,
    hasStartedPlaying,
    error,
    handlePlayVideo,
    handleServerChange,
    handleQualityChange,
    setError,
  };
}
