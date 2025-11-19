"use server";
import connectToDatabase from "@/lib/mongodb";
import { cache } from "react";
import { buildErrorResponse } from "./db-utils";
import { findContentBySlug } from "@/lib/contentUtils";

const getServiceManager = cache(async (serviceName) => {
  try {
    const { db } = await connectToDatabase();
    return await db
      .collection("servicemanagers")
      .findOne({ name: serviceName });
  } catch (error) {
    console.error("💥 Error getting service manager:", error);
    return null;
  }
});

export const getServersBySlug = cache(async (slug) => {
  const { content, contentType } = await findContentBySlug(slug);
  if (!content?.services?.length) {
    return {
      success: false,
      error: "Content not found or no servers",
      servers: [],
    };
  }
  const servers = content.services.map((s, idx) => ({
    id: idx + 1,
    name: s.serviceName,
    status: s.qualities?.length > 0 ? "active" : "maintenance",
    qualityCount: s.qualities?.length || 0,
  }));
  return {
    success: true,
    servers,
    count: servers.length,
    contentId: content._id?.toString(),
    contentType,
  };
});

export const getServerIframeBySlug = cache(
  async (slug, serverName, quality = null) => {
    try {
      const { content } = await findContentBySlug(slug);
      if (!content) {
        return { success: false, error: "المحتوى غير موجود", iframeUrl: null };
      }
      const service = content.services.find(
        (s) => s.serviceName === serverName
      );
      if (!service?.qualities?.length) {
        return {
          success: false,
          error: "السيرفر غير متاح",
          iframeUrl: null,
        };
      }
      const selectedQuality = quality
        ? service.qualities.find((q) => q.quality === quality)
        : service.qualities.find((q) => q.quality.includes("1080p")) ||
          service.qualities[0];
      if (!selectedQuality?.iframe) {
        return {
          success: false,
          error: "لا يوجد رابط تشغيل",
          iframeUrl: null,
        };
      }

      // ✅ Generate *embed* URL instead of direct player URL
      const embedUrl = new URL(
        `/embed/${slug}`,
        process.env.NEXT_PUBLIC_SITE_URL || "https://wecima.ac"
      );
      embedUrl.searchParams.set("server", serverName);
      if (quality || selectedQuality.quality) {
        embedUrl.searchParams.set(
          "quality",
          quality || selectedQuality.quality
        );
      }

      return {
        success: true,
        iframeUrl: embedUrl.toString(), // 👈 this is now /embed/... not cdn/player
        quality: selectedQuality.quality,
        serverName,
      };
    } catch (error) {
      console.error("💥 getServerIframeBySlug error:", error);
      return buildErrorResponse("رابط المشغل", error);
    }
  }
);
