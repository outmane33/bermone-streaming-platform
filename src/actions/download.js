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
    const qualities = [
      ...new Set(
        content.services
          .flatMap((s) => s.qualities.map((q) => q.quality))
          .filter(Boolean)
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
    const { content } = await findContentBySlug(slug);
    if (!content) {
      return { success: false, error: "Content not found", services: [] };
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
    const { content } = await findContentBySlug(slug);
    if (!content) {
      return { success: false, error: "Content not found" };
    }
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
      downloadUrl: `${serviceManager.downloadUrl}${fileCode}`,
      quality,
      serviceName: serverName,
    };
  } catch (error) {
    console.error("💥 getDownloadLinks error:", error);
    return { success: false, error: "Failed to generate secure download link" };
  }
};
