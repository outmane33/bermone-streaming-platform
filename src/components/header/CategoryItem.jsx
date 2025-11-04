import React from "react";
import { ActiveGlow } from "./shared/ActiveGlow";
import { HoverGlow } from "./shared/HoverGlow";
import { SubMenuDropdown } from "./shared/SubMenuDropdown";
import { getIconClasses, getTextClasses, ICON_MAP } from "@/lib/data";
import Link from "next/link";

export const CategoryItem = React.memo(
  ({
    category,
    isActive,
    isMenuOpen,
    onClick,
    handleSubMenuClick,
    isDesktop = true,
    isHome = false,
  }) => {
    const Icon = category.icon;
    const hasSubMenu = category.subMenu && category.subMenu.length > 0;
    const hasHref = category.href && category.href.trim() !== "";

    const buttonClasses = `group relative flex items-center ${
      isDesktop ? "gap-2 px-5 py-3" : "justify-center gap-3 w-full px-4 py-4"
    } rounded-lg transition-all duration-300 cursor-pointer ${
      isActive
        ? isDesktop
          ? "scale-110"
          : ""
        : `${
            isDesktop ? "hover:scale-105 hover:-translate-y-0.5" : ""
          } opacity-70 hover:opacity-100`
    }`;

    const buttonContent = (
      <>
        {isActive && <ActiveGlow gradient={category.gradient} />}
        <HoverGlow gradient={category.gradient} />
        <div
          className={`relative flex ${
            isDesktop ? "items-center gap-2" : "flex-row items-center gap-2"
          }`}
        >
          <Icon
            size={20}
            className={`${getIconClasses(isActive)} ${
              !isDesktop && "flex-shrink-0"
            }`}
          />
          <span
            className={`${
              isDesktop ? "" : "text-sm"
            } font-semibold ${getTextClasses(isActive)}`}
          >
            {category.label}
          </span>
          {hasSubMenu && (
            <ICON_MAP.ChevronDown
              size={16}
              className={`${
                !isDesktop && "ml-auto flex-shrink-0"
              } transition-all duration-300 ${getIconClasses(isActive)} ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </>
    );

    return (
      <div className="relative">
        {hasHref && isHome ? (
          <Link href={category.href} className="block">
            <button onClick={onClick} className={buttonClasses}>
              {buttonContent}
            </button>
          </Link>
        ) : (
          <button onClick={onClick} className={buttonClasses}>
            {buttonContent}
          </button>
        )}
        {hasSubMenu && isMenuOpen && (
          <SubMenuDropdown
            items={category.subMenu}
            gradient={category.gradient}
            handleSubMenuClick={handleSubMenuClick}
            position={isDesktop ? "desktop" : "mobile"}
          />
        )}
      </div>
    );
  }
);
