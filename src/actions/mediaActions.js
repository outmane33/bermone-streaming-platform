"use server";

export async function handleWatch(slug) {
  return `/${slug}/live`;
}

export async function handleDownload(slug) {
  return `/${slug}/download`;
}
