import { useState, useEffect } from "react";

export default function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Run only on client
    const check = () =>
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(check());
  }, []);

  return isTouchDevice;
}
