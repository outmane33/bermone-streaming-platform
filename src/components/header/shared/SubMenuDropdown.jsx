import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESIGN_TOKENS } from "@/lib/data";

export const SubMenuDropdown = ({
  items,
  gradient,
  handleSubMenuClick,
  position = "desktop",
}) => {
  const pathname = usePathname();
  const isDesktop = position === "desktop";

  // Function to check if submenu item is active
  const isItemActive = (itemPath) => {
    if (!pathname) return false;

    // Get search params from the current URL
    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    // Parse the item path
    const [itemBasePath, itemQuery] = itemPath.split("?");
    const currentBasePath = pathname;

    // If item has query params, check base path and query params match
    if (itemQuery) {
      const itemParams = new URLSearchParams(itemQuery);

      // Check if base paths match
      if (itemBasePath !== currentBasePath) {
        return false;
      }

      // Check if all item params match current URL params
      for (const [key, value] of itemParams) {
        if (searchParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    }

    // If no query params on item, match base path only when there are no query params in URL
    if (
      !itemQuery &&
      itemBasePath === currentBasePath &&
      !searchParams.toString()
    ) {
      return true;
    }

    return false;
  };

  return (
    <div
      className={`absolute top-full ${
        isDesktop ? "mt-6 right-0 w-56" : "mt-4 right-[-28px] w-44"
      } z-50`}
    >
      {isDesktop && (
        <div className="absolute -inset-1 bg-gradient-to-r bg-white/20 shadow-lg backdrop-blur-md rounded-xl blur-md opacity-50" />
      )}
      <div
        className={`relative ${DESIGN_TOKENS.glass.light} rounded-xl shadow-2xl overflow-hidden`}
      >
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        <div className={`p-2 ${!isDesktop && "max-h-70 overflow-y-auto"}`}>
          {items.map((item, index) => {
            // Handle both object format and string format for backward compatibility
            const label = typeof item === "string" ? item : item.label;
            const path =
              typeof item === "string" ? `/category/${item}` : item.path;
            const isActive = isItemActive(path);

            return (
              <Link
                key={index}
                href={path}
                className={`relative group w-full text-right font-semibold ${
                  isDesktop ? "px-4 py-3" : "px-3 py-2.5"
                } rounded-lg ${DESIGN_TOKENS.effects.transition} ${
                  isDesktop ? "font-medium" : "text-sm font-medium"
                } block ${
                  isActive
                    ? "bg-white/30 text-white shadow-lg font-bold cursor-default"
                    : `text-gray-100 hover:text-white ${DESIGN_TOKENS.glass.hover} cursor-pointer`
                } ${isDesktop && !isActive && "hover:shadow-lg"}`}
                onClick={(e) => {
                  if (isActive) {
                    e.preventDefault();
                    handleSubMenuClick();
                  } else {
                    handleSubMenuClick();
                  }
                }}
              >
                {/* Active indicator gradient background */}
                {isActive && (
                  <>
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-20 rounded-lg`}
                    />
                    <div
                      className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} opacity-30 rounded-lg blur-sm`}
                    />
                  </>
                )}

                {isDesktop && (
                  <div className="relative flex items-center justify-between">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        DESIGN_TOKENS.effects.transition
                      } ${
                        isActive
                          ? "bg-white opacity-100 scale-110"
                          : "bg-white opacity-0 group-hover:opacity-100"
                      }`}
                    />
                    <span className="relative">{label}</span>
                  </div>
                )}
                {!isDesktop && <span className="relative">{label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
