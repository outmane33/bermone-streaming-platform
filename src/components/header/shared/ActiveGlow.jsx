export const ActiveGlow = ({ gradient }) => (
  <>
    <div
      className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-lg blur-md opacity-75`}
    />
    <div
      className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-lg opacity-90`}
    />
  </>
);
