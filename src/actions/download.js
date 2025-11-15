// actions/download.js
"use server";
import { headers } from "next/headers";
import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import { cleanSlug } from "@/lib/pageUtils";
import { buildErrorResponse } from "./db-utils";

// Blacklist servers
const EXCLUDED_SERVERS = ["Telegram"];

/**
 * Get available qualities for content by slug
 */
export const getAvailableQualities = cache(async (slug) => {
  try {
    // Server actions have built-in CSRF protection, origin check not needed
    await headers(); // Still await to comply with Next.js 15

    const { db } = await connectToDatabase();
    const cleanedSlug = cleanSlug(slug);

    let content = null;
    let contentType = null;

    // Try films
    if (slug.includes("فيلم")) {
      const result = await db
        .collection("films")
        .findOne(
          { slug: cleanedSlug },
          { projection: { _id: 1, services: 1 } }
        );
      if (result) {
        content = result;
        contentType = "film";
      }
    }

    // Try episodes
    if (!content && slug.includes("مسلسل") && slug.includes("حلقة")) {
      const result = await db
        .collection("episodes")
        .findOne(
          { slug: cleanedSlug },
          { projection: { _id: 1, services: 1 } }
        );
      if (result) {
        content = result;
        contentType = "episode";
      }
    }

    // Fallback: try episodes then films without slug checks
    if (!content) {
      const result = await db
        .collection("episodes")
        .findOne(
          { slug: cleanedSlug },
          { projection: { _id: 1, services: 1 } }
        );
      if (result) {
        content = result;
        contentType = "episode";
      }
    }
    if (!content) {
      const result = await db
        .collection("films")
        .findOne(
          { slug: cleanedSlug },
          { projection: { _id: 1, services: 1 } }
        );
      if (result) {
        content = result;
        contentType = "film";
      }
    }

    if (!content) {
      return { success: false, error: "Content not found", qualities: [] };
    }

    // 🔥 CRITICAL FIX: Only show qualities that have at least one non-excluded server
    const availableServices =
      content.services?.filter(
        (s) => !EXCLUDED_SERVERS.includes(s.serviceName)
      ) || [];

    if (availableServices.length === 0) {
      return { success: false, error: "No available servers", qualities: [] };
    }

    // Extract qualities from available services only
    const qualities = [
      ...new Set(
        availableServices
          .flatMap((s) => s.qualities?.map((q) => q.quality) || [])
          .filter(Boolean)
      ),
    ].sort((a, b) => {
      // Sort: 1080p > 720p > 480p > 360p > 240p
      const order = {
        "1080p": 5,
        "720p": 4,
        "480p": 3,
        "360p": 2,
        "240p": 1,
      };
      return (order[b] || 0) - (order[a] || 0);
    });

    console.log(
      `✅ Found ${qualities.length} qualities for ${contentType}:`,
      qualities
    );

    return { success: true, qualities, type: contentType };
  } catch (error) {
    console.error("💥 getAvailableQualities error:", error);
    return buildErrorResponse("qualities", error);
  }
});

/**
 * Get available services for a given quality
 */
// Replace the aggregation logic with safer JS filtering
export const getServicesForQuality = cache(async (slug, quality) => {
  try {
    await headers();
    const { db } = await connectToDatabase();
    const cleanedSlug = cleanSlug(slug);

    let content = null;
    for (const coll of ["films", "episodes"]) {
      const doc = await db
        .collection(coll)
        .findOne({ slug: cleanedSlug }, { projection: { services: 1 } });
      if (doc?.services?.length) {
        content = doc;
        break;
      }
    }

    if (!content?.services?.length) {
      return {
        success: false,
        error: "Content or services not found",
        services: [],
      };
    }

    // Normalize input quality
    const normalizedQuality = quality.trim().toLowerCase();

    // Filter services: exclude blacklisted + match quality robustly
    const services = content.services
      .filter((s) => s && typeof s === "object")
      .filter((s) => !EXCLUDED_SERVERS.includes(s.serviceName))
      .filter((s) => {
        if (!Array.isArray(s.qualities)) return false;
        return s.qualities.some((q) => {
          // Handle both string and object quality
          const qVal = typeof q === "string" ? q : q?.quality || q?.name || "";
          return qVal.trim().toLowerCase() === normalizedQuality;
        });
      })
      .map((s) => ({
        serviceName: s.serviceName,
        qualityCount: s.qualities?.length || 0,
      }));

    if (services.length === 0) {
      console.warn(
        `⚠️ No services matched quality "${quality}" (normalized: "${normalizedQuality}")`,
        "Available qualities in services:",
        content.services.flatMap(
          (s) =>
            s.qualities?.map((q) => (typeof q === "string" ? q : q.quality)) ||
            []
        )
      );
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
});
/**
 * Get download link - STREAMHG IP BINDING ENABLED
 */
export const getDownloadLinks = cache(async (slug, quality, serverName) => {
  try {
    // Get user's real IP from headers
    const reqHeaders = await headers();

    // ✅ Get REAL user IP (works locally + Vercel)
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";

    let safeIp = ip;
    if (ip === "127.0.0.1" || ip === "::1") {
      // Use STREAMHG_DEV_IP from .env.local, or fallback to your IP
      safeIp = process.env.STREAMHG_DEV_IP || "160.179.156.215";
      console.log("🏠 Development mode: Using IP from env or default:", safeIp);
    }

    console.log("📡 Request from IP:", safeIp, "for server:", serverName);

    const { db } = await connectToDatabase();
    const cleanedSlug = cleanSlug(slug);

    // Find content and service
    let content = null;
    const collections = ["films", "episodes"];
    for (const coll of collections) {
      const result = await db.collection(coll).findOne(
        { slug: cleanedSlug },
        {
          projection: {
            services: {
              $elemMatch: {
                serviceName: serverName,
                qualities: { $elemMatch: { quality } },
              },
            },
          },
        }
      );
      if (result?.services?.[0]) {
        content = result;
        break;
      }
    }

    if (!content) {
      console.error(
        `❌ Service not found: ${serverName} for quality: ${quality}`
      );
      return { success: false, error: "Service not found" };
    }

    const service = content.services[0];
    const qualityObj = service.qualities.find((q) => q.quality === quality);

    if (!qualityObj) {
      console.error("❌ Quality not found in service");
      return { success: false, error: "Quality not found in service" };
    }

    // 🔥 FIXED: For StreamHG, file code is in 'iframe' field
    // For other servers, it might be in different fields
    const fileCode =
      qualityObj.iframe || // StreamHG stores file code here
      qualityObj.fileCode ||
      qualityObj.file_code ||
      qualityObj.code ||
      qualityObj.id;

    if (!fileCode) {
      console.error("❌ No file code found. Quality object:", qualityObj);
      return { success: false, error: "File code not found" };
    }

    console.log("✅ Using file code:", fileCode, "from server:", serverName);

    // 🔑 STREAMHG-SPECIFIC LOGIC
    if (serverName === "StreamHG") {
      const streamHgUrl = new URL(
        "https://streamhgapi.com/api/file/direct_link"
      );
      streamHgUrl.searchParams.append("key", process.env.STREAMHG_API_KEY);
      streamHgUrl.searchParams.append("file_code", fileCode);
      streamHgUrl.searchParams.append("ip", safeIp);
      streamHgUrl.searchParams.append("q", getStreamHgQuality(quality));

      console.log("🔗 StreamHG request:", streamHgUrl.toString());

      const response = await fetch(streamHgUrl, { next: { revalidate: 0 } });
      const data = await response.json();

      if (data.status !== 200) {
        console.error("❌ StreamHG error:", data.msg);
        return {
          success: false,
          error: `StreamHG: ${data.msg || "Unknown error"}`,
        };
      }

      return {
        success: true,
        downloadUrl: data.result.hls_direct || data.result.direct_link,
        quality,
        serviceName: serverName,
        isStreamHg: true,
        ipBound: safeIp,
      };
    }

    // 🔑 OTHER SERVERS: For non-StreamHG servers
    // They use 'iframe' for embed URLs or 'downloadLink' for direct links
    const directUrl =
      qualityObj.downloadLink ||
      qualityObj.directUrl ||
      qualityObj.iframe ||
      qualityObj.url;

    if (!directUrl) {
      console.error(
        `❌ No download URL for ${serverName} - ${quality}. Quality object:`,
        qualityObj
      );
      return { success: false, error: "No download URL available" };
    }

    console.log("✅ Using direct URL for", serverName, ":", directUrl);

    return {
      success: true,
      downloadUrl: directUrl,
      quality,
      serviceName: serverName,
      isStreamHg: false,
    };
  } catch (error) {
    console.error("💥 getDownloadLinks error:", error);
    return { success: false, error: "Failed to generate download link" };
  }
});

// Helper: Map your quality to StreamHG's format
function getStreamHgQuality(quality) {
  if (quality.includes("1080")) return "h";
  if (quality.includes("720")) return "n";
  if (quality.includes("480")) return "l";
  return "o";
}
