"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingOverlay from "./LoadingOverlay";

// Inner component that uses useSearchParams
function LoadingWatcher({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loading when URL changes (filters/sort/page)
    setIsLoading(true);

    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {children}
      <LoadingOverlay isVisible={isLoading} message="جاري تحميل المحتوى..." />
    </>
  );
}

// Outer component with Suspense boundary
export default function ClientLoadingWrapper({ children }) {
  return (
    <Suspense
      fallback={<LoadingOverlay isVisible={true} message="جاري التحميل..." />}
    >
      <LoadingWatcher>{children}</LoadingWatcher>
    </Suspense>
  );
}
