"use client";
import { useEffect, useState } from "react";

export default function AntiBotProtection() {
  const [blocked, setBlocked] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    // 🔍 فحص 1: WebDriver Detection
    const checkWebDriver = () => {
      // Puppeteer/Selenium يضيف navigator.webdriver
      if (navigator.webdriver) {
        return { detected: true, reason: "WebDriver detected" };
      }
      return { detected: false };
    };

    // 🔍 فحص 2: Chrome Detection (CDP)
    const checkChromeDevTools = () => {
      // Puppeteer يستخدم Chrome DevTools Protocol
      if (window.chrome?.runtime?.connect) {
        try {
          window.chrome.runtime.connect("", { name: "" });
          return { detected: false };
        } catch (e) {
          // Extension context invalid = Puppeteer
          if (e.message.includes("Extension context invalidated")) {
            return { detected: true, reason: "Chrome automation detected" };
          }
        }
      }
      return { detected: false };
    };

    // 🔍 فحص 3: Plugins Check
    const checkPlugins = () => {
      // المتصفحات الحقيقية لديها plugins
      // Headless browsers لا توجد لديها
      if (navigator.plugins.length === 0) {
        return { detected: true, reason: "No plugins detected" };
      }
      return { detected: false };
    };

    // 🔍 فحص 4: Languages Check
    const checkLanguages = () => {
      // Headless browsers لا ترسل languages بشكل صحيح
      if (navigator.languages.length === 0) {
        return { detected: true, reason: "No languages detected" };
      }
      return { detected: false };
    };

    // 🔍 فحص 5: User Agent vs Platform
    const checkConsistency = () => {
      const ua = navigator.userAgent.toLowerCase();
      const platform = navigator.platform.toLowerCase();

      // مثال: يدعي Windows لكن platform = Linux
      if (ua.includes("windows") && platform.includes("linux")) {
        return { detected: true, reason: "Platform mismatch" };
      }

      return { detected: false };
    };

    // 🔍 فحص 6: Permissions API
    const checkPermissions = async () => {
      try {
        // Headless browsers قد لا تدعم Permissions API بشكل صحيح
        const result = await navigator.permissions.query({
          name: "notifications",
        });
        return { detected: false };
      } catch (e) {
        return { detected: true, reason: "Permissions API failed" };
      }
    };

    // 🔍 فحص 7: Canvas Fingerprint
    const checkCanvas = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // رسم نص
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillText("Browser Test 🤖", 2, 2);

        // الحصول على البصمة
        const dataURL = canvas.toDataURL();

        // Headless browsers ترجع نفس القيمة دائماً
        // أو قد ترجع canvas فارغ
        if (dataURL === "data:,") {
          return { detected: true, reason: "Empty canvas fingerprint" };
        }

        return { detected: false };
      } catch (e) {
        return { detected: true, reason: "Canvas test failed" };
      }
    };

    // 🔍 فحص 8: Connection Type
    const checkConnection = () => {
      // @ts-ignore
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection) {
        // بعض automation tools لا تحاكي connection API
        if (!connection.effectiveType) {
          return { detected: true, reason: "Invalid connection API" };
        }
      }

      return { detected: false };
    };

    // 🔍 فحص 9: Battery API
    const checkBattery = async () => {
      try {
        // @ts-ignore
        if ("getBattery" in navigator) {
          // @ts-ignore
          const battery = await navigator.getBattery();
          // Headless لا يعطي معلومات بطارية حقيقية
          if (battery.charging === undefined) {
            return { detected: true, reason: "Invalid battery API" };
          }
        }
        return { detected: false };
      } catch (e) {
        return { detected: false }; // بعض المتصفحات لا تدعمه
      }
    };

    // 🔍 فحص 10: Timing Attack
    const checkTiming = () => {
      const start = performance.now();

      // عملية بسيطة
      for (let i = 0; i < 1000; i++) {
        const test = Math.sqrt(i);
      }

      const end = performance.now();
      const duration = end - start;

      // Automation tools قد تكون أبطأ أو أسرع بشكل غير طبيعي
      if (duration < 0.1 || duration > 100) {
        return { detected: true, reason: "Abnormal timing" };
      }

      return { detected: false };
    };

    // 🔍 فحص 11: Mouse Movement
    let mouseMoved = false;
    const mouseHandler = () => {
      mouseMoved = true;
    };

    document.addEventListener("mousemove", mouseHandler);

    setTimeout(() => {
      document.removeEventListener("mousemove", mouseHandler);
      if (!mouseMoved) {
        console.log("⚠️ No mouse movement detected");
        // يمكن اعتبار هذا مشبوه
      }
    }, 3000);

    // 🎯 تشغيل كل الفحوصات
    const runAllChecks = async () => {
      const checks = [
        checkWebDriver(),
        checkChromeDevTools(),
        checkPlugins(),
        checkLanguages(),
        checkConsistency(),
        await checkPermissions(),
        checkCanvas(),
        checkConnection(),
        await checkBattery(),
        checkTiming(),
      ];

      // حساب النتائج
      const detections = checks.filter((check) => check.detected);

      if (detections.length > 0) {
        console.log("🚫 BOT DETECTED!");
        console.log("Detections:", detections);

        setReason(detections.map((d) => d.reason).join(", "));
        setBlocked(true);

        // إرسال إلى Backend للتسجيل
        try {
          await fetch("/api/log-bot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              detections: detections,
              userAgent: navigator.userAgent,
              timestamp: Date.now(),
            }),
          });
        } catch (e) {
          console.error("Failed to log bot detection:", e);
        }

        // إعادة توجيه أو حظر
        setTimeout(() => {
          window.location.href = "/blocked";
        }, 2000);
      } else {
        console.log("✅ Legitimate browser detected");
      }
    };

    // تأخير بسيط ثم الفحص
    setTimeout(runAllChecks, 500);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", mouseHandler);
    };
  }, []);

  if (blocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="max-w-md p-8 bg-gray-900 rounded-lg border border-red-500">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Automation Detected
            </h1>
            <p className="text-gray-300 mb-4">
              تم اكتشاف استخدام أداة أتمتة (Bot/Scraper)
            </p>
            <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded">
              <strong>السبب:</strong> {reason}
            </div>
            <p className="text-gray-500 text-xs mt-4">
              إذا كنت تستخدم متصفح عادي، يرجى التواصل معنا
            </p>
          </div>
        </div>
      </div>
    );
  }

  // مكون غير مرئي في الحالة العادية
  return null;
}
