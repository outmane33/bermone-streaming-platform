"use server";
import connectToDatabase from "@/lib/mongodb";
import { cache } from "react";
import { buildErrorResponse } from "./db-utils";
import { cleanSlug } from "@/lib/pageUtils";
import { headers } from "next/headers";

// Blacklist of excluded server names
const EXCLUDED_SERVERS = ["Telegram"];

/**
 * Get service manager configuration by service name
 * @param {string} serviceName - The service name
 * @returns {Promise} Service manager config or null
 */
const getServiceManager = cache(async (serviceName) => {
  try {
    const { db } = await connectToDatabase();
    const serviceManager = await db
      .collection("servicemanagers")
      .findOne({ name: serviceName });

    return serviceManager;
  } catch (error) {
    console.error("💥 Error getting service manager:", error);
    return null;
  }
});

/**
 * Get available servers for content by slug (works for both films and episodes)
 * SECURITY: Only returns server names and status - NO iframe codes or URLs
 * @param {string} slug - The content slug
 * @returns {Promise} Server list with status but no iframe codes
 */
export const getServersBySlug = cache(async (slug) => {
  console.log("🔧 getServersBySlug called with:", slug);

  try {
    const { db } = await connectToDatabase();
    console.log("✅ Database connected");

    const cleanedSlug = cleanSlug(slug);
    console.log("🧹 Cleaned slug:", cleanedSlug);

    let content = null;
    let contentType = null;

    // Try to find in films collection first (فيلم in slug)
    if (slug.includes("فيلم")) {
      console.log("🎬 Detecting film from slug...");
      const result = await db
        .collection("films")
        .find({ slug: cleanedSlug })
        .project({ _id: 1, services: 1 })
        .toArray();

      if (result[0]) {
        // Filter out excluded servers and extract only safe data
        const filteredServices =
          result[0].services
            ?.filter((s) => !EXCLUDED_SERVERS.includes(s.serviceName))
            .map((s) => ({
              serviceName: s.serviceName,
              qualityCount: s.qualities?.length || 0,
            })) || [];

        content = {
          _id: result[0]._id,
          services: filteredServices,
        };
        contentType = "film";
        console.log("🎬 Film found");
      }
    }

    // Try to find in episodes collection (مسلسل + حلقة in slug)
    if (!content && slug.includes("مسلسل") && slug.includes("حلقة")) {
      console.log("📺 Detecting episode from slug...");
      const result = await db
        .collection("episodes")
        .find({ slug: cleanedSlug })
        .project({ _id: 1, services: 1 })
        .toArray();

      if (result[0]) {
        const filteredServices =
          result[0].services
            ?.filter((s) => !EXCLUDED_SERVERS.includes(s.serviceName))
            .map((s) => ({
              serviceName: s.serviceName,
              qualityCount: s.qualities?.length || 0,
            })) || [];

        content = {
          _id: result[0]._id,
          services: filteredServices,
        };
        contentType = "episode";
        console.log("📺 Episode found");
      }
    }

    // Fallback: Try episodes if not found yet
    if (!content) {
      console.log("🔍 Trying episodes collection as fallback...");
      const result = await db
        .collection("episodes")
        .find({ slug: cleanedSlug })
        .project({ _id: 1, services: 1 })
        .toArray();

      if (result[0]) {
        const filteredServices =
          result[0].services
            ?.filter((s) => !EXCLUDED_SERVERS.includes(s.serviceName))
            .map((s) => ({
              serviceName: s.serviceName,
              qualityCount: s.qualities?.length || 0,
            })) || [];

        content = {
          _id: result[0]._id,
          services: filteredServices,
        };
        contentType = "episode";
        console.log("📺 Episode found in fallback");
      }
    }

    // Fallback: Try films if still not found
    if (!content) {
      console.log("🔍 Trying films collection as fallback...");
      const result = await db
        .collection("films")
        .find({ slug: cleanedSlug })
        .project({ _id: 1, services: 1 })
        .toArray();

      if (result[0]) {
        const filteredServices =
          result[0].services
            ?.filter((s) => !EXCLUDED_SERVERS.includes(s.serviceName))
            .map((s) => ({
              serviceName: s.serviceName,
              qualityCount: s.qualities?.length || 0,
            })) || [];

        content = {
          _id: result[0]._id,
          services: filteredServices,
        };
        contentType = "film";
        console.log("🎬 Film found in fallback");
      }
    }

    console.log("📦 Content found:", content ? "Yes" : "No");
    console.log("📦 Content type:", contentType);
    console.log("📦 Filtered services:", content?.services);

    if (!content || !content.services || content.services.length === 0) {
      return {
        success: false,
        error: "Content not found or has no available servers",
        servers: [],
        contentId: null,
        contentType: null,
      };
    }

    // Map to clean server list - ONLY names and status
    const availableServers = content.services.map((service, index) => ({
      id: index + 1,
      name: service.serviceName,
      status: service.qualityCount > 0 ? "active" : "maintenance",
      qualityCount: service.qualityCount,
    }));

    console.log("✅ Available servers (secure):", availableServers);

    return {
      success: true,
      servers: availableServers,
      count: availableServers.length,
      contentId: content._id.toString(),
      contentType: contentType,
    };
  } catch (error) {
    console.error("💥 Error in getServersBySlug:", error);
    return buildErrorResponse("content servers", error);
  }
});

/**
 * Get iframe URL for a specific server by slug (only called when user clicks play)
 * SECURITY: This function is ONLY called client-side when user clicks play
 * Never call this during SSR to prevent iframe URLs from appearing in page source
 * @param {string} slug - The content slug
 * @param {string} serverName - The server name
 * @param {string} quality - Preferred quality (optional)
 * @returns {Promise} Full iframe URL or error
 */
export const getServerIframeBySlug = cache(
  async (slug, serverName, quality = null) => {
    try {
      // ✅ FIX: Await the headers() call
      const reqHeaders = await headers();
      const origin = reqHeaders.get("origin");
      const referer = reqHeaders.get("referer");
      const host = reqHeaders.get("host");

      // Allow only your domain(s)
      const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL];

      const isValidOrigin = origin && allowedOrigins.includes(origin);
      const isValidReferer =
        referer && allowedOrigins.some((o) => referer.startsWith(o));
      const isSameHost =
        host && allowedOrigins.some((o) => new URL(o).hostname === host);

      if (!(isValidOrigin || isValidReferer || isSameHost)) {
        console.warn("🚨 Suspicious iframe request", {
          origin,
          referer,
          host,
          slug,
          serverName,
        });
        return {
          success: false,
          error: "Invalid request origin",
          iframeUrl: null,
        };
      }

      console.log("🎬 getServerIframeBySlug called (CLIENT-SIDE ONLY):", {
        slug,
        serverName,
        quality,
      });

      // Security check: Block excluded servers
      if (EXCLUDED_SERVERS.includes(serverName)) {
        return {
          success: false,
          error: "Invalid server",
          iframeUrl: null,
        };
      }

      const { db } = await connectToDatabase();
      const cleanedSlug = cleanSlug(slug);

      let content = null;

      // Try to find in films collection first (فيلم in slug)
      if (slug.includes("فيلم")) {
        console.log("🎬 Detecting film from slug...");
        const result = await db
          .collection("films")
          .aggregate([
            { $match: { slug: cleanedSlug } },
            {
              $project: {
                services: {
                  $filter: {
                    input: "$services",
                    as: "service",
                    cond: {
                      $not: {
                        $in: ["$$service.serviceName", EXCLUDED_SERVERS],
                      },
                    },
                  },
                },
              },
            },
          ])
          .toArray();

        if (result[0]) {
          content = result[0];
          console.log("🎬 Film found");
        }
      }

      // Try to find in episodes collection (مسلسل + حلقة in slug)
      if (!content && slug.includes("مسلسل") && slug.includes("حلقة")) {
        console.log("📺 Detecting episode from slug...");
        const result = await db
          .collection("episodes")
          .aggregate([
            { $match: { slug: cleanedSlug } },
            {
              $project: {
                services: {
                  $filter: {
                    input: "$services",
                    as: "service",
                    cond: {
                      $not: {
                        $in: ["$$service.serviceName", EXCLUDED_SERVERS],
                      },
                    },
                  },
                },
              },
            },
          ])
          .toArray();

        if (result[0]) {
          content = result[0];
          console.log("📺 Episode found");
        }
      }

      // Fallback: Try episodes if not found yet
      if (!content) {
        console.log("🔍 Trying episodes collection as fallback...");
        const result = await db
          .collection("episodes")
          .aggregate([
            { $match: { slug: cleanedSlug } },
            {
              $project: {
                services: {
                  $filter: {
                    input: "$services",
                    as: "service",
                    cond: {
                      $not: {
                        $in: ["$$service.serviceName", EXCLUDED_SERVERS],
                      },
                    },
                  },
                },
              },
            },
          ])
          .toArray();

        if (result[0]) {
          content = result[0];
          console.log("📺 Episode found in fallback");
        }
      }

      // Fallback: Try films if still not found
      if (!content) {
        console.log("🔍 Trying films collection as fallback...");
        const result = await db
          .collection("films")
          .aggregate([
            { $match: { slug: cleanedSlug } },
            {
              $project: {
                services: {
                  $filter: {
                    input: "$services",
                    as: "service",
                    cond: {
                      $not: {
                        $in: ["$$service.serviceName", EXCLUDED_SERVERS],
                      },
                    },
                  },
                },
              },
            },
          ])
          .toArray();

        if (result[0]) {
          content = result[0];
          console.log("🎬 Film found in fallback");
        }
      }

      if (!content || !content.services || content.services.length === 0) {
        return {
          success: false,
          error: "Content not found",
          iframeUrl: null,
        };
      }

      // Find the requested server (Telegram already excluded)
      const server = content.services.find(
        (service) => service.serviceName === serverName
      );

      if (!server || !server.qualities || server.qualities.length === 0) {
        return {
          success: false,
          error: "Server not available",
          iframeUrl: null,
        };
      }

      // Select quality (prefer 1080p, then highest available)
      let selectedQuality;
      if (quality) {
        selectedQuality = server.qualities.find((q) => q.quality === quality);
      }

      if (!selectedQuality) {
        selectedQuality =
          server.qualities.find((q) => q.quality.includes("1080p")) ||
          server.qualities[0];
      }

      if (!selectedQuality || !selectedQuality.iframe) {
        return {
          success: false,
          error: "No valid quality found",
          iframeUrl: null,
        };
      }

      // Get service manager configuration to build the full URL
      const serviceManager = await getServiceManager(serverName);

      if (!serviceManager || !serviceManager.iframeUrl) {
        console.error("⚠️ Service manager not found for:", serverName);
        return {
          success: false,
          error: "Service configuration not found",
          iframeUrl: null,
        };
      }

      // Build full iframe URL
      const fullIframeUrl = `${serviceManager.iframeUrl}${selectedQuality.iframe}`;
      console.log("✅ Full iframe URL built:", fullIframeUrl);

      return {
        success: true,
        iframeUrl: fullIframeUrl,
        iframeCode: selectedQuality.iframe,
        quality: selectedQuality.quality,
        serverName: serverName,
      };
    } catch (error) {
      console.error("💥 Error in getServerIframeBySlug:", error);
      return buildErrorResponse("server iframe", error);
    }
  }
);
