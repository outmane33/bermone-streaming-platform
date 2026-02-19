"use server";

async function createSignedToken(slug, action) {
  const secret = process.env.MEDIA_SECRET;
  const payload = `${slug}:${action}`; // 👈 حذفنا timestamp — بلا expiry

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const token = Buffer.from(sig).toString("base64url");

  return { payload, token };
}

export async function handleWatch(slug) {
  const { payload, token } = await createSignedToken(slug, "live");
  return `/${slug}/live?p=${encodeURIComponent(payload)}&t=${token}`;
}

export async function handleDownload(slug) {
  const { payload, token } = await createSignedToken(slug, "download");
  return `/${slug}/download?p=${encodeURIComponent(payload)}&t=${token}`;
}
