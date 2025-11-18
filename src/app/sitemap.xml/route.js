import { getAllMediaSlugsForSitemap } from "@/lib/sitemapUtils";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return new NextResponse("Site URL not configured", { status: 500 });
  }

  const staticPaths = ["/", "/films", "/series"];
  const mediaSlugs = await getAllMediaSlugsForSitemap();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths
  .map((path) => {
    const lastmod = new Date().toISOString().split("T")[0];
    return `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  })
  .join("")}
${mediaSlugs
  .map((item) => {
    const lastmod = item.lastUpdated
      ? new Date(item.lastUpdated).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    return `
  <url>
    <loc>${baseUrl}/${item.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("")}
</urlset>`.trim();

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
