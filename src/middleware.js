// middleware.js - ضعه في الجذر (نفس مستوى app/)

import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // فقط category pages و films page و series page
  if (
    !pathname.startsWith("/category/") &&
    pathname !== "/films" &&
    pathname !== "/series" &&
    pathname !== "/"
  ) {
    return NextResponse.next();
  }

  // جلب الـ URL المحفوظ من الكوكي
  const returnUrl = request.cookies.get("categoryReturnUrl")?.value;

  if (returnUrl) {
    try {
      const decodedUrl = decodeURIComponent(returnUrl);
      const returnUrlObj = new URL(decodedUrl, request.url);

      // تحقق: نفس الـ pathname؟
      if (returnUrlObj.pathname === pathname) {
        const savedParams = returnUrlObj.searchParams;
        const currentParams = new URLSearchParams(search);

        const savedPage = savedParams.get("page");
        const savedSort = savedParams.get("sort");
        const currentPage = currentParams.get("page");
        const currentSort = currentParams.get("sort");

        // إذا عندنا page محفوظة و ما عندناش في الـ URL الحالي
        if (savedPage && !currentPage) {
          // تحقق: إما نفس الـ sort أو كلاهما null
          const sortMatches = savedSort === currentSort;

          if (sortMatches) {
            console.log("🔄 Middleware redirecting to:", decodedUrl);
            const response = NextResponse.redirect(
              new URL(decodedUrl, request.url)
            );
            response.cookies.delete("categoryReturnUrl");
            return response;
          }
        }

        // إذا وصلنا للصفحة الصحيحة، حذف الكوكي
        if (currentPage || (!savedPage && !currentPage)) {
          const response = NextResponse.next();
          response.cookies.delete("categoryReturnUrl");
          return response;
        }
      }
    } catch (e) {
      console.error("Middleware error:", e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/category/:path*", "/films", "/series", "/"],
};
