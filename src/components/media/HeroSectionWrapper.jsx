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

  // For episodes, we need allEpisodes for isLastEpisode calculation
  let serializedMedia;
  if (type === CONTENT_TYPES.EPISODE) {
    const relatedData = await relatedHandlers[type](data);
    serializedMedia = serializers[type](
      { ...data, allEpisodes: relatedData.allEpisodes },
      true
    );
  } else if (type === CONTENT_TYPES.SEASON) {
    serializedMedia = serializers[type](data, true);
  } else {
    serializedMedia = serializers[type](data);
  }

  return <HeroSection media={serializedMedia} type={type} />;
}
