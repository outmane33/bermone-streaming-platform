import { Loader2 } from "lucide-react";
import { DESIGN_TOKENS } from "@/lib/data";

export default function LoadingOverlay({
  isVisible = false,
  message = "جاري التحميل...",
  size = 48,
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`flex flex-col items-center gap-4 ${DESIGN_TOKENS.glass.medium} px-8 py-6 rounded-2xl shadow-2xl border-cyan-500/30`}
      >
        <Loader2 size={size} className="text-cyan-400 animate-spin" />
        <p className="text-white font-semibold text-base md:text-lg">
          {message}
        </p>
      </div>
    </div>
  );
}
