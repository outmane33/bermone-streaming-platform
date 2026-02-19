"use server";

import connectToDatabase from "@/lib/mongodb";

export async function handleWatch(slug) {
  const { db } = await connectToDatabase();
  const record = await db
    .collection("films")
    .findOne({ slug }, { projection: { services: 1 } });

  const iframe = record?.services?.[0]?.qualities?.[0]?.iframe;
  if (!iframe) return null;

  return `/${slug}/live`;
}

export async function handleDownload(slug) {
  const { db } = await connectToDatabase();
  const record = await db
    .collection("films")
    .findOne({ slug }, { projection: { services: 1 } });

  const iframe = record?.services?.[0]?.qualities?.[0]?.iframe;
  if (!iframe) return null;

  return `/${slug}/download`;
}
