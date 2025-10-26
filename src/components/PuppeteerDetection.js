// app/components/PuppeteerDetection.js
"use client";

import { useEffect } from "react";

export default function PuppeteerDetection() {
  useEffect(() => {
    // فحص فوري عند تحميل الصفحة
    const detectPuppeteer = () => {
      const suspicionScore = {
        score: 0,
        reasons: [],
      };

      // ==================== 🔴 فحوصات حاسمة فقط ====================

      // 1. فحص navigator.webdriver (الأهم والأدق!)
      if (navigator.webdriver === true) {
        suspicionScore.score += 100;
        suspicionScore.reasons.push("navigator.webdriver = true");
      }

      // 2. فحص CDP Runtime (Chrome DevTools Protocol)
      // Puppeteer يضيف هذه الخاصية دائماً
      if (
        window.document.$cdc_asdjflasutopfhvcZLmcfl_ ||
        window.$cdc_asdjflasutopfhvcZLmcfl_ ||
        document.$cdc_asdjflasutopfhvcZLmcfl_
      ) {
        suspicionScore.score += 100;
        suspicionScore.reasons.push("CDP Runtime detected");
      }

      // 3. فحص __webdriver_script_fn
      if (document.__webdriver_script_fn || window.__webdriver_script_fn) {
        suspicionScore.score += 100;
        suspicionScore.reasons.push("WebDriver script detected");
      }

      // 4. فحص automated browsing flags
      if (window.callPhantom || window._phantom || window.phantom) {
        suspicionScore.score += 100;
        suspicionScore.reasons.push("Phantom.js detected");
      }

      if (window.__nightmare) {
        suspicionScore.score += 100;
        suspicionScore.reasons.push("Nightmare.js detected");
      }

      // 5. فحص Selenium IDE
      if (
        document.__selenium_unwrapped ||
        document.__webdriver_evaluate ||
        document.__driver_evaluate
      ) {
        suspicionScore.score += 100;
        suspicionScore.reasons.push("Selenium detected");
      }

      // 6. فحص navigator.webdriver من خلال Object.getOwnPropertyDescriptor
      // هذا أدق من الفحص المباشر
      try {
        const navigatorProto = Object.getPrototypeOf(navigator);
        const descriptor = Object.getOwnPropertyDescriptor(
          navigatorProto,
          "webdriver"
        );

        if (descriptor && descriptor.get) {
          // إذا كانت getter موجودة، قد يكون Puppeteer حاول إخفاءها
          const getterStr = descriptor.get.toString();
          if (!getterStr.includes("[native code]")) {
            suspicionScore.score += 50;
            suspicionScore.reasons.push("Modified webdriver getter");
          }
        }
      } catch (e) {
        // تجاهل الأخطاء
      }

      // 7. فحص window.chrome (اختياري - قد يعطي false positives)
      // لا نستخدمه لوحده للحظر
      if (!window.chrome && navigator.userAgent.includes("Chrome")) {
        suspicionScore.score += 15;
        suspicionScore.reasons.push("Missing window.chrome in Chrome");
      }

      // 8. فحص permissions API (اختياري)
      if (navigator.permissions) {
        navigator.permissions
          .query({ name: "notifications" })
          .then((permissionStatus) => {
            // Puppeteer أحياناً يعطي نتائج غريبة
            // لكن هذا ليس دليل قوي
          })
          .catch(() => {
            // لا نحسب هذا في Score النهائي
          });
      }

      // 9. فحص plugins (تحذير فقط - Chrome الحديث لا يعرض plugins)
      // لا نستخدمه للحظر لأنه يعطي false positives كثيرة
      if (
        navigator.plugins.length === 0 &&
        !navigator.userAgent.includes("Mobile")
      ) {
        suspicionScore.score += 5;
        suspicionScore.reasons.push("No plugins (warning only)");
      }

      // 10. فحص languages
      if (!navigator.languages || navigator.languages.length === 0) {
        suspicionScore.score += 20;
        suspicionScore.reasons.push("No languages array");
      }

      // 11. فحص window dimensions غير طبيعية
      if (window.outerWidth === 0 || window.outerHeight === 0) {
        suspicionScore.score += 40;
        suspicionScore.reasons.push("Invalid window dimensions");
      }

      // 12. فحص hardwareConcurrency
      if (navigator.hardwareConcurrency === undefined) {
        suspicionScore.score += 15;
        suspicionScore.reasons.push("No hardwareConcurrency");
      }

      // ==================== إرسال النتيجة للـ server ====================

      // حظر فقط للدرجات العالية جداً (100+)
      if (suspicionScore.score >= 100) {
        console.log("🚫 Bot detected:", suspicionScore);
        sendDetectionResult(suspicionScore);
      } else if (suspicionScore.score >= 30) {
        // تحذير فقط - لا حظر
        console.log("⚠️ Suspicious activity:", suspicionScore);
      } else {
        console.log("✅ Normal user detected");
      }
    };

    // دالة إرسال النتيجة
    const sendDetectionResult = (result) => {
      fetch("/api/bot-detection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: result.score,
          reasons: result.reasons,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      })
        .then((response) => {
          if (response.status === 403) {
            // تم اكتشاف البوت
            console.log("🚫 Bot detected - Access denied");
            window.location.href = "/blocked";
          }
        })
        .catch((error) => {
          console.error("Detection error:", error);
        });
    };

    // تشغيل الفحص بعد ثانية واحدة (لتجنب false positives أثناء التحميل)
    const initialCheck = setTimeout(() => {
      detectPuppeteer();
    }, 1000);

    // فحص دوري كل 10 ثواني (بدلاً من 5)
    const interval = setInterval(() => {
      detectPuppeteer();
    }, 10000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, []);

  return null;
}
