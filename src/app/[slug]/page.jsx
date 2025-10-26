import { Suspense } from "react";
import {
  SkeletonHero,
  SkeletonRelated,
} from "@/components/shared/skeletons/Skeletons";

import { metadataGenerators } from "@/lib/mediaSerializers";
import { resolveMediaBySlug } from "@/lib/mediaResolver";
import RelatedSectionWrapper from "@/components/media/RelatedSectionWrapper";
import HeroSectionWrapper from "@/components/media/HeroSectionWrapper";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    return { title: "Content Not Found" };
  }

  return metadataGenerators[resolved.type](resolved.data);
}

export default async function MediaPage({ params }) {
  const { slug } = await params;

  return (
    <div className="space-y-6 mb-12">
      <Suspense fallback={<SkeletonHero />}>
        <HeroSectionWrapper slug={slug} />
      </Suspense>

      <Suspense fallback={<SkeletonRelated />}>
        <RelatedSectionWrapper slug={slug} />
      </Suspense>
    </div>
  );
}
