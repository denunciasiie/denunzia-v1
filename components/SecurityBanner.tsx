import React, { useState } from 'react';
import { ShieldCheck, Eye, X } from 'lucide-react';

export const SecurityBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#3b82f6] bg-[length:200%_auto] animate-gradient p-[2px] shrink-0 z-[100] relative">
      <div className="bg-[#020617] px-3 md:px-6 py-3 md:py-2.5 flex items-center justify-between backdrop-blur-3xl">
        <div className="flex items-center gap-3 md:gap-8 flex-1">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <ShieldCheck size={20} className="md:w-4 md:h-4 text-[#10b981]" />
              <div className="absolute inset-0 bg-[#10b981]/40 blur-sm rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs md:text-[10px] font-cyber font-black tracking-[0.15em] md:tracking-[0.2em] text-white">RED SEGURA ACTIVA</span>
          </div>

          <div className="hidden lg:flex items-center gap-4 md:gap-6 border-l border-white/10 pl-4 md:pl-8">
            <div className="flex items-center gap-2">
              <Eye size={14} className="md:w-3 md:h-3 text-[#10b981] opacity-70" />
              <span className="text-[10px] md:text-[9px] font-cyber font-bold text-[#94a3b8] uppercase tracking-[0.1em]">VIGILANCIA ACTIVA</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsVisible(false)}
            className="text-[#94a3b8] hover:text-white transition-colors p-2 md:p-1 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center bg-white/5 rounded-full"
          >
            <X size={18} className="md:w-[14px] md:h-[14px]" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 5s ease infinite;
        }
      `}</style>
    </div>
  );
};