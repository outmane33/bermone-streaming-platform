"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MediaActionButton({ action, className, children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const url = await action();
    if (!url) return setLoading(false);
    router.push(url);
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span>جاري التحميل...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
