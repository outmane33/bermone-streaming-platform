import { COMPONENT_STYLES, DESIGN_TOKENS } from "@/lib/data";

export const GradientButton = ({
  icon: Icon,
  label,
  gradient,
  disabled = false,
  isMobile = false,
  className = "",
  variant = "default",
  isActive = false,
}) => {
  const buttonStyles = COMPONENT_STYLES.button;

  const getGradientClass = () => {
    if (gradient) return gradient;
    const gradientMap = {
      primary: DESIGN_TOKENS.gradients.cyan,
      secondary: DESIGN_TOKENS.gradients.purple,
      success: DESIGN_TOKENS.gradients.green,
      danger: DESIGN_TOKENS.gradients.rose,
      warning: DESIGN_TOKENS.gradients.orange,
    };
    return gradientMap[variant] || DESIGN_TOKENS.gradients.cyan;
  };

  const gradientClass = getGradientClass();

  return (
    <button
      disabled={disabled}
      className={`
        ${buttonStyles.base}
        border ${
          isActive ? "border-white/60" : "border-white/20 hover:border-white/40"
        }
        ${isMobile ? "flex-1" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${isActive ? "scale-105" : ""}
        ${className}
      `}
    >
      {/* Gradient Background - Always visible when active */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientClass} ${
          isActive ? "opacity-30" : "opacity-0 group-hover:opacity-20"
        } transition-all duration-300`}
      />

      {/* Active Glow Effect */}
      {isActive && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${gradientClass} blur-xl opacity-40 -z-10`}
        />
      )}

      {/* Content */}
      <div
        className={`relative flex items-center ${
          isMobile ? "justify-center" : ""
        } gap-1.5 lg:gap-2 ${
          isActive ? "text-white" : "text-gray-200 group-hover:text-white"
        } transition-colors duration-300`}
      >
        {Icon && <Icon size={16} className="lg:w-[18px] lg:h-[18px]" />}
        <span className="text-sm lg:text-base font-semibold">{label}</span>
      </div>
    </button>
  );
};
