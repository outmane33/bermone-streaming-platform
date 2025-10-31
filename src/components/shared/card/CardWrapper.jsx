// src/components/shared/card/CardWrapper.jsx
"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import LoadingOverlay from "../skeletons/LoadingOverlay";

export default function CardWrapper({ href, children, onNavigate }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e) => {
    e.preventDefault();

    // Save return URL
    const params = searchParams.toString();
    if (params) {
      const currentUrl = `${pathname}?${params}`;
      document.cookie = `categoryReturnUrl=${encodeURIComponent(
        currentUrl
      )}; path=/; max-age=600`;
    }

    if (onNavigate) onNavigate(); // 👈 Close parent (e.g., SearchResults)

    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
    });
  };

  useEffect(() => {
    let timeoutId;
    if (isNavigating) {
      timeoutId = setTimeout(() => setIsNavigating(false), 500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      setIsNavigating(false);
    };
  }, [isNavigating]);

  return (
    <>
      <Link href={href} onClick={handleClick}>
        {children}
      </Link>
      <LoadingOverlay isVisible={isNavigating} />
    </>
  );
}
