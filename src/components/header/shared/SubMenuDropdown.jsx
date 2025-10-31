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

    // First check: base paths must match
    if (itemBasePath !== currentBasePath) {
      return false;
    }

    // If item has query params, check if they match current URL params
    if (itemQuery) {
      const itemParams = new URLSearchParams(itemQuery);

      // Check if all item params exist and match in current URL
      for (const [key, value] of itemParams) {
        if (searchParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    }

    // If item has NO query params, it matches the base path regardless of URL params
    // This allows /films to be active for both /films and /films?genre=action
    return true;
  };

  return (
    <div
      className={`absolute top-full ${
        isDesktop ? "mt-6 right-0 w-56" : "mt-4 right-0 w-44"
      } z-50`}
    >
      <div
        className={`relative ${DESIGN_TOKENS.glass.light} rounded-xl shadow-2xl overflow-hidden`}
      >
        <div className={`p-2 ${!isDesktop && "max-h-70 overflow-y-auto"}`}>
          {items.map((item, index) => {
            // Handle both object format and string format for backward compatibility
            const label = typeof item === "string" ? item : item.label;
            const path =
              typeof item === "string" ? `/category/${item}` : item.path;
            const isActive = isItemActive(path);

            return (
              <div key={index}>
                <Link
                  href={path}
                  className={`relative group w-full text-right font-semibold ${
                    isDesktop ? "px-4 py-3" : "px-3 py-2.5"
                  } rounded-lg transition-all duration-300 ${
                    isDesktop ? "font-medium" : "text-sm font-medium"
                  } block ${
                    isActive
                      ? "bg-white/30 text-white shadow-lg scale-[1.02]"
                      : `text-gray-200 hover:text-white hover:bg-white/15 hover:scale-[1.02]`
                  }`}
                  onClick={(e) => {
                    if (isActive) {
                      e.preventDefault();
                      handleSubMenuClick();
                    } else {
                      handleSubMenuClick();
                    }
                  }}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-sm" />
                  )}

                  {/* Hover glow effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-lg transition-all duration-300" />
                  )}

                  {isDesktop && (
                    <div className="relative flex items-center justify-between">
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
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

                {/* Separator line - don't show after last item */}
                {index < items.length - 1 && (
                  <div className="my-1 mx-2 h-px bg-white/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
