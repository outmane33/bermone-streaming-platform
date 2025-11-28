"use client";
import { isDevToolsOpen, debuggerDetection } from "./detector";
import {
  setupConsoleProtection,
  setupToStringTrap,
  setupIntegrityCheck,
} from "./protections";
import { setupExtensionDetection } from "./extensionDetection";

export function setupDevToolsEventListeners(router, onDetected) {
  const handlers = [];

  // Resize Detection
  const handleResize = () => {
    if (isDevToolsOpen()) {
      onDetected?.();
      console.clear();
      router.push("/");
    }
  };
  window.addEventListener("resize", handleResize);
  handlers.push(() => window.removeEventListener("resize", handleResize));

  // Visibility Change
  const handleVisibility = () => {
    if (!document.hidden && isDevToolsOpen()) {
      onDetected?.();
      router.push("/");
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);
  handlers.push(() =>
    document.removeEventListener("visibilitychange", handleVisibility)
  );

  // Focus Check
  const handleFocus = () => {
    if (debuggerDetection()) {
      onDetected?.();
      router.push("/");
    }
  };
  window.addEventListener("focus", handleFocus);
  handlers.push(() => window.removeEventListener("focus", handleFocus));

  // Keyboard Shortcuts
  const handleKeyDown = (e) => {
    if (
      e.keyCode === 123 || // F12
      ((e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        [73, 74, 67].includes(e.keyCode)) || // Ctrl+Shift+I/J/C
      ((e.ctrlKey || e.metaKey) && [85, 83].includes(e.keyCode))
    ) {
      // Ctrl+U/S
      e.preventDefault();
      if ([123, 73, 74, 67].includes(e.keyCode)) {
        onDetected?.();
        router.push("/");
      }
      return false;
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  handlers.push(() => document.removeEventListener("keydown", handleKeyDown));

  // Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isDevToolsOpen()) {
      onDetected?.();
      router.push("/");
    }
    return false;
  };
  document.addEventListener("contextmenu", handleContextMenu);
  handlers.push(() =>
    document.removeEventListener("contextmenu", handleContextMenu)
  );

  // Mouse Movement (Throttled)
  let lastCheck = 0;
  const handleMouseMove = () => {
    const now = Date.now();
    if (now - lastCheck > 3000) {
      lastCheck = now;
      if (isDevToolsOpen()) {
        onDetected?.();
        router.push("/");
      }
    }
  };
  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  handlers.push(() =>
    document.removeEventListener("mousemove", handleMouseMove)
  );

  // Selection & Copy Prevention
  const preventSelection = (e) => {
    if (isDevToolsOpen()) {
      e.preventDefault();
      return false;
    }
  };
  const preventCopy = (e) => {
    if (isDevToolsOpen()) {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    }
  };
  document.addEventListener("selectstart", preventSelection);
  document.addEventListener("copy", preventCopy);
  handlers.push(() => {
    document.removeEventListener("selectstart", preventSelection);
    document.removeEventListener("copy", preventCopy);
  });

  // Advanced Protections
  handlers.push(setupConsoleProtection(router));
  handlers.push(setupToStringTrap(router));
  handlers.push(setupIntegrityCheck(router));

  // Extension Detection
  handlers.push(setupExtensionDetection(router, onDetected));

  return () => handlers.forEach((cleanup) => cleanup());
}
