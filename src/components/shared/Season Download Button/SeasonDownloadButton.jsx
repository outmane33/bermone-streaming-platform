"use client";
import { ICON_MAP } from "@/lib/data";
import { useRouter } from "next/navigation";

export default function SeasonDownloadButton({ slug }) {
  const router = useRouter();

  if (!slug) return null;

  return (
    <button
      onClick={() => router.push(`/${slug}/download`)}
      className="group relative font-semibold overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer px-3 lg:px-6 py-2 lg:py-2.5 text-base border border-white/30 text-white bg-white/10 hover:bg-white/20 flex items-center gap-2"
    >
      <ICON_MAP.ArrowDownToLine size={20} />
      <span>تحميل الموسم كاملا برابط واحد</span>
    </button>
  );
}
