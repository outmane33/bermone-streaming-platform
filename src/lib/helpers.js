import { useEffect } from "react";

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const useClickOutside = (isOpen, ref, callback) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, ref, callback]);
};
