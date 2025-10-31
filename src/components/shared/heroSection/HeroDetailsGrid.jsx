// src/components/shared/heroSection/HeroDetailsGrid.jsx
import DetailCard from "./DetailCardSmall";
import { GRADIENTS, ICON_MAP } from "@/lib/data";

export default function HeroDetailsGrid({ media }) {
  const details = [
    {
      icon: ICON_MAP.Folders,
      label: "التصنيف",
      value: media.category,
      gradient: GRADIENTS.purple,
    },
    {
      icon: ICON_MAP.Clapperboard,
      label: "الجودة",
      value: media.quality,
      gradient: GRADIENTS.green,
    },
    {
      icon: ICON_MAP.CalendarFold,
      label: "السنة",
      value: media.year,
      gradient: GRADIENTS.orange,
    },
    {
      icon: ICON_MAP.AlignStartVertical,
      label: "النوع",
      value: media.genre?.length > 0 ? media.genre.join(" • ") : null,
      gradient: GRADIENTS.rose,
    },
    {
      icon: ICON_MAP.Earth,
      label: "البلد",
      value: media.country,
      gradient: GRADIENTS.violet,
    },
    {
      icon: ICON_MAP.Clock,
      label: "المدة",
      value: media.duration,
      gradient: GRADIENTS.cyan,
    },
    {
      icon: ICON_MAP.Languages,
      label: "اللغة",
      value: media.language,
      gradient: GRADIENTS.cyan,
    },
  ].filter((detail) => detail.value);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" dir="rtl">
      {details.map((detail, idx) => (
        <DetailCard key={idx} {...detail} />
      ))}
    </div>
  );
}
