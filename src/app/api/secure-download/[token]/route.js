// app/api/secure-download/[token]/route.js
import { NextResponse } from "next/server";
import {
  validateDownloadToken,
  markTokenAsUsed,
  logDownloadAction,
} from "@/actions/download";

export async function GET(request, { params }) {
  try {
    const { token } = params;

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    console.log(
      `🔐 [PROXY] Download request for token: ${token} from IP: ${ip}`
    );

    const validation = await validateDownloadToken(token);

    if (!validation.valid) {
      console.log(`❌ [PROXY] Invalid token: ${validation.reason}`);

      await logDownloadAction("DOWNLOAD_BLOCKED", {
        token,
        reason: validation.reason,
        ip,
      });

      return new NextResponse(
        JSON.stringify({
          error: "Invalid or expired download link",
          reason: validation.reason,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await logDownloadAction("DOWNLOAD_GRANTED", {
      token,
      ip,
      metadata: validation.metadata,
    });

    console.log(`✅ [PROXY] Redirecting to: ${validation.realLink}`);

    // Redirect to real download link
    return NextResponse.redirect(validation.realLink, 302);
  } catch (error) {
    console.error("❌ [PROXY] Error:", error);

    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
