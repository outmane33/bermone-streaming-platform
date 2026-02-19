// app/actions/mediaActions.js
"use server";

async function createSignedToken(slug, action) {
  const secret = process.env.MEDIA_SECRET;

  if (!secret) {
    throw new Error("MEDIA_SECRET is not defined");
  }

  const random = crypto.randomUUID();
  const expires = Date.now() + 6 * 60 * 60 * 1000;
  const payload = `${slug}:${action}:${expires}:${random}`;

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
  try {
    const { payload, token } = await createSignedToken(slug, "live");
    return `/${slug}/live?p=${encodeURIComponent(payload)}&t=${token}`;
  } catch (e) {
    console.error("handlelive error:", e);
    throw e;
  }
}

export async function handleDownload(slug) {
  try {
    const { payload, token } = await createSignedToken(slug, "download");
    return `/${slug}/download?p=${encodeURIComponent(payload)}&t=${token}`;
  } catch (e) {
    console.error("handleDownload error:", e);
    throw e;
  }
}
