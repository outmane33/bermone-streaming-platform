import connectToDatabase from "@/lib/mongodb";

export async function getAllMediaSlugsForSitemap() {
  try {
    const { client, db } = await connectToDatabase();

    const [films, seriesList, seasons] = await Promise.all([
      db
        .collection("films")
        .find({}, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
        .toArray(),
      db
        .collection("series")
        .find({}, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
        .toArray(),
      db
        .collection("seasons")
        .find({}, { projection: { slug: 1, updatedAt: 1, createdAt: 1 } })
        .toArray(),
    ]);

    const normalize = (items) =>
      items.map((doc) => ({
        slug: doc.slug,
        lastUpdated: doc.updatedAt || doc.createdAt,
      }));

    return [
      ...normalize(films),
      ...normalize(seriesList),
      ...normalize(seasons),
    ];
  } catch (error) {
    console.error("❌ Sitemap fetch error");
    return [];
  }
}
