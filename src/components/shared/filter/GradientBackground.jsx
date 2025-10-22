const cn = (...classes) => classes.filter(Boolean).join(" ");
export const GradientBackground = ({ gradient, isActive, isHover }) => (
  <>
    {isActive && (
      <>
        <div
          className={cn(
            "absolute -inset-1 rounded-lg blur-md opacity-75",
            `bg-gradient-to-r ${gradient}`
          )}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-lg opacity-90",
            `bg-gradient-to-r ${gradient}`
          )}
        />
      </>
    )}
    {isHover && !isActive && (
      <div
        className={cn(
          "absolute inset-0 rounded-lg opacity-60",
          `bg-gradient-to-r ${gradient}`
        )}
      />
    )}
    <div
      className={cn(
        "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300",
        `bg-gradient-to-r ${gradient}`
      )}
    />
  </>
);
