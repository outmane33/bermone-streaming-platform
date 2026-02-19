// lib/verifyToken.js
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export async function verifyMediaToken(slug, action, payload, sig) {
  const headersList = await headers();
  const referer = headersList.get("referer") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // ✅ جاء من الموقع (رفريش، navigation) — اسمح ليه بلا token
  if (referer.startsWith(siteUrl)) return;

  // ❌ ما جاءش من الموقع — تحقق من token (بلا expiry)
  if (!payload || !sig) notFound();

  const secret = process.env.MEDIA_SECRET;
  if (!secret) notFound();

  const encoder = new TextEncoder();

  let key;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    notFound();
  }

  let isValid;
  try {
    isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(sig, "base64url"),
      encoder.encode(payload),
    );
  } catch {
    notFound();
  }

  if (!isValid) notFound();

  const [tokenSlug, tokenAction] = payload.split(":");
  // ✅ ما كنتحققوش من expires — الصفحة تدوم بلا حد
  const decodedSlug = decodeURIComponent(slug);

  if (tokenSlug !== decodedSlug) notFound();
  if (tokenAction !== action) notFound();
}
