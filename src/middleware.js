// middleware.js

import { NextResponse } from "next/server";

// ===============================
// ⚙️ RATE LIMIT CONFIGURATION
// ===============================
const CONFIG = {
  WINDOW_MS: 60000,
  MAX_REQUESTS: 60,
  BLOCK_DURATION: 180000,
  ENABLE_PROGRESSIVE: true,
  MAX_VIOLATIONS: 3,
  MAX_BLOCK_DURATION: 900000,
  CLEANUP_THRESHOLD: 5000,
  VIOLATION_DECAY_TIME: 1800000,
};

const rateLimit = new Map();
const violations = new Map();

// ===============================
// 🔒 Helper function to add security headers
// ===============================
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

function checkRateLimit(ip) {
  const now = Date.now();
  const violation = violations.get(ip);
  if (violation && now < violation.blockUntil) {
    return {
      allowed: false,
      remainingTime: Math.ceil((violation.blockUntil - now) / 1000),
      reason: "blocked",
      violationCount: violation.count,
    };
  }

  if (rateLimit.size > CONFIG.CLEANUP_THRESHOLD) {
    const cutoff = now - CONFIG.WINDOW_MS;
    for (const [key, data] of rateLimit.entries()) {
      if (data.resetTime < cutoff) {
        rateLimit.delete(key);
      }
    }
  }

  if (violations.size > CONFIG.CLEANUP_THRESHOLD) {
    const decayCutoff = now - CONFIG.VIOLATION_DECAY_TIME;
    for (const [key, data] of violations.entries()) {
      if (data.blockUntil < decayCutoff) {
        violations.delete(key);
      }
    }
  }

  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + CONFIG.WINDOW_MS,
    });
    return { allowed: true };
  }

  if (userLimit.count >= CONFIG.MAX_REQUESTS) {
    const currentViolation = violations.get(ip) || {
      count: 0,
      lastViolation: 0,
    };
    currentViolation.count++;
    currentViolation.lastViolation = now;

    let blockDuration;

    if (CONFIG.ENABLE_PROGRESSIVE) {
      blockDuration =
        CONFIG.BLOCK_DURATION *
        Math.min(currentViolation.count, CONFIG.MAX_VIOLATIONS);
      blockDuration = Math.min(blockDuration, CONFIG.MAX_BLOCK_DURATION);
    } else {
      blockDuration = CONFIG.BLOCK_DURATION;
    }

    currentViolation.blockUntil = now + blockDuration;
    violations.set(ip, currentViolation);

    console.log(
      `🚫 Rate limit violation - IP: ${ip}, Count: ${
        currentViolation.count
      }, Block: ${blockDuration / 1000}s`
    );

    return {
      allowed: false,
      remainingTime: Math.ceil(blockDuration / 1000),
      reason: "rate_limit",
      violationCount: currentViolation.count,
    };
  }

  userLimit.count++;
  return { allowed: true };
}

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const ip =
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // ===============================
  // 1️⃣ Rate Limiting Check
  // ===============================
  const rateLimitResult = checkRateLimit(ip);

  if (!rateLimitResult.allowed) {
    const minutes = Math.floor(rateLimitResult.remainingTime / 60);
    const seconds = rateLimitResult.remainingTime % 60;

    const timeMessage =
      minutes > 0
        ? `${minutes} minute${minutes > 1 ? "s" : ""} ${
            seconds > 0 ? `and ${seconds} seconds` : ""
          }`
        : `${seconds} second${seconds > 1 ? "s" : ""}`;

    const message =
      rateLimitResult.reason === "blocked"
        ? `You are temporarily blocked due to too many requests. Try again in ${timeMessage}.`
        : `Too many requests. Please try again in ${timeMessage}.`;

    console.log(
      `⚠️ Blocked request - IP: ${ip}, Reason: ${rateLimitResult.reason}, Violations: ${rateLimitResult.violationCount}`
    );

    return NextResponse.json(
      {
        success: false,
        error: message,
        retryAfter: rateLimitResult.remainingTime,
        violationCount: rateLimitResult.violationCount || 0,
        blocked: true,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.remainingTime),
          "X-RateLimit-Limit": String(CONFIG.MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(
            Math.ceil(Date.now() / 1000) + rateLimitResult.remainingTime
          ),
        },
      }
    );
  }

  // ===============================
  // 2️⃣ Category Return URL Logic
  // ===============================
  if (
    pathname.startsWith("/category/") ||
    pathname === "/films" ||
    pathname === "/series" ||
    pathname === "/"
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
              console.log("🔄 Middleware redirecting to:", decodedUrl);
              const response = NextResponse.redirect(
                new URL(decodedUrl, request.url)
              );
              response.cookies.delete("categoryReturnUrl");
              return addSecurityHeaders(response); // ✅ أضف headers للـ redirect
            }
          }

          if (currentPage || (!savedPage && !currentPage)) {
            const response = NextResponse.next();
            response.cookies.delete("categoryReturnUrl");
            return addSecurityHeaders(response); // ✅ أضف headers
          }
        }
      } catch (e) {
        console.error("❌ Middleware error:", e);
      }
    }
  }

  // ===============================
  // 3️⃣ Default response with security headers
  // ===============================
  const response = NextResponse.next();
  return addSecurityHeaders(response); // ✅ أضف headers لكل الصفحات
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
