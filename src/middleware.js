// middleware.js - في الجذر (نفس مستوى app/)
import { NextResponse } from "next/server";

// ==================== 🛡️ حماية البوتات ====================

// قائمة User Agents المحظورة
const BLOCKED_BOTS = [
  "python-requests",
  "python",
  "curl",
  "wget",
  "scrapy",
  "selenium",
  "puppeteer",
  "playwright",
  "axios/",
  "node-fetch",
  "httpx",
  "go-http-client",
  "java/",
  "bot/",
  "crawler",
  "spider",
  "scraper",
];

/**
 * التحقق من User Agent المشبوه
 */
function isBotUserAgent(userAgent) {
  if (!userAgent || userAgent.length < 10) return true;

  const ua = userAgent.toLowerCase();
  return BLOCKED_BOTS.some((bot) => ua.includes(bot));
}

/**
 * التحقق من Headers المفقودة (المتصفحات الحقيقية ترسلها)
 */
function hasMissingBrowserHeaders(request) {
  const accept = request.headers.get("accept");
  const acceptLanguage = request.headers.get("accept-language");

  // المتصفحات الحقيقية دائماً ترسل Accept header
  if (!accept) return true;

  // معظم المتصفحات ترسل Accept-Language
  if (!acceptLanguage) return true;

  return false;
}

// ==================== الـ Middleware الرئيسي ====================

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // ==================== 🛡️ 1. فحص البوتات أولاً ====================

  // تخطي الملفات الثابتة من الفحص
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(
      /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i
    );

  if (!isStaticFile) {
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // فحص 1: User Agent مشبوه
    if (isBotUserAgent(userAgent)) {
      console.log(`🚫 [BOT BLOCKED] IP: ${ip}`);
      console.log(`   User-Agent: ${userAgent.substring(0, 60)}...`);

      return new NextResponse("Access Denied - Bot Detected", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    // فحص 2: Headers مفقودة (سلوك مشبوه)
    if (hasMissingBrowserHeaders(request)) {
      console.log(`⚠️ [SUSPICIOUS] Missing headers from IP: ${ip}`);
      console.log(`   User-Agent: ${userAgent.substring(0, 60)}...`);

      // يمكنك حظره أو تسجيله فقط
      // return new NextResponse('Forbidden', { status: 403 });
    }

    // فحص 3: حماية API Routes (إذا كنت تستخدمها)
    if (pathname.startsWith("/api/")) {
      const referer = request.headers.get("referer");
      const origin = request.headers.get("origin");

      // طلب API بدون referer أو origin = مشبوه
      if (!referer && !origin) {
        console.log(`⚠️ [API WARNING] Direct API access from IP: ${ip}`);
        // يمكنك حظره إذا أردت:
        // return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  // ==================== 2. الكود الأصلي (Category Return URL) ====================

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

// ==================== الإعدادات ====================

export const config = {
  // نفس matcher الأصلي + حماية على كل المسارات
  matcher: [
    "/category/:path*",
    "/films",
    "/series",
    "/",
    // إضافة: حماية API إذا كنت تستخدمها
    "/api/:path*",
  ],
};
