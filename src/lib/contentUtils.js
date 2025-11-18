import connectToDatabase from "@/lib/mongodb";
import { cleanSlug } from "@/lib/pageUtils";
import { EXCLUDED_SERVERS } from "@/lib/data";
import { serializeDocument } from "@/actions/db-utils";

export function detectContentTypeFromSlug(slug) {
  if (slug.includes("فيلم")) return "film";
  if (slug.includes("مسلسل") && slug.includes("موسم") && slug.includes("حلقة"))
    return "episode";
  if (slug.includes("مسلسل") && slug.includes("موسم")) return "season";
  if (slug.includes("مسلسل")) return "series";
  return null;
}

export async function findContentBySlug(slug) {
  const cleanedSlug = cleanSlug(slug);
  const { db } = await connectToDatabase();

  const tryCollection = async (collName) => {
    return await db.collection(collName).findOne({ slug: cleanedSlug });
  };

  let content = null;
  let contentType = detectContentTypeFromSlug(slug);

  if (contentType === "film") content = await tryCollection("films");
  if (contentType === "episode") content = await tryCollection("episodes");
  if (contentType === "season") content = await tryCollection("seasons");
  if (contentType === "series") content = await tryCollection("series");

  if (!content) {
    content = await tryCollection("episodes");
    if (!content) content = await tryCollection("films");
    if (!content) content = await tryCollection("series");
    if (!content) content = await tryCollection("seasons");
    contentType = content?.slug.includes("فيلم")
      ? "film"
      : content?.slug.includes("حلقة")
      ? "episode"
      : content?.slug.includes("موسم")
      ? "season"
      : "series";
  }

  if (!content) return { content: null, contentType: null };

  const serialized = serializeDocument(content);
  if (Array.isArray(serialized?.services)) {
    serialized.services = serialized.services.filter(
      (s) => !EXCLUDED_SERVERS.includes(s.serviceName)
    );
  }

  return { content: serialized, contentType };
}
