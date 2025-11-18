"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import LoadingOverlay from "../skeletons/LoadingOverlay";

const MIN_LOADING_TIME = 600;

export default function CardWrapper({ href, children, onNavigateComplete }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e) => {
    e.preventDefault();

    const params = searchParams.toString();
    if (params) {
      const currentUrl = `${pathname}?${params}`;
      document.cookie = `categoryReturnUrl=${encodeURIComponent(
        currentUrl
      )}; path=/; max-age=600`;
    }

    const startTime = Date.now();
    setIsNavigating(true);

    startTransition(() => {
      router.push(href);
    });

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

    setTimeout(() => {
      setIsNavigating(false);
      if (onNavigateComplete) onNavigateComplete();
    }, remainingTime);
  };

  useEffect(() => {
    return () => setIsNavigating(false);
  }, []);

  return (
    <>
      <Link href={href} onClick={handleClick}>
        {children}
      </Link>
      <LoadingOverlay isVisible={isNavigating} />
    </>
  );
}
