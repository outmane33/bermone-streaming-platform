// components/Pagination.jsx
"use client";
import { useState, useEffect } from "react";
import { COMPONENT_STYLES, ICON_MAP } from "@/lib/data";
import useIsTouchDevice from "@/hooks/useIsTouchDevice"; // 👈

const NavButton = ({ onClick, disabled, icon: Icon, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`${COMPONENT_STYLES.iconButton.base} ${
      disabled
        ? COMPONENT_STYLES.iconButton.disabled
        : COMPONENT_STYLES.iconButton.enabled
    } ${className}`}
  >
    <div className={COMPONENT_STYLES.iconButton.inner}>
      <Icon className={COMPONENT_STYLES.iconButton.iconSize} />
    </div>
  </button>
);

const PageButton = ({ pageNum, isActive, onClick, isTouchDevice }) => {
  // Simplified styles for touch devices
  const baseClasses = "relative transition-all duration-300 cursor-pointer";

  const activeClasses = isActive
    ? "scale-110"
    : isTouchDevice
    ? "opacity-80" // no hover, just slight dim
    : "hover:scale-110 hover:-translate-y-0.5 opacity-70 hover:opacity-100";

  // Background: no blur on mobile
  const bgClasses = isActive
    ? "bg-transparent border-2 border-cyan-300"
    : isTouchDevice
    ? "bg-white/10 border border-white/20" // no backdrop-blur
    : "bg-white/10 backdrop-blur-md border border-white/20";

  return (
    <button
      onClick={() => onClick(pageNum)}
      className={`${baseClasses} ${activeClasses} min-w-[40px] sm:min-w-[48px]`}
    >
      <div
        className={`relative ${bgClasses} rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3`}
      >
        <span
          className={`relative z-10 font-bold transition-colors duration-300 text-sm sm:text-base ${
            isActive ? "text-white" : "text-gray-200"
          }`}
        >
          {pageNum}
        </span>
      </div>
    </button>
  );
};

export default function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}) {
  const isTouchDevice = useIsTouchDevice();
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const getPageNumbers = () => {
    const isMobile = isTouchDevice;
    const pages = [];

    if (isMobile) {
      if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (page === 1) {
        pages.push(1, 2, "...", totalPages);
      } else if (page === totalPages) {
        pages.push(1, "...", totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page, "...", totalPages);
      }
    } else {
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, "...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const renderPages = () => {
    return getPageNumbers().map((pageNum, idx) => {
      if (pageNum === "...") {
        return (
          <span
            key={`ellipsis-${idx}`}
            className="px-2 sm:px-3 py-2 text-white/60 font-bold text-sm sm:text-base"
          >
            ...
          </span>
        );
      }
      return (
        <PageButton
          key={pageNum}
          pageNum={pageNum}
          isActive={pageNum === page}
          onClick={handlePageChange}
          isTouchDevice={isTouchDevice}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 sm:py-8 px-2 sm:px-4">
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center w-full max-w-full">
        <NavButton
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          icon={ICON_MAP.ChevronsLeft}
          className="hidden sm:block"
        />

        <NavButton
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          icon={ICON_MAP.ChevronLeft}
        />

        {/* Unified rendering — no separate mobile/desktop logic needed */}
        <div className="flex items-center gap-1 sm:gap-2">{renderPages()}</div>

        <NavButton
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          icon={ICON_MAP.ChevronRight}
        />

        <NavButton
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          icon={ICON_MAP.ChevronsRight}
          className="hidden sm:block"
        />
      </div>
    </div>
  );
}
