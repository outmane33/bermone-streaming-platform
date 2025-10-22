import { GLASS_STYLES } from "@/lib/data";

export default function GlassCard({ children, className = "", hover = true }) {
  return (
    <div
      className={`
        relative 
        ${GLASS_STYLES.medium} 
        rounded-lg 
        p-2.5 
        transition-all 
        duration-300 
        ${
          hover
            ? "group hover:from-white/15 hover:to-white/10 hover:border-white/30 hover:scale-105"
            : ""
        } 
        overflow-hidden 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
