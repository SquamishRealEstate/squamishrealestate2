// components/auth/HomeButton.tsx
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="fixed lg:absolute top-4 left-4 lg:top-8 lg:left-8 z-50 group"
    >
      {/* MOBILE: Compact Floating Circle */}
      <div className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 active:scale-95 transition-all">
        <Home size={18} className="text-slate-600" />
      </div>

      {/* DESKTOP: Branded Link with Hover Effect */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-300">
          <ChevronLeft
            size={18}
            className="text-white group-hover:text-slate-900 transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">
            Return to
          </span>
          <span className="text-sm font-bold text-white tracking-tight">
            Squamish Real Estate
          </span>
        </div>
      </div>
    </Link>
  );
}
