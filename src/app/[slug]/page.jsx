// app/[slug]/page.jsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  SkeletonHero,
  SkeletonRelated,
} from "@/components/shared/skeletons/Skeletons";
import { metadataGenerators } from "@/lib/mediaSerializers";
import { resolveMediaBySlug } from "@/lib/mediaResolver";
import RelatedSectionWrapper from "@/components/media/RelatedSectionWrapper";
import HeroSectionWrapper from "@/components/media/HeroSectionWrapper";

// ✅ Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    return { title: `الصفحة غير موجودة | ${process.env.NEXT_PUBLIC_SITE_URL}` };
  }

  return metadataGenerators[resolved.type](resolved.data);
}

// ✅ Main page component
export default async function MediaPage({ params }) {
  const { slug } = await params;
  const resolved = await resolveMediaBySlug(slug);

  if (!resolved) {
    notFound(); // Triggers real 404 + status code
  }

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

// ✅ ISR: Revalidate every 1 hour (3600 seconds)
// - First visit: builds & caches page
// - Next visits: served from CDN (ultra-fast)
// - After 1h: next request rebuilds in background
export const revalidate = 3600;

// ✅ Allow dynamic slugs (not defined at build time)
export const dynamicParams = true;
