import {
  AlignStartVertical,
  CalendarFold,
  Clapperboard,
  Clock,
  Earth,
  Folders,
  Languages,
} from "lucide-react";
import DetailCard from "./DetailCardSmall";
import { GRADIENTS } from "@/lib/data";

export default function HeroDetailsGrid({ media }) {
  const details = [
    {
      icon: Folders,
      label: "التصنيف",
      value: media.category,
      gradient: GRADIENTS.purple,
    },
    {
      icon: Clapperboard,
      label: "الجودة",
      value: media.quality,
      gradient: GRADIENTS.green,
    },
    {
      icon: CalendarFold,
      label: "السنة",
      value: media.year,
      gradient: GRADIENTS.orange,
    },
    {
      icon: AlignStartVertical,
      label: "النوع",
      value: media.genre?.length > 0 ? media.genre.join(" • ") : null,
      gradient: GRADIENTS.rose,
    },
    {
      icon: Earth,
      label: "البلد",
      value: media.country,
      gradient: GRADIENTS.violet,
    },
    {
      icon: Clock,
      label: "المدة",
      value: media.duration,
      gradient: GRADIENTS.cyan,
    },
    {
      icon: Languages,
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
