"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import LoadingOverlay from "../skeletons/LoadingOverlay";

export default function CardWrapper({ href, children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e) => {
    e.preventDefault();

    // Save current URL to cookie
    const params = searchParams.toString();
    if (params) {
      const currentUrl = `${pathname}?${params}`;
      document.cookie = `categoryReturnUrl=${encodeURIComponent(
        currentUrl
      )}; path=/; max-age=600`;
    }

    // Show loading state
    setIsNavigating(true);

    // Navigate with transition
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      <Link href={href} onClick={handleClick}>
        {children}
      </Link>

      <LoadingOverlay isVisible={isNavigating} />
    </>
  );
}
