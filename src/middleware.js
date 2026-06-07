import { NextResponse, NextRequest } from "next/server";

function addSecurityHeaders(response) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

function isValidOrigin(origin) {
  const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL];
  return origin && allowedOrigins.includes(origin);
}

export function middleware(request) {
  // ✅ Inject current pathname for server components
  const headers = new Headers(request.headers);
  headers.set("x-current-path", request.nextUrl.pathname);
  const requestWithHeaders = new NextRequest(request, { headers });

  const { pathname } = requestWithHeaders.nextUrl;

  // 🔐 Origin check (unchanged)
  if (
    pathname.startsWith("/api/download") ||
    pathname.startsWith("/api/iframe") ||
    pathname.startsWith("/api/qualities") ||
    pathname.startsWith("/api/server") ||
    pathname.startsWith("/api/services")
  ) {
    const origin = requestWithHeaders.headers.get("origin");
    const referer = requestWithHeaders.headers.get("referer");
    const reqOrigin = origin || (referer && new URL(referer).hostname) || null;

    if (!isValidOrigin(reqOrigin)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Invalid origin" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // ❌ Removed root redirect block

  // ✅ Keep category return logic as-is (no changes needed)
  if (
    pathname.startsWith("/category/") ||
    pathname === "/films" ||
    pathname === "/series"
  ) {
    const returnUrl =
      requestWithHeaders.cookies.get("categoryReturnUrl")?.value;
    if (returnUrl) {
      try {
        const decodedUrl = decodeURIComponent(returnUrl);
        const returnUrlObj = new URL(decodedUrl, request.url);
        if (returnUrlObj.pathname === pathname) {
          const savedParams = returnUrlObj.searchParams;
          const currentParams = new URLSearchParams(
            requestWithHeaders.nextUrl.search,
          );
          const savedPage = savedParams.get("page");
          const savedSort = savedParams.get("sort");
          const currentPage = currentParams.get("page");
          const currentSort = currentParams.get("sort");

          if (savedPage && !currentPage && savedSort === currentSort) {
            const response = NextResponse.redirect(
              new URL(decodedUrl, request.url),
            );
            response.cookies.delete("categoryReturnUrl");
            return addSecurityHeaders(response);
          }

          if (currentPage || (!savedPage && !currentPage)) {
            const response = NextResponse.next();
            response.cookies.delete("categoryReturnUrl");
            return addSecurityHeaders(response);
          }
        }
      } catch (e) {
        console.error("❌ Middleware error in returnUrl logic");
      }
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
