import Link from "next/link";
import { ICON_MAP } from "@/lib/data";

export const Logo = ({ isTouchDevice }) => (
  <Link
    href="/?sort=latest-added"
    className="relative group cursor-pointer"
    dir="ltr"
  >
    {!isTouchDevice && (
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition duration-500" />
    )}
    <div className="relative rounded-xl p-2 flex items-center gap-2 border border-slate-700/50 transition-all duration-300">
      {!isTouchDevice && (
        <>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500 rounded-tl-xl opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-pink-500 rounded-br-xl opacity-60 group-hover:opacity-100 transition-opacity" />
        </>
      )}
      <ICON_MAP.Film className="w-5 h-5 text-white" />
      <span className="text-xl font-bold text-white">Bermone</span>
    </div>
  </Link>
);
