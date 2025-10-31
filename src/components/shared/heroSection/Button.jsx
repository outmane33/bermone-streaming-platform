// src/components/shared/heroSection/Button.jsx
import { COMPONENT_STYLES, DESIGN_TOKENS } from "@/lib/data";

export default function Button({
  children,
  variant = "primary",
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
}) {
  const buttonStyles = COMPONENT_STYLES.button;
  const variantClass =
    buttonStyles.variants[variant] || buttonStyles.variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group
        ${buttonStyles.base}
        ${variantClass}
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

      <div className="relative flex items-center gap-3 justify-center">
        {Icon && (
          <Icon
            size={24}
            className={variant === "primary" ? "fill-white" : ""}
          />
        )}
        <span>{children}</span>
      </div>
    </button>
  );
}
