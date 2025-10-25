"use client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CardWrapper({ href, children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = searchParams.toString();
    if (params) {
      const currentUrl = `${pathname}?${params}`;
      document.cookie = `categoryReturnUrl=${encodeURIComponent(
        currentUrl
      )}; path=/; max-age=600`;
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}
