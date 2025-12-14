import Link from "next/link";
import Image from "next/image";

export const Logo = ({ isTouchDevice }) => (
  <Link href="/" className="relative group cursor-pointer" dir="ltr">
    {!isTouchDevice && (
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition duration-500" />
    )}

    <div className="relative rounded-xl  p-1 flex items-center gap-3 border border-slate-800 group-hover:border-white/50 transition-all duration-300">
      {!isTouchDevice && (
        <>
          <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-xl opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:w-6 group-hover:h-6" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-white rounded-br-xl opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:w-6 group-hover:h-6" />
        </>
      )}

      <div className="relative flex-shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-br from-white/40 via-white/50 to-white/30 rounded-full blur opacity-40 group-hover:opacity-75 transition-opacity"></div>
        <Image
          src="/favicon.ico"
          alt="Bermone Logo"
          width={24}
          height={24}
          className="relative w-9 h-9 rounded-full p-0.5 group-hover:border-white/30 transition-colors"
        />
      </div>

      <span className="text-xl font-bold text-white tracking-wide pr-1">
        Bermone
      </span>
    </div>
  </Link>
);
