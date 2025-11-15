export const BlurBg = ({ position = "top", size = "96" }) => {
  const posClass = position === "top" ? "top-0 left-0" : "bottom-0 right-0";
  const gradient =
    position === "top"
      ? "from-cyan-500/10 to-purple-500/10"
      : "from-pink-500/10 to-purple-500/10";

  return (
    <div
      className={`absolute ${posClass} w-${size} h-${size} bg-gradient-to-br ${gradient} rounded-full blur-3xl`}
    />
  );
};
