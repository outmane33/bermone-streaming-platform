// src/components/shared/heroSection/GlassCard.jsx
export default function GlassCard({ children, className = "", hover = true }) {
  return (
    <div
      className={`
        relative 
        rounded-lg 
        p-2.5 
        transition-all 
        duration-300 
        overflow-hidden

        /* Glass effect only on medium+ screens */
        md:bg-white/10 md:backdrop-blur-md
        /* Simpler on mobile */
        bg-white/5

        ${
          hover
            ? "group md:hover:from-white/15 md:hover:to-white/10 md:hover:border-white/30 md:hover:scale-105"
            : ""
        } 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
