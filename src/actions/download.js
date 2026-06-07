"use server";
import connectToDatabase from "@/lib/mongodb";
import { buildErrorResponse } from "./db-utils";
import { sortQualities } from "@/lib/data";
import { findContentBySlug } from "@/lib/contentUtils";

export const getAvailableQualities = async (slug) => {
  try {
    const { content, contentType } = await findContentBySlug(slug);
    if (!content) {
      return { success: false, error: "Content not found", qualities: [] };
    }

    // Season: links direct
    if (contentType === "season") {
      const qualities = [
        ...new Set((content.links || []).map((l) => l.quality).filter(Boolean)),
      ];
      return {
        success: true,
        qualities: sortQualities(qualities),
        type: contentType,
      };
    }

    // Film/Episode: services
    const qualities = [
      ...new Set(
        content.services
          .flatMap((s) => s.qualities.map((q) => q.quality))
          .filter(Boolean),
      ),
    ];
    return {
      success: true,
      qualities: sortQualities(qualities),
      type: contentType,
    };
  } catch (error) {
    console.error("💥 getAvailableQualities error:", error);
    return buildErrorResponse("qualities", error);
  }
};

export const getServicesForQuality = async (slug, quality) => {
  try {
    const { content, contentType } = await findContentBySlug(slug);
    if (!content) {
      return { success: false, error: "Content not found", services: [] };
    }

    // Season: direct download, no server selection needed
    if (contentType === "season") {
      const links = (content.links || []).filter((l) => l.quality === quality);
      if (!links.length)
        return {
          success: false,
          error: "No link for this quality",
          services: [],
        };
      return {
        success: true,
        services: links.map((l) => ({
          serviceName: l.label || "تحميل مباشر",
          qualityCount: 1,
        })),
      };
    }

    const services = content.services
      .filter((s) => s.qualities.some((q) => q.quality === quality))
      .map((s) => ({
        serviceName: s.serviceName,
        qualityCount: s.qualities.length,
      }));
    if (services.length === 0) {
      return {
        success: false,
        error: "No services for this quality",
        services: [],
      };
    }
    return { success: true, services };
  } catch (error) {
    console.error("💥 getServicesForQuality error:", error);
    return buildErrorResponse("services", error);
  }
};

export const getDownloadLinks = async (slug, quality, serverName) => {
  try {
    const { content, contentType } = await findContentBySlug(slug);
    if (!content) {
      return { success: false, error: "Content not found" };
    }

    // Season: return direct link
    if (contentType === "season") {
      const link = (content.links || []).find(
        (l) =>
          l.quality === quality && (l.label || "تحميل مباشر") === serverName,
      );
      if (!link?.url) return { success: false, error: "Link not found" };
      return {
        success: true,
        downloadUrl: link.url,
        quality,
        serviceName: link.label || "تحميل مباشر",
      };
    }

    // Film/Episode: existing logic
    const service = content.services.find((s) => s.serviceName === serverName);
    const qualityObj = service?.qualities.find((q) => q.quality === quality);
    if (!qualityObj) {
      return {
        success: false,
        error: "Quality not available in selected server",
      };
    }
    const fileCode = qualityObj.iframe || qualityObj.fileCode || qualityObj.id;
    if (!fileCode) {
      return { success: false, error: "File code missing" };
    }
    const { db } = await connectToDatabase();
    const serviceManager = await db
      .collection("servicemanagers")
      .findOne({ name: serverName });
    if (!serviceManager?.downloadUrl) {
      return {
        success: false,
        error: `Server config missing for ${serverName}`,
      };
    }
    return {
      success: true,
      downloadUrl: `${serviceManager.downloadUrl}${fileCode}${
        ["Player4me", "SeekStreaming"].includes(serverName) ? "&dl=1" : ""
      }`,
      quality,
      serviceName: serverName,
    };
  } catch (error) {
    console.error("💥 getDownloadLinks error:", error);
    return { success: false, error: "Failed to generate secure download link" };
  }
};
