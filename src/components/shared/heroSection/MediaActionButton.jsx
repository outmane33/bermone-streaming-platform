"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function MediaActionButton({
  action,
  children,
  className = "",
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const url = await action(); // Server Action يرجع URL بدل redirect
        if (url) router.push(url);
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <button disabled={isPending} className={className} onClick={handleClick}>
      {isPending ? (
        <span className="flex items-center gap-2 justify-center opacity-70">
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
          جاري التحميل...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
