// download.js
"use server";
import { cache } from "react";
import clientPromise from "@/lib/mongodb";
import { isEpisodeSlug, cleanSlug } from "@/lib/pageUtils";

const getCollectionName = (slug) =>
  isEpisodeSlug(slug) ? "episodes" : "films";

export const getAvailableQualities = cache(async (slug) => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const decodedSlug = cleanSlug(slug);
    const collectionName = getCollectionName(decodedSlug);
    const result = await db
      .collection(collectionName)
      .aggregate([
        { $match: { slug: decodedSlug } },
        { $unwind: "$services" },
        { $unwind: "$services.qualities" },
        { $group: { _id: "$services.qualities.quality" } },
        { $project: { _id: 0, quality: "$_id" } },
      ])
      .toArray();

    return {
      success: result.length > 0,
      qualities: result.map((r) => r.quality),
      type: isEpisodeSlug(decodedSlug) ? "episode" : "film",
    };
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, qualities: [], type: null };
  }
});

export const getServicesForQuality = cache(async (slug, selectedQuality) => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const decodedSlug = cleanSlug(slug);
    const collectionName = getCollectionName(decodedSlug);
    const result = await db
      .collection(collectionName)
      .aggregate([
        { $match: { slug: decodedSlug } },
        { $unwind: "$services" },
        { $unwind: "$services.qualities" },
        { $match: { "services.qualities.quality": selectedQuality } },
        { $group: { _id: "$services.serviceName" } },
        { $project: { _id: 0, serviceName: "$_id" } },
      ])
      .toArray();

    return {
      success: result.length > 0,
      services: result.map((r) => ({ serviceName: r.serviceName })),
    };
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, services: [] };
  }
});

export const getDownloadLinks = cache(
  async (slug, selectedQuality, selectedService) => {
    try {
      const client = await clientPromise;
      const db = client.db();
      const decodedSlug = cleanSlug(slug);
      const collectionName = getCollectionName(decodedSlug);
      const result = await db
        .collection(collectionName)
        .aggregate([
          { $match: { slug: decodedSlug } },
          { $unwind: "$services" },
          { $match: { "services.serviceName": selectedService } },
          { $unwind: "$services.qualities" },
          { $match: { "services.qualities.quality": selectedQuality } },
          {
            $project: {
              _id: 0,
              downloadLink: "$services.qualities.downloadLink",
            },
          },
        ])
        .toArray();

      if (result.length === 0 || !result[0].downloadLink) {
        return { success: false, links: null };
      }

      return {
        success: true,
        links: {
          encodedDownloadLink: result[0].downloadLink,
          quality: selectedQuality,
          serviceName: selectedService,
        },
      };
    } catch (error) {
      console.error("❌ Error:", error);
      return { success: false, links: null };
    }
  }
);
