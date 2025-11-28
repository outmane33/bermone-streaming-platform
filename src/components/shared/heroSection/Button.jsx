import { COMPONENT_STYLES, DESIGN_TOKENS } from "@/lib/data";

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
}) {
  const buttonStyles = COMPONENT_STYLES.button;
  const variantClass =
    buttonStyles.variants[variant] || buttonStyles.variants.primary;

  // Size variants
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-3 lg:px-6 py-2 lg:py-2.5 text-base",
    large: "px-6 lg:px-8 py-3 lg:py-3.5 text-lg",
  };

  const iconSizes = {
    small: 18,
    medium: 24,
    large: 28,
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  const iconSize = iconSizes[size] || iconSizes.medium;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group
        relative
        font-semibold
        overflow-hidden
        rounded-lg
        transition-all
        duration-300
        hover:scale-105
        cursor-pointer
        ${variantClass}
        ${sizeClass}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* Hover overlay only on desktop (md+) */}
      {variant === "primary" && !disabled && (
        <div
          className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan}
            opacity-0 md:group-hover:opacity-100
            ${DESIGN_TOKENS.effects.transition}
          `}
        />
      )}

      <div className="relative flex items-center gap-2 lg:gap-3 justify-center">
        {Icon && (
          <Icon
            size={iconSize}
            className={variant === "primary" ? "fill-white" : ""}
          />
        )}
        <span>{children}</span>
      </div>
    </button>
  );
}
