export default function throttle(func, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) return;
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}
