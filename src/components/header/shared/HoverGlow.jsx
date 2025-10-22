export const HoverGlow = ({ gradient }) => (
  <div
    className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
  />
);
