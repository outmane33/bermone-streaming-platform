// src/components/shared/heroSection/HeroBadges.jsx
import { COMPONENT_STYLES } from "@/lib/data";

function Badge({ children, variant = "default", className = "" }) {
  const badgeStyles = COMPONENT_STYLES.badge;
  const variantClass =
    badgeStyles.variants[variant] || badgeStyles.variants.default;

  return (
    <span
      className={`
        ${badgeStyles.base}
        ${variantClass}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function HeroBadges({ isNew, year, className = "" }) {
  return (
    <div className={`flex items-center gap-3 mb-2 ${className}`}>
      {isNew && <Badge variant="new">NEW</Badge>}
    </div>
  );
}
