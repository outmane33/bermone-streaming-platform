// Create this as: components/ClientRedirect.jsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ClientRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run once on mount
    const returnUrl = sessionStorage.getItem("returnUrl");

    if (!returnUrl) return;

    // Check if return URL matches current pathname
    if (returnUrl.startsWith(pathname)) {
      const returnUrlObj = new URL(returnUrl, window.location.origin);
      const savedParams = returnUrlObj.searchParams.toString();
      const currentParams = searchParams.toString();

      // If saved URL has params but current doesn't, redirect immediately
      if (savedParams && !currentParams) {
        sessionStorage.removeItem("returnUrl");
        // Use window.location for immediate redirect before React renders
        window.location.href = returnUrl;
      } else if (currentParams) {
        // We're already on the right page, clear the stored URL
        sessionStorage.removeItem("returnUrl");
      }
    }
  }, []); // Empty deps - only run once

  return null; // This component doesn't render anything
}
