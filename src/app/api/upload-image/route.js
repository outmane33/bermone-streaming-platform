// app/api/upload-image/route.js
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// Handle preflight (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173", // Your local admin URL
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type",
    },
  });
}

export async function POST(request) {
  // 1. Verify secret key (security)
  const authHeader = request.headers.get("authorization");
  const expectedSecret = "your_strong_secret_here";

  if (!expectedSecret) {
    console.error("❌ UPLOAD_SECRET is not set in environment variables");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, GIF allowed." },
        { status: 400 }
      );
    }

    // 4. Optional: Validate file size (Vercel Blob has 5MB limit on free plan)
    const arrayBuffer = await file.arrayBuffer();
    const fileSize = arrayBuffer.byteLength;
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max size: 10MB" },
        { status: 400 }
      );
    }

    // 5. Reconstruct Blob from buffer (needed after arrayBuffer)
    const blob = new Blob([arrayBuffer], { type: file.type });
    const filename = file.name || "uploaded-image";

    // 6. Upload to Vercel Blob (publicly accessible)
    const { url } = await put(`media/${Date.now()}-${filename}`, blob, {
      access: "public",
    });

    // 7. Return URL with CORS header
    const response = NextResponse.json({ url });
    response.headers.set(
      "Access-Control-Allow-Origin",
      "http://localhost:5173"
    );
    return response;
  } catch (error) {
    console.error("🔥 Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
