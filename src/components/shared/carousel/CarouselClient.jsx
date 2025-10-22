// app/components/carousel/CarouselClient.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Card from "../card/Card";
import { COMPONENT_STYLES, CONFIG } from "@/lib/data";

export default function CarouselClient({
  carouselMida,
  title,
  showTitle = true,
  className = "",
}) {
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

  const ScrollButton = ({ direction, isVisible }) => {
    if (!isVisible) return null;

    const isLeft = direction === "left";
    const buttonConfig = isLeft
      ? COMPONENT_STYLES.scrollButton.left
      : COMPONENT_STYLES.scrollButton.right;

    const Icon = buttonConfig.icon;
    const styles = COMPONENT_STYLES.scrollButton;

    return (
      <button
        onClick={() => scroll(direction)}
        className={`
          ${styles.base}
          ${buttonConfig.position}
          ${buttonConfig.gradient}
          ${buttonConfig.shadow}
        `}
        aria-label={isLeft ? "السابق" : "التالي"}
      >
        <Icon className="w-7 h-7 stroke-[3]" />
      </button>
    );
  };

  return (
    <div className={`relative overflow-x-hidden ${className}`}>
      <div className="relative group px-2">
        <ScrollButton direction="left" isVisible={scrollState.canScrollLeft} />
        <ScrollButton
          direction="right"
          isVisible={scrollState.canScrollRight}
        />

        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-1 sm:gap-3 md:gap-4 overflow-x-hidden scrollbar-hide scroll-smooth pb-4"
        >
          {carouselMida.map((media) => (
            <div key={media.id} className={COMPONENT_STYLES.card.width}>
              <Card media={media} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
