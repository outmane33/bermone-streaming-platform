// components/shared/ClientLoadingWrapper.jsx
"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingOverlay from "./LoadingOverlay";

export default function ClientLoadingWrapper({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {children}
      <LoadingOverlay isVisible={isLoading} message="جاري تحميل المحتوى..." />
    </>
  );
}
