import HeroSection from "@/components/shared/heroSection/HeroSection";
import { relatedHandlers } from "@/lib/relatedHandlers";
import { CONTENT_TYPES } from "@/lib/mediaResolver";
import { serializers } from "@/lib/mediaSerializers";
import { resolveMediaBySlug } from "@/lib/mediaResolver";

export default async function HeroSectionWrapper({ slug }) {
  const resolved = await resolveMediaBySlug(slug);

  const { type, data } = resolved;

  let serializedMedia;
  let seriesSlug = null;

  if (type === CONTENT_TYPES.EPISODE) {
    const relatedData = await relatedHandlers[type](data);
    serializedMedia = serializers[type](
      { ...data, allEpisodes: relatedData.allEpisodes },
      true
    );
    seriesSlug = data.series?.slug;
  } else if (type === CONTENT_TYPES.SEASON) {
    serializedMedia = serializers[type](data, true);
    seriesSlug = data.series?.slug;
  } else {
    serializedMedia = serializers[type](data);
  }

  return (
    <HeroSection media={serializedMedia} type={type} seriesSlug={seriesSlug} />
  );
}
