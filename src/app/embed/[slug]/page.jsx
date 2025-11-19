// app/embed/[slug]/page.jsx
import { notFound } from "next/navigation";
import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import { findContentBySlug } from "@/lib/contentUtils";

const getServiceManager = cache(async (serviceName) => {
  try {
    const { db } = await connectToDatabase();
    return await db
      .collection("servicemanagers")
      .findOne({ name: serviceName });
  } catch (error) {
    console.error("💥 Error in embed getServiceManager:", error);
    return null;
  }
});

// ✅ Move static CSS to a const (no indentation, no dynamic parts)
const EMBED_CSS = `body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000}iframe{display:block;width:100vw;height:100vh;border:none}`;

export default async function EmbedPage({ params, searchParams }) {
  const { slug } = params;
  const { server: serverName, quality } = searchParams;

  if (!serverName) notFound();

  try {
    const { content } = await findContentBySlug(slug);
    if (!content) notFound();

    const service = content.services.find((s) => s.serviceName === serverName);
    if (!service?.qualities?.length) notFound();

    const selectedQuality = quality
      ? service.qualities.find((q) => q.quality === quality)
      : service.qualities.find((q) => q.quality.includes("1080p")) ||
        service.qualities[0];

    if (!selectedQuality?.iframe) notFound();

    const manager = await getServiceManager(serverName);
    if (!manager?.iframeUrl) notFound();

    const actualIframeUrl = `${manager.iframeUrl}${selectedQuality.iframe}`;

    // ✅ Render minimal, deterministic HTML
    return (
      <html lang="ar" dir="rtl">
        <head>
          <meta name="robots" content="noindex, nofollow" />
          <meta charSet="utf-8" />
          <title>مشغل الفيديو</title>
          {/* ✅ suppressHydrationWarning + exact string */}
          <style
            suppressHydrationWarning={true}
            dangerouslySetInnerHTML={{ __html: EMBED_CSS }}
          />
        </head>
        <body suppressHydrationWarning={true}>
          <iframe
            src={actualIframeUrl}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
          />
        </body>
      </html>
    );
  } catch (err) {
    console.error("❌ Embed page error:", err);
    notFound();
  }
}
