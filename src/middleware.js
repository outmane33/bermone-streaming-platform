// middleware.js (updated — origin validation + security headers)

import { NextResponse } from "next/server";

function addSecurityHeaders(response) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

// 🔐 Origin validation helper (sync, for middleware)
function isValidOrigin(origin) {
  const allowedOrigins = [process.env.NEXT_PUBLIC_SITE_URL];
  return origin && allowedOrigins.includes(origin);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔐 Enforce origin check on sensitive API-like routes
  if (
    pathname.startsWith("/api/download") ||
    pathname.startsWith("/api/iframe") ||
    pathname.startsWith("/api/qualities") ||
    pathname.startsWith("/api/server") ||
    pathname.startsWith("/api/services")
  ) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    // Fallback to referer host if origin is missing (e.g., some POST navigations)
    const reqOrigin = origin || (referer && new URL(referer).hostname) || null;

    if (!isValidOrigin(reqOrigin)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Invalid origin" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  const { pathname: urlPathname, search } = request.nextUrl;

  if (urlPathname === "/") {
    const url = request.nextUrl.clone();
    const searchParams = new URLSearchParams(url.search);

    if (!searchParams.has("sort")) {
      searchParams.set("sort", "latest-added");
      url.search = searchParams.toString();
      const response = NextResponse.redirect(url);
      return addSecurityHeaders(response);
    }
  }

  if (
    urlPathname.startsWith("/category/") ||
    urlPathname === "/films" ||
    urlPathname === "/series"
  ) {
    const returnUrl = request.cookies.get("categoryReturnUrl")?.value;

    if (returnUrl) {
      try {
        const decodedUrl = decodeURIComponent(returnUrl);
        const returnUrlObj = new URL(decodedUrl, request.url);

        if (returnUrlObj.pathname === urlPathname) {
          const savedParams = returnUrlObj.searchParams;
          const currentParams = new URLSearchParams(search);

          const savedPage = savedParams.get("page");
          const savedSort = savedParams.get("sort");
          const currentPage = currentParams.get("page");
          const currentSort = currentParams.get("sort");

          if (savedPage && !currentPage) {
            const sortMatches = savedSort === currentSort;
            if (sortMatches) {
              const response = NextResponse.redirect(
                new URL(decodedUrl, request.url)
              );
              response.cookies.delete("categoryReturnUrl");
              return addSecurityHeaders(response);
            }
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
