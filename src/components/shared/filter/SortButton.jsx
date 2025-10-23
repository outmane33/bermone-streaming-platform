// SortButton.jsx (simplified)
import { BaseButton } from "./BaseButton";
import { getIcon } from "@/lib/data";

export const SortButton = ({ option, isSelected, onClick, isMobile }) => (
  <BaseButton
    icon={getIcon(option.icon)}
    label={option.label}
    gradient={option.gradient}
    isActive={isSelected}
    onClick={onClick}
    isMobile={isMobile}
  />
);
