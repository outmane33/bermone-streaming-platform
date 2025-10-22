"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Clock } from "lucide-react";
import { GradientButton } from "./shared/GradientButton";

export const ActionButtons = ({ isMobile = false }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always return false during SSR/first render
  const isTrendingActive = mounted && pathname === "/category/trending";
  const isRecentActive = mounted && pathname === "/category/recent";

  return (
    <div
      className={`flex items-center gap-2 ${
        isMobile ? "mt-3 pt-3 border-t border-white/10" : "lg:gap-3"
      }`}
      suppressHydrationWarning
    >
      <Link href="/category/trending">
        <GradientButton
          icon={Sparkles}
          label="تريند"
          variant="warning"
          isMobile={isMobile}
          isActive={isTrendingActive}
        />
      </Link>
      <Link href="/category/recent">
        <GradientButton
          icon={Clock}
          label="مضاف حديثا"
          variant="primary"
          isMobile={isMobile}
          isActive={isRecentActive}
        />
      </Link>
    </div>
  );
};
