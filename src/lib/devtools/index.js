"use client";

export {
  isDevToolsOpen,
  checkDevToolsAndRedirect,
  debuggerDetection,
} from "./detector";
export {
  setupConsoleProtection,
  setupToStringTrap,
  setupIntegrityCheck,
} from "./protections";
export { setupDevToolsEventListeners } from "./eventListeners";
export {
  detectExtensions,
  setupExtensionDetection,
} from "./extensionDetection";
