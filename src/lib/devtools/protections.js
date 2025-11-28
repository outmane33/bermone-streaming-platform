"use client";
import { isDevToolsOpen } from "./detector";

export function setupConsoleProtection(router) {
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    dir: console.dir,
  };

  let count = 0;

  console.log = function (...args) {
    count++;
    if (count > 3 && isDevToolsOpen()) router.push("/");
    return original.log.apply(console, args);
  };

  console.dir = function (...args) {
    if (isDevToolsOpen()) router.push("/");
    return original.dir.apply(console, args);
  };

  return () => {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
    console.dir = original.dir;
  };
}

export function setupToStringTrap(router) {
  const element = document.createElement("div");
  let detected = false;

  Object.defineProperty(element, "id", {
    get: () => {
      if (!detected) {
        detected = true;
        router.push("/");
      }
      return "trapped";
    },
  });

  const interval = setInterval(() => {
    console.log("%c", element);
    console.clear();
  }, 5000);

  return () => clearInterval(interval);
}

export function setupIntegrityCheck(router) {
  const originalPush = router.push.toString();
  const originalFetch = window.fetch.toString();

  const check = () => {
    if (router.push.toString() !== originalPush) {
      window.location.href = "/";
    }
    if (window.fetch.toString() !== originalFetch) {
      window.location.href = "/";
    }
  };

  const interval = setInterval(check, 5000);
  return () => clearInterval(interval);
}
