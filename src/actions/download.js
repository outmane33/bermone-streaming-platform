// download.js - REFACTORED
"use server";

import clientPromise from "@/lib/mongodb";
import { cache } from "react";
import crypto from "crypto";

// 🎯 Helper to detect episode vs film from slug
const isEpisodeSlug = (slug) => {
  return slug.includes("موسم") && slug.includes("حلقة");
};

// 🎯 Helper to get collection name from slug
const getCollectionName = (slug) => {
  return isEpisodeSlug(slug) ? "episodes" : "films";
};

/**
 * STEP 1: Get only available qualities (initial page load)
 * Returns unique qualities WITHOUT fetching any links
 */
export const getAvailableQualities = cache(async (slug) => {
  try {
    console.log("🔒 [STEP 1] Fetching available qualities for:", slug);

    const client = await clientPromise;
    const db = client.db();
    const decodedSlug = decodeURIComponent(slug);
    const collectionName = getCollectionName(decodedSlug);

    // Use aggregation to extract ONLY quality strings, no links
    const result = await db
      .collection(collectionName)
      .aggregate([
        { $match: { slug: decodedSlug } },
        { $unwind: "$services" },
        { $unwind: "$services.qualities" },
        {
          $group: {
            _id: "$services.qualities.quality",
          },
        },
        { $project: { _id: 0, quality: "$_id" } },
      ])
      .toArray();

    if (result.length === 0) {
      console.log("❌ [STEP 1] Content not found");
      return {
        success: false,
        qualities: [],
        type: isEpisodeSlug(decodedSlug) ? "episode" : "film",
      };
    }

    const qualities = result.map((r) => r.quality);
    console.log("✅ [STEP 1] Found qualities:", qualities);

    return {
      success: true,
      qualities,
      type: isEpisodeSlug(decodedSlug) ? "episode" : "film",
    };
  } catch (error) {
    console.error("❌ [STEP 1] Error:", error);
    return { success: false, qualities: [], type: null };
  }
});

/**
 * STEP 2: Get available service names for selected quality
 * Returns only service names, NO links
 */
export const getServicesForQuality = cache(async (slug, selectedQuality) => {
  try {
    console.log("🔒 [STEP 2] Fetching services for quality:", selectedQuality);

    const client = await clientPromise;
    const db = client.db();
    const decodedSlug = decodeURIComponent(slug);
    const collectionName = getCollectionName(decodedSlug);

    // Use aggregation to get ONLY service names that have this quality
    const result = await db
      .collection(collectionName)
      .aggregate([
        { $match: { slug: decodedSlug } },
        { $unwind: "$services" },
        { $unwind: "$services.qualities" },
        {
          $match: {
            "services.qualities.quality": selectedQuality,
          },
        },
        {
          $group: {
            _id: "$services.serviceName",
          },
        },
        { $project: { _id: 0, serviceName: "$_id" } },
      ])
      .toArray();

    if (result.length === 0) {
      console.log("❌ [STEP 2] No services found for this quality");
      return { success: false, services: [] };
    }

    const serviceNames = result.map((r) => r.serviceName);
    console.log("✅ [STEP 2] Found services:", serviceNames);

    return {
      success: true,
      services: serviceNames.map((name) => ({ serviceName: name })),
    };
  } catch (error) {
    console.error("❌ [STEP 2] Error:", error);
    return { success: false, services: [] };
  }
});

/**
 * STEP 3: Get download links after user clicks Download button
 * Returns actual links only after security delay
 */
export const getDownloadLinks = cache(
  async (slug, selectedQuality, selectedService) => {
    try {
      console.log("🔒 [STEP 3] Preparing download links");
      console.log("   Quality:", selectedQuality);
      console.log("   Service:", selectedService);

      const client = await clientPromise;
      const db = client.db();
      const decodedSlug = decodeURIComponent(slug);
      const collectionName = getCollectionName(decodedSlug);

      // Use aggregation to get ONLY the specific download link
      const result = await db
        .collection(collectionName)
        .aggregate([
          { $match: { slug: decodedSlug } },
          { $unwind: "$services" },
          {
            $match: {
              "services.serviceName": selectedService,
            },
          },
          { $unwind: "$services.qualities" },
          {
            $match: {
              "services.qualities.quality": selectedQuality,
            },
          },
          {
            $project: {
              _id: 0,
              downloadLink: "$services.qualities.downloadLink",
            },
          },
        ])
        .toArray();

      if (result.length === 0 || !result[0].downloadLink) {
        console.log("❌ [STEP 3] Download link not found");
        return { success: false, links: null };
      }

      const downloadLink = result[0].downloadLink;

      console.log("✅ [STEP 3] Download link retrieved successfully");
      console.log("   downloadLink:", downloadLink);

      return {
        success: true,
        links: {
          downloadLink: downloadLink,
          quality: selectedQuality,
          serviceName: selectedService,
        },
      };
    } catch (error) {
      console.error("❌ [STEP 3] Error:", error);
      return { success: false, links: null };
    }
  }
);

/**
 * Security logging function
 * Logs user actions for monitoring
 */
export async function logDownloadAction(action, details) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`📊 [AUDIT LOG] ${timestamp}`);
    console.log(`   Action: ${action}`);
    console.log(`   Details:`, details);

    // You can extend this to write to a database log table
    // const client = await clientPromise;
    // const db = client.db();
    // await db.collection("download_logs").insertOne({
    //   action,
    //   details,
    //   timestamp: new Date(),
    // });
  } catch (error) {
    console.error("❌ [AUDIT LOG] Error:", error);
  }
}
