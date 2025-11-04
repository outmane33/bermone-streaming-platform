import { BaseButton } from "./BaseButton";
import { filterGradients, filterIcons, filterLabels } from "@/lib/data";

export const FilterButton = ({
  category,
  isActive,
  isOpen,
  count,
  onClick,
  isMobile,
}) => (
  <BaseButton
    icon={filterIcons[category]}
    label={filterLabels[category]}
    gradient={filterGradients[category]}
    isActive={isActive}
    isOpen={isOpen}
    count={count}
    onClick={onClick}
    isMobile={isMobile}
    showChevron
  />
);
