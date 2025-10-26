// middleware.js - في الجذر (نفس مستوى app/)
import { NextResponse } from "next/server";

// ==================== 🛡️ حماية البوتات المتقدمة ====================

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

// علامات Headless browsers في User Agent
const HEADLESS_INDICATORS = [
  "headlesschrome",
  "headless",
  "phantomjs",
  "selenium",
  "webdriver",
  "chrome-lighthouse",
];

/**
 * التحقق من User Agent المشبوه
 */
function isBotUserAgent(userAgent) {
  if (!userAgent || userAgent.length < 10) return true;

  const ua = userAgent.toLowerCase();

  // فحص البوتات المعروفة
  if (BLOCKED_BOTS.some((bot) => ua.includes(bot))) {
    return true;
  }

  // فحص علامات Headless
  if (HEADLESS_INDICATORS.some((indicator) => ua.includes(indicator))) {
    return true;
  }

  return false;
}

/**
 * التحقق من Headers المفقودة
 */
function hasMissingBrowserHeaders(request) {
  const accept = request.headers.get("accept");
  const acceptLanguage = request.headers.get("accept-language");

  if (!accept) return true;
  if (!acceptLanguage) return true;

  return false;
}

/**
 * 🔍 كشف Puppeteer/Selenium المتقدم
 * فحص headers خاصة بـ automation tools
 */
function detectAutomationTool(request) {
  const headers = {
    // Chrome DevTools Protocol (Puppeteer uses this)
    cdp: request.headers.get("chrome-devtools-protocol"),

    // Selenium-specific headers
    selenium: request.headers.get("selenium"),
    webdriver: request.headers.get("webdriver"),

    // Browser automation headers
    automation: request.headers.get("automation"),

    // Connection header (automation tools sometimes send different values)
    connection: request.headers.get("connection"),

    // Accept-Encoding (check for unusual patterns)
    acceptEncoding: request.headers.get("accept-encoding"),

    // Sec-CH-UA headers (new Chrome feature, automation tools may not send them correctly)
    secChUa: request.headers.get("sec-ch-ua"),
    secChUaMobile: request.headers.get("sec-ch-ua-mobile"),
    secChUaPlatform: request.headers.get("sec-ch-ua-platform"),

    // User-Agent
    userAgent: request.headers.get("user-agent") || "",
  };

  const suspicionScore = {
    score: 0,
    reasons: [],
  };

  // 1. فحص Chrome DevTools Protocol
  if (headers.cdp) {
    suspicionScore.score += 100;
    suspicionScore.reasons.push("CDP header detected");
    return suspicionScore;
  }

  // 2. فحص Selenium/WebDriver headers
  if (headers.selenium || headers.webdriver) {
    suspicionScore.score += 100;
    suspicionScore.reasons.push("Automation header detected");
    return suspicionScore;
  }

  // 3. فحص User Agent patterns
  const ua = headers.userAgent.toLowerCase();

  // Headless Chrome pattern
  if (ua.includes("chrome") && ua.includes("headless")) {
    suspicionScore.score += 100;
    suspicionScore.reasons.push("Headless Chrome detected");
    return suspicionScore;
  }

  // 4. فحص Sec-CH-UA headers (متصفحات حديثة ترسلها)
  // إذا كان Chrome ولا يرسل Sec-CH-UA = مشبوه
  if (ua.includes("chrome") && !headers.secChUa) {
    suspicionScore.score += 40;
    suspicionScore.reasons.push("Missing Sec-CH-UA headers");
  }

  // 5. فحص Connection header غير عادية
  if (headers.connection && headers.connection.toLowerCase() === "upgrade") {
    suspicionScore.score += 20;
    suspicionScore.reasons.push("Unusual connection header");
  }

  // 6. فحص Accept-Encoding غير عادية
  // المتصفحات الحديثة ترسل: gzip, deflate, br
  if (headers.acceptEncoding && !headers.acceptEncoding.includes("br")) {
    suspicionScore.score += 15;
    suspicionScore.reasons.push("Outdated accept-encoding");
  }

  // 7. Chrome version patterns
  // Puppeteer often uses specific Chrome versions
  const chromeMatch = ua.match(/chrome\/(\d+)/i);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1]);
    // Puppeteer usually uses older Chrome versions
    if (version < 100 && ua.includes("chrome")) {
      suspicionScore.score += 10;
      suspicionScore.reasons.push("Old Chrome version");
    }
  }

  // 8. فحص platform consistency
  // مثلاً: يدعي أنه Windows لكن Sec-CH-UA-Platform تقول Mac
  if (headers.secChUaPlatform) {
    const platform = headers.secChUaPlatform.toLowerCase();
    if (ua.includes("windows") && !platform.includes("windows")) {
      suspicionScore.score += 30;
      suspicionScore.reasons.push("Platform mismatch");
    }
  }

  return suspicionScore;
}

/**
 * 🎯 فحص سلوك مشبوه من IP
 * (يحتاج Redis/Upstash في الإنتاج)
 */
async function checkRequestPattern(ip, pathname) {
  // في الإنتاج: استخدم Redis للتتبع
  // const requestCount = await redis.incr(`requests:${ip}:${Date.now()}`);
  // if (requestCount > 50) return { suspicious: true };

  return { suspicious: false };
}

// ==================== الـ Middleware الرئيسي ====================

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // ==================== 🛡️ 1. فحص البوتات والأتمتة ====================

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
      console.log(`   User-Agent: ${userAgent.substring(0, 80)}`);

      return new NextResponse("Access Denied - Bot Detected", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    // فحص 2: كشف أدوات الأتمتة (Puppeteer/Selenium)
    const automationCheck = detectAutomationTool(request);

    if (automationCheck.score >= 60) {
      console.log(`🤖 [AUTOMATION BLOCKED] IP: ${ip}`);
      console.log(`   Score: ${automationCheck.score}`);
      console.log(`   Reasons: ${automationCheck.reasons.join(", ")}`);
      console.log(`   User-Agent: ${userAgent.substring(0, 80)}`);

      return new NextResponse("Access Denied - Automation Detected", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    // تحذير للحالات المشبوهة (score بين 30-60)
    if (automationCheck.score >= 30) {
      console.log(`⚠️ [SUSPICIOUS] IP: ${ip}, Score: ${automationCheck.score}`);
      console.log(`   Reasons: ${automationCheck.reasons.join(", ")}`);
    }

    // فحص 3: Headers مفقودة
    if (hasMissingBrowserHeaders(request)) {
      console.log(`⚠️ [SUSPICIOUS] Missing headers from IP: ${ip}`);

      // يمكنك حظره:
      // return new NextResponse('Forbidden', { status: 403 });
    }

    // فحص 4: حماية API Routes
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
            console.log("🔄 Middleware redirecting to:", decodedUrl);
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

// ==================== الإعدادات ====================

export const config = {
  matcher: ["/category/:path*", "/films", "/series", "/", "/api/:path*"],
};
