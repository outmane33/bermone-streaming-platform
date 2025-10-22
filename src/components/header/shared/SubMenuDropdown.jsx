import Link from "next/link";

export const SubMenuDropdown = ({
  items,
  gradient,
  handleSubMenuClick,
  position = "desktop",
}) => {
  const isDesktop = position === "desktop";

  return (
    <div
      className={`absolute top-full ${
        isDesktop ? "mt-6 right-0 w-56" : "mt-2 left-0 right-0"
      } z-50`}
    >
      {isDesktop && (
        <div className="absolute -inset-1 bg-gradient-to-r bg-white/20 shadow-lg backdrop-blur-md rounded-xl blur-md opacity-50" />
      )}
      <div className="relative bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        <div className={`p-2 ${!isDesktop && "max-h-60 overflow-y-auto"}`}>
          {items.map((item, index) => {
            // Handle both object format and string format for backward compatibility
            const label = typeof item === "string" ? item : item.label;
            const path =
              typeof item === "string" ? `/category/${item}` : item.path;

            return (
              <Link
                key={index}
                href={path}
                className={`relative group w-full text-right ${
                  isDesktop ? "px-4 py-3" : "px-3 py-2.5"
                } rounded-lg text-gray-100 hover:text-white transition-all duration-200 ${
                  isDesktop ? "font-medium" : "text-sm font-medium"
                } hover:bg-white/20 ${
                  isDesktop && "hover:shadow-lg"
                } cursor-pointer block`}
                onClick={handleSubMenuClick}
              >
                {isDesktop && (
                  <div className="relative flex items-center justify-between">
                    <div className="w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    <span>{label}</span>
                  </div>
                )}
                {!isDesktop && <span>{label}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
