export const HoverGlow = ({ gradient }) => (
  <div
    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-lg blur-xl transition-opacity duration-300"
    style={{
      background:
        gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}
  />
);
