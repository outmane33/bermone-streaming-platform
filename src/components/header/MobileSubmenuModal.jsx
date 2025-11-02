// MobileSubmenuModal.jsx
import { memo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { DESIGN_TOKENS, ICON_MAP } from "@/lib/data";

export const MobileSubmenuModal = memo(
  ({ isOpen, onClose, category, items, isTouchDevice }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
      if (isOpen) {
        const scrollY = window.scrollY;
        // ✅ Lock scroll + prevent iOS rubber-band
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none"; // ✅ critical for iOS

        return () => {
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
          document.body.style.touchAction = ""; // ✅ restore
          window.scrollTo(0, scrollY);
        };
      }
    }, [isOpen]);

    if (!isOpen || !category) return null;

    const isItemActive = (itemPath) => {
      if (!pathname) return false;

      // Parse the item's path and query
      const [itemBasePath, itemQuery] = itemPath.split("?");
      const itemSort = new URLSearchParams(itemQuery).get("sort");

      // Current page must match base path AND sort param
      if (itemBasePath !== pathname) return false;

      const currentSort = searchParams.get("sort");
      return itemSort === currentSort;
    };

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md ${DESIGN_TOKENS.glass.medium} rounded-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl`}
          style={{ WebkitOverflowScrolling: "touch" }} // ✅ smoother scroll
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h3 className="text-white font-bold text-lg">{category.label}</h3>
            <button
              onClick={onClose}
              className={`p-2 ${DESIGN_TOKENS.glass.hover} rounded-full transition-colors`}
            >
              <ICON_MAP.X size={24} className="text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {items.map((item, index) => {
              const label = typeof item === "string" ? item : item.label;
              const path =
                typeof item === "string" ? `/category/${item}` : item.path;
              const isActive = isItemActive(path);

              return (
                <div key={index}>
                  <Link
                    href={path}
                    className={`relative group w-full text-right px-4 py-3.5 rounded-xl transition-all duration-300 block font-semibold ${
                      isActive
                        ? "bg-white/30 text-white shadow-lg scale-[1.02]"
                        : "text-gray-200 hover:text-white hover:bg-white/15 hover:scale-[1.02]"
                    }`}
                    onClick={(e) => {
                      if (isActive) e.preventDefault();
                      onClose();
                    }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white/10 rounded-xl blur-sm" />
                    )}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-all duration-300" />
                    )}
                    <span className="relative text-base">{label}</span>
                  </Link>

                  {index < items.length - 1 && (
                    <div className="my-2 mx-2 h-px bg-white/10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

MobileSubmenuModal.displayName = "MobileSubmenuModal";
