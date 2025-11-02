// src/components/media/HeroSectionWrapper.jsx
import { notFound } from "next/navigation";
import HeroSection from "@/components/shared/heroSection/HeroSection";
import { relatedHandlers } from "@/lib/relatedHandlers";
import { CONTENT_TYPES } from "@/lib/mediaResolver";
import { serializers } from "@/lib/mediaSerializers";
import { resolveMediaBySlug } from "@/lib/mediaResolver";

export default async function HeroSectionWrapper({ slug }) {
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    notFound();
  }

  const { type, data } = resolved;

  let serializedMedia;
  let seriesSlug = null; // 👈 Initialize

  if (type === CONTENT_TYPES.EPISODE) {
    // Fetch extra data if needed
    const relatedData = await relatedHandlers[type](data);
    serializedMedia = serializers[type](
      { ...data, allEpisodes: relatedData.allEpisodes },
      true
    );
    // ✅ Extract series slug from episode data
    seriesSlug = data.series?.slug;
  } else if (type === CONTENT_TYPES.SEASON) {
    serializedMedia = serializers[type](data, true);
    // ✅ Extract series slug from season data
    seriesSlug = data.series?.slug;
  } else {
    // Film or series — no back button needed
    serializedMedia = serializers[type](data);
    // seriesSlug remains null
  }

  return (
    <HeroSection
      media={serializedMedia}
      type={type}
      seriesSlug={seriesSlug} // 👈 Pass it down
    />
  );
}
