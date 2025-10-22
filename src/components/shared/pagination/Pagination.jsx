"use client";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { COMPONENT_STYLES } from "@/lib/data";

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

const PageButton = ({ pageNum, isActive, onClick, isMobile }) => (
  <button
    onClick={() => onClick(pageNum)}
    className={`group relative ${
      isMobile ? "min-w-[36px] sm:min-w-[44px]" : "min-w-[40px] sm:min-w-[48px]"
    } transition-all duration-300 cursor-pointer ${
      isActive
        ? isMobile
          ? "scale-105 sm:scale-110"
          : "scale-110"
        : `${
            isMobile ? "hover:scale-105 sm:hover:scale-110" : "hover:scale-110"
          } hover:-translate-y-0.5 opacity-70 hover:opacity-100`
    }`}
  >
    <div
      className={`relative ${
        isActive
          ? "bg-transparent border-2 border-cyan-300"
          : "bg-white/10 backdrop-blur-md border border-white/20"
      } rounded-lg sm:rounded-xl ${
        isMobile ? "px-2 sm:px-3 py-2" : "px-3 sm:px-4 py-2 sm:py-3"
      }`}
    >
      <span
        className={`relative z-10 font-bold transition-colors duration-300 ${
          isMobile ? "text-xs sm:text-sm" : "text-sm sm:text-base"
        } ${isActive ? "text-white" : "text-gray-200 group-hover:text-white"}`}
      >
        {pageNum}
      </span>
    </div>
  </button>
);

export default function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}) {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };

  const getPageNumbers = (isMobile) => {
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

  const renderPages = (isMobile) => {
    return getPageNumbers(isMobile).map((pageNum, idx) => {
      if (pageNum === "...") {
        return (
          <span
            key={`ellipsis-${idx}`}
            className={`${
              isMobile ? "px-1 sm:px-2" : "px-2 sm:px-3"
            } py-2 text-white/60 font-bold ${
              isMobile ? "text-xs sm:text-sm" : "text-sm sm:text-base"
            }`}
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
          isMobile={isMobile}
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
          icon={ChevronsLeft}
          className="hidden sm:block"
        />

        <NavButton
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          icon={ChevronLeft}
        />

        <div className="hidden md:flex items-center gap-2">
          {renderPages(false)}
        </div>

        <div className="flex md:hidden items-center gap-1 sm:gap-2">
          {renderPages(true)}
        </div>

        <NavButton
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          icon={ChevronRight}
        />

        <NavButton
          onClick={() => handlePageChange(totalPages)}
          disabled={page === totalPages}
          icon={ChevronsRight}
          className="hidden sm:block"
        />
      </div>
    </div>
  );
}
