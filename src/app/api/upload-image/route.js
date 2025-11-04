// Public project: app/api/upload-image/route.js
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// Allow only POST requests
export const runtime = "edge"; // optional, but faster

export async function POST(request) {
  // 🔒 Optional: Add secret key for security (see Step 3)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.UPLOAD_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Optional: validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob (publicly accessible)
    const { url } = await put(`media/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
