import GlassCard from "./GlassCard";
import { DESIGN_TOKENS } from "@/lib/data";

export default function DetailCard({ icon, label, value, gradient }) {
  const Icon = icon;

  return (
    <GlassCard className="group relative bg-gradient-to-br from-white/10 to-white/5">
      <div
        className={`
          absolute inset-0 rounded-lg
          bg-gradient-to-br ${gradient}
          opacity-0 md:group-hover:opacity-15
          ${DESIGN_TOKENS.effects.transition}
        `}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={`
            p-1.5 rounded-md bg-gradient-to-br ${gradient} shadow-md
            md:group-hover:shadow-lg
            ${DESIGN_TOKENS.effects.transition} flex-shrink-0
          `}
        >
          <Icon size={16} className="text-white" />
        </div>

        <div className="flex-1 text-right min-w-0">
          <p className="text-xs text-gray-100 font-semibold leading-tight">
            {label}
          </p>
          <p className="text-sm font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}
