// middleware.js - حماية متقدمة ضد Puppeteer
import { NextResponse } from "next/server";

// ==================== 🛡️ كشف Puppeteer المتقدم ====================

const BLOCKED_BOTS = [
  "python-requests",
  "python",
  "curl",
  "wget",
  "scrapy",
  "selenium",
  "puppeteer",
  "playwright",
  "phantomjs",
  "axios/",
  "node-fetch",
  "httpx",
  "go-http-client",
  "java/",
  "bot/",
  "crawler",
  "spider",
  "scraper",
  "headless",
  "automation",
];

const HEADLESS_INDICATORS = [
  "headlesschrome",
  "headless",
  "phantomjs",
  "selenium",
  "webdriver",
  "chrome-lighthouse",
];

function isBotUserAgent(userAgent) {
  if (!userAgent || userAgent.length < 10) return true;
  const ua = userAgent.toLowerCase();
  if (BLOCKED_BOTS.some((bot) => ua.includes(bot))) return true;
  if (HEADLESS_INDICATORS.some((indicator) => ua.includes(indicator)))
    return true;
  return false;
}

/**
 * 🎯 الكشف المتقدم عن Puppeteer - الطريقة الصحيحة
 */
function detectPuppeteerAdvanced(request) {
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const suspicionScore = {
    score: 0,
    reasons: [],
  };

  const userAgent = headers["user-agent"] || "";
  const ua = userAgent.toLowerCase();

  // ==================== 🔴 فحوصات حاسمة ====================

  // 1. فحص Chrome DevTools Protocol (Puppeteer يستخدمه دائماً)
  if (headers["chrome-devtools-protocol"] || headers["cdp-session-id"]) {
    suspicionScore.score += 100;
    suspicionScore.reasons.push("CDP header detected");
    return suspicionScore;
  }

  // 2. فحص WebDriver (حتى في non-headless mode)
  if (headers["webdriver"] || headers["selenium"]) {
    suspicionScore.score += 100;
    suspicionScore.reasons.push("WebDriver detected");
    return suspicionScore;
  }

  // 3. فحص Navigator.webdriver fingerprint
  // Puppeteer يضيف خصائص معينة حتى مع --disable-blink-features=AutomationControlled
  if (headers["sec-ch-ua-bitness"] && headers["sec-ch-ua-full-version"]) {
    // المتصفحات الطبيعية ترسل هذه مع sec-ch-ua-platform
    if (!headers["sec-ch-ua-platform"]) {
      suspicionScore.score += 50;
      suspicionScore.reasons.push("Incomplete Client Hints");
    }
  }

  // 4. فحص Permissions-Policy (Puppeteer لا يرسلها بشكل صحيح)
  const secFetchDest = headers["sec-fetch-dest"];
  const secFetchMode = headers["sec-fetch-mode"];
  const secFetchSite = headers["sec-fetch-site"];

  // Puppeteer غالباً يفشل في إرسال Sec-Fetch headers بشكل متسق
  if (ua.includes("chrome/")) {
    // Chrome version check
    const chromeMatch = ua.match(/chrome\/(\d+)/);
    if (chromeMatch) {
      const version = parseInt(chromeMatch[1]);
      // Chrome 76+ يرسل Sec-Fetch headers
      if (version >= 76) {
        if (!secFetchDest || !secFetchMode || !secFetchSite) {
          suspicionScore.score += 45;
          suspicionScore.reasons.push("Missing Sec-Fetch headers (Chrome 76+)");
        }
      }
    }
  }

  // 5. فحص Accept-Language pattern
  const acceptLang = headers["accept-language"];
  if (!acceptLang) {
    suspicionScore.score += 30;
    suspicionScore.reasons.push("No Accept-Language");
  } else if (acceptLang === "en-US" || acceptLang === "en") {
    // Puppeteer default
    suspicionScore.score += 15;
    suspicionScore.reasons.push("Default Puppeteer language");
  }

  // 6. فحص Accept header pattern
  const accept = headers["accept"];
  if (!accept) {
    suspicionScore.score += 30;
    suspicionScore.reasons.push("No Accept header");
  } else if (accept === "*/*") {
    // Puppeteer sometimes sends this
    suspicionScore.score += 25;
    suspicionScore.reasons.push("Generic Accept header");
  }

  // 7. فحص Connection header
  // Puppeteer يرسل "keep-alive" بحروف صغيرة دائماً
  const connection = headers["connection"];
  if (connection && connection === "keep-alive") {
    // المتصفحات الحديثة عادة لا ترسل هذا Header
    suspicionScore.score += 10;
    suspicionScore.reasons.push("Explicit keep-alive");
  }

  // 8. فحص Chrome version patterns
  const chromeMatch = ua.match(/chrome\/(\d+)/i);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1]);

    if (version < 90) {
      suspicionScore.score += 20;
      suspicionScore.reasons.push("Old Chrome version");
    }
  }

  // 9. فحص Upgrade-Insecure-Requests
  // المتصفحات الحقيقية ترسل هذا
  if (!headers["upgrade-insecure-requests"]) {
    suspicionScore.score += 15;
    suspicionScore.reasons.push("No Upgrade-Insecure-Requests");
  }

  // 10. فحص Sec-CH-UA headers (Chrome Client Hints)
  const secChUa = headers["sec-ch-ua"];
  const secChUaMobile = headers["sec-ch-ua-mobile"];
  const secChUaPlatform = headers["sec-ch-ua-platform"];

  if (ua.includes("chrome/")) {
    const chromeMatch = ua.match(/chrome\/(\d+)/);
    if (chromeMatch) {
      const version = parseInt(chromeMatch[1]);
      // Chrome 89+ يرسل Client Hints
      if (version >= 89) {
        if (!secChUa || !secChUaMobile || !secChUaPlatform) {
          suspicionScore.score += 40;
          suspicionScore.reasons.push("Missing Client Hints (Chrome 89+)");
        }
      }
    }
  }

  // 11. فحص Accept-Encoding pattern
  const acceptEncoding = headers["accept-encoding"];
  if (!acceptEncoding) {
    suspicionScore.score += 25;
    suspicionScore.reasons.push("No Accept-Encoding");
  } else {
    // المتصفحات الحديثة ترسل: gzip, deflate, br
    if (!acceptEncoding.includes("br")) {
      suspicionScore.score += 15;
      suspicionScore.reasons.push("No Brotli support");
    }
  }

  // 12. فحص DNT (Do Not Track)
  // Puppeteer لا يرسل DNT headers عادة
  // هذا فحص ضعيف لكنه يساعد

  // 13. فحص Cache-Control patterns
  const cacheControl = headers["cache-control"];
  if (cacheControl === "no-cache") {
    // Puppeteer sometimes sends this
    suspicionScore.score += 10;
    suspicionScore.reasons.push("Suspicious Cache-Control");
  }

  // 14. فحص Referer patterns
  const referer = headers["referer"];
  if (!referer && secFetchSite === "same-origin") {
    // إذا كان من نفس الموقع ولا يوجد referer
    suspicionScore.score += 15;
    suspicionScore.reasons.push("Missing referer (same-origin)");
  }

  // 15. فحص viewport size patterns (لا يمكن فحصه من server-side)
  // لكن يمكننا فحص إذا كانت القيم غير طبيعية لاحقاً

  return suspicionScore;
}

/**
 * 🌐 فحص rate limiting بسيط (في الذاكرة)
 */
const requestTracker = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const timeWindow = 60 * 1000; // 1 دقيقة
  const maxRequests = 50; // 30 طلب في الدقيقة

  if (!requestTracker.has(ip)) {
    requestTracker.set(ip, []);
  }

  const requests = requestTracker.get(ip);

  // حذف الطلبات القديمة
  const recentRequests = requests.filter((time) => now - time < timeWindow);
  requestTracker.set(ip, recentRequests);

  if (recentRequests.length >= maxRequests) {
    return { blocked: true, count: recentRequests.length };
  }

  recentRequests.push(now);
  requestTracker.set(ip, recentRequests);

  return { blocked: false, count: recentRequests.length };
}

// ==================== الـ Middleware الرئيسي ====================

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // تخطي الملفات الثابتة
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

    // ==================== فحص 1: Rate Limiting ====================
    const rateLimit = checkRateLimit(ip);
    if (rateLimit.blocked) {
      console.log(
        `🚫 [RATE LIMIT] IP: ${ip} (${rateLimit.count} requests/min)`
      );
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Content-Type": "text/plain",
          "Retry-After": "60",
        },
      });
    }

    // ==================== فحص 2: User Agent ====================
    if (isBotUserAgent(userAgent)) {
      console.log(`🚫 [BOT BLOCKED] IP: ${ip}`);
      console.log(`   User-Agent: ${userAgent.substring(0, 100)}`);
      return new NextResponse("Access Denied", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    // ==================== فحص 3: كشف Puppeteer المتقدم ====================
    const puppeteerCheck = detectPuppeteerAdvanced(request);

    // حظر فوري للدرجات العالية
    if (puppeteerCheck.score >= 50) {
      console.log(`🤖 [PUPPETEER BLOCKED] IP: ${ip}`);
      console.log(`   Score: ${puppeteerCheck.score}`);
      console.log(`   Reasons: ${puppeteerCheck.reasons.join(", ")}`);
      console.log(`   User-Agent: ${userAgent.substring(0, 100)}`);

      return new NextResponse("Access Denied - Automation Detected", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    // تحذير للحالات المشبوهة
    if (puppeteerCheck.score >= 25) {
      console.log(`⚠️ [SUSPICIOUS] IP: ${ip}, Score: ${puppeteerCheck.score}`);
      console.log(`   Reasons: ${puppeteerCheck.reasons.join(", ")}`);
      // يمكنك تقليل threshold الحظر إلى 25 إذا أردت
    }

    // ==================== فحص 4: حماية API ====================
    if (pathname.startsWith("/api/")) {
      const referer = request.headers.get("referer");
      const origin = request.headers.get("origin");

      if (!referer && !origin) {
        console.log(`⚠️ [API WARNING] Direct API access from IP: ${ip}`);
        // يمكنك حظره:
        // return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  // ==================== Category Return URL Logic ====================
  if (
    !pathname.startsWith("/category/") &&
    pathname !== "/films" &&
    pathname !== "/series" &&
    pathname !== "/"
  ) {
    return NextResponse.next();
  }

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
            return response;
          }
        }

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
  matcher: ["/category/:path*", "/films", "/series", "/", "/api/:path*"],
};
