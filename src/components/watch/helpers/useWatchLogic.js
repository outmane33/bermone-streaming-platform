import { useState, useEffect } from "react";
import {
  getServersBySlug,
  getServerIframeBySlug,
} from "@/actions/getEpisodeServers";

export function useWatchLogic(slug) {
  const [servers, setServers] = useState([]);
  const [activeServerIdx, setActiveServerIdx] = useState(0);
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
        if (res.success && res.servers.length > 0) {
          setServers(res.servers);
          setError(null);
        } else {
          setError(res.error || "لا توجد سيرفرات متاحة");
          setServers([]);
        }
      } catch (err) {
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
      const res = await getServerIframeBySlug(slug, server.name);
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
          const res = await getServerIframeBySlug(slug, server.name);
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

  return {
    servers,
    activeServerIdx,
    iframeUrl,
    isLoadingServers,
    isLoadingIframe,
    hasStartedPlaying,
    error,

    handlePlayVideo,
    handleServerChange,
    setError,
  };
}
