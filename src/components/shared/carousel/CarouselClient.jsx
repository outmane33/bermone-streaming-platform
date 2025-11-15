"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Card from "../card/Card";
import { COMPONENT_STYLES, CONFIG } from "@/lib/data";

export default function CarouselClient({ carouselMida, className = "" }) {
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true,
  });
  const scrollContainerRef = useRef(null);

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setScrollState({
      canScrollLeft: scrollLeft > 0,
      canScrollRight:
        scrollLeft < scrollWidth - clientWidth - CONFIG.scroll.threshold,
    });
  }, []);

  const scroll = useCallback((direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * CONFIG.scroll.percentage;
    const currentScroll = container.scrollLeft;
    const newPosition =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    checkScrollability();

    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [carouselMida, checkScrollability]);

  const ScrollButton = ({ direction, disabled }) => {
    const isLeft = direction === "left";
    const buttonConfig = isLeft
      ? COMPONENT_STYLES.scrollButton.left
      : COMPONENT_STYLES.scrollButton.right;
    const Icon = buttonConfig.icon;
    const styles = COMPONENT_STYLES.scrollButton;

    return (
      <button
        onClick={() => !disabled && scroll(direction)}
        disabled={disabled}
        className={`
        ${styles.base}
        ${buttonConfig.position}
        ${buttonConfig.gradient}
        ${buttonConfig.shadow}
        ${disabled ? "opacity-30 cursor-not-allowed" : "opacity-100"}
        transition-opacity duration-200
      `}
        aria-label={isLeft ? "السابق" : "التالي"}
      >
        <Icon className="w-7 h-7 stroke-[3]" />
      </button>
    );
  };

  return (
    <div className={`relative overflow-x-hidden ${className}`}>
      <div className="relative px-2">
        <ScrollButton
          direction="left"
          isVisible={true}
          disabled={!scrollState.canScrollLeft}
        />
        <ScrollButton
          direction="right"
          isVisible={true}
          disabled={!scrollState.canScrollRight}
        />

        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-1 sm:gap-3 md:gap-4 overflow-x-hidden scrollbar-hide scroll-smooth pb-4"
        >
          {carouselMida.map((media) => (
            <div key={media.slug} className={COMPONENT_STYLES.card.width}>
              <Card media={media} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
