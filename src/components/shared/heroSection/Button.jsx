import { COMPONENT_STYLES } from "@/lib/data";

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
      {/* Hover Effect Overlay for Primary Variant */}
      {variant === "primary" && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      )}

      {/* Button Content */}
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
