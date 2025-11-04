// middleware.js
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

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // ✅ 1. Handle Home redirect: / → /?sort=latest-added
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    const searchParams = new URLSearchParams(url.search);

    // Only redirect if NO "sort" param exists
    if (!searchParams.has("sort")) {
      searchParams.set("sort", "latest-added");
      url.search = searchParams.toString();
      const response = NextResponse.redirect(url);
      return addSecurityHeaders(response);
    }
    // If "sort" exists, continue normally
  }

  // ✅ 2. Your existing category/returnUrl logic
  if (
    pathname.startsWith("/category/") ||
    pathname === "/films" ||
    pathname === "/series"
  ) {
    const returnUrl = request.cookies.get("categoryReturnUrl")?.value;

    if (returnUrl) {
      try {
        const decodedUrl = decodeURIComponent(returnUrl);
        const returnUrlObj = new URL(decodedUrl, request.url);

        if (returnUrlObj.pathname === pathname) {
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
        console.error("❌ Middleware error in returnUrl logic:", e);
      }
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
