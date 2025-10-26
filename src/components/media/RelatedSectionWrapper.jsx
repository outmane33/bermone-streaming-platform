import RelatedSection from "@/components/shared/realatedSection/RelatedSection";
import { resolveMediaBySlug } from "@/lib/mediaResolver";
import { relatedHandlers } from "@/lib/relatedHandlers";

export default async function RelatedSectionWrapper({ slug }) {
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    return null;
  }

  const { type, data } = resolved;
  const relatedData = await relatedHandlers[type](data);

  if (!relatedData.content || relatedData.content.length === 0) {
    return null;
  }

  return (
    <RelatedSection
      relatedMedia={relatedData.content}
      title={relatedData.title}
    />
  );
}
