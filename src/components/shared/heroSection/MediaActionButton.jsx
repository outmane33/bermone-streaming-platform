"use client";
import { useRouter } from "next/navigation";

export default function MediaActionButton({ action, className, children }) {
  const router = useRouter();

  async function handleClick() {
    const url = await action();
    if (!url) return console.error("URL not found");
    router.push(url);
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
