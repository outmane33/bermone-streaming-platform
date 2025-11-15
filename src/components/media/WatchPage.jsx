"use client";
import React, { useState, useEffect } from "react";
import {
  Play,
  Server,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";
import { BlurBg } from "@/components/media/BlurBg";
import {
  getServersBySlug,
  getServerIframeBySlug,
} from "@/actions/getEpisodeServers";

const WatchPage = ({ slug }) => {
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(0);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [isLoadingIframe, setIsLoadingIframe] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Load available servers on mount
  useEffect(() => {
    const loadServers = async () => {
      console.log("🔍 Loading servers for slug:", slug);
      try {
        setIsLoadingServers(true);
        const result = await getServersBySlug(slug);
        console.log("📡 Server result:", result);

        if (result.success && result.servers.length > 0) {
          setServers(result.servers);
          setError(null);
          console.log("✅ Servers loaded:", result.servers);
        } else {
          console.log("❌ No servers or error:", result.error);
          setError(result.error || "لا توجد سيرفرات متاحة");
          setServers([]);
        }
      } catch (err) {
        console.error("💥 Error loading servers:", err);
        setError("حدث خطأ في تحميل السيرفرات");
        setServers([]);
      } finally {
        setIsLoadingServers(false);
        console.log("🏁 Loading complete");
      }
    };

    if (slug) {
      loadServers();
    } else {
      console.warn("⚠️ No slug provided");
      setIsLoadingServers(false);
    }
  }, [slug]);

  // Load iframe when play button is clicked
  const handlePlayVideo = async () => {
    if (hasStartedPlaying && iframeUrl) {
      // Video already loaded, do nothing
      return;
    }

    const currentServer = servers[activeServer];
    if (!currentServer || currentServer.status === "maintenance") {
      setError("السيرفر غير متاح حاليا");
      return;
    }

    try {
      setIsLoadingIframe(true);
      setError(null);

      const result = await getServerIframeBySlug(slug, currentServer.name);

      if (result.success && result.iframeUrl) {
        setIframeUrl(result.iframeUrl);
        setHasStartedPlaying(true);
        console.log("✅ Video loaded:", result.iframeUrl);
      } else {
        setError(result.error || "فشل تحميل الفيديو");
        setIframeUrl(null);
      }
    } catch (err) {
      console.error("💥 Error loading video:", err);
      setError("حدث خطأ في تحميل الفيديو");
      setIframeUrl(null);
    } finally {
      setIsLoadingIframe(false);
    }
  };

  // Handle server change
  const handleServerChange = async (index) => {
    setActiveServer(index);

    // If video was already playing, load new server immediately
    if (hasStartedPlaying) {
      const newServer = servers[index];
      if (newServer.status === "active") {
        try {
          setIsLoadingIframe(true);
          setError(null);

          const result = await getServerIframeBySlug(slug, newServer.name);

          if (result.success && result.iframeUrl) {
            setIframeUrl(result.iframeUrl);
            console.log("✅ Server switched:", result.iframeUrl);
          } else {
            setError(result.error || "فشل تحميل الفيديو من هذا السيرفر");
            setIframeUrl(null);
          }
        } catch (err) {
          console.error("💥 Error changing server:", err);
          setError("حدث خطأ في تغيير السيرفر");
          setIframeUrl(null);
        } finally {
          setIsLoadingIframe(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="relative overflow-hidden w-full mx-auto">
        <BlurBg position="top" size="96" />
        <BlurBg position="bottom" size="96" />

        <div className="relative space-y-6">
          {/* Loading State */}
          {isLoadingServers && (
            <div
              className={`${DESIGN_TOKENS.glass.medium} rounded-2xl p-8 shadow-2xl`}
            >
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
                <p className="text-white">جاري تحميل السيرفرات...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {!isLoadingServers && error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Server Selection */}
          {!isLoadingServers && servers.length > 0 && (
            <div
              className={`${DESIGN_TOKENS.glass.medium} rounded-2xl p-6 shadow-2xl`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">
                  اختر السيرفر
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {servers.map((server, index) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerChange(index)}
                    disabled={server.status === "maintenance"}
                    className={`
                      relative group px-4 py-3 rounded-xl font-semibold
                      transition-all duration-300 hover:scale-105
                      ${
                        activeServer === index
                          ? `bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} shadow-lg shadow-cyan-500/50`
                          : `${DESIGN_TOKENS.glass.light} ${DESIGN_TOKENS.glass.hover}`
                      }
                      ${
                        server.status === "maintenance"
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {server.status === "active" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-white text-sm">{server.name}</span>
                    </div>

                    {activeServer === index && (
                      <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>

              {servers[activeServer]?.status === "maintenance" && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm text-center">
                    هذا السيرفر تحت الصيانة، يرجى اختيار سيرفر آخر
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video Player Section */}
          {!isLoadingServers && servers.length > 0 && (
            <div
              className={`${DESIGN_TOKENS.glass.medium} rounded-2xl p-6 shadow-2xl`}
            >
              <div className="relative">
                <BlurBg position="top" size="32" />
                <BlurBg position="bottom" size="40" />

                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/50 border-2 border-white/20">
                  {!hasStartedPlaying ? (
                    // Play Button Overlay
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={handlePlayVideo}
                        disabled={
                          isLoadingIframe ||
                          servers[activeServer]?.status === "maintenance"
                        }
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/30 transition-all" />
                        <div
                          className={`relative p-6 rounded-full ${DESIGN_TOKENS.glass.medium} border-2 border-cyan-400/50 group-hover:border-cyan-400 transition-all group-hover:scale-110`}
                        >
                          {isLoadingIframe ? (
                            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                          ) : (
                            <Play className="w-12 h-12 text-cyan-400 fill-cyan-400" />
                          )}
                        </div>
                      </button>
                    </div>
                  ) : isLoadingIframe ? (
                    // Loading State
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                    </div>
                  ) : iframeUrl ? (
                    // Video Player
                    <iframe
                      src={iframeUrl}
                      frameBorder="0"
                      marginWidth="0"
                      marginHeight="0"
                      scrolling="no"
                      width="100%"
                      height="100%"
                      allowFullScreen
                      className="w-full h-full"
                      title={`Video Player - ${servers[activeServer]?.name}`}
                    />
                  ) : null}
                </div>

                {/* Info Badge */}
                {servers[activeServer] && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-cyan-400/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span className="text-white text-sm font-medium">
                        {servers[activeServer].name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/70 text-sm text-center">
                  إذا لم يعمل السيرفر، يرجى تجربة سيرفر آخر من القائمة أعلاه
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
