"use client";

import Link from "next/link";

export default function UnderConstruction() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-[#FDF2F2] rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-16 h-16 text-[#CC1116]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 bg-[#CC1116] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg rotate-12">
          PRÓXIMAMENTE
        </div>
      </div>

      <h1 className="text-3xl font-black text-[#0D1A3E] mb-3">Sitio en Construcción</h1>
      <p className="text-[#4A5680] max-w-md mx-auto leading-relaxed mb-8">
        Estamos trabajando para brindarte la mejor experiencia. Esta funcionalidad estará disponible muy pronto para toda la comunidad del IESTP.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-3 bg-[#1B2B6B] text-white rounded-2xl font-bold hover:bg-[#14205A] transition active:scale-95 shadow-xl shadow-blue-900/20"
        >
          Regresar
        </button>
        <Link 
          href="/"
          className="px-8 py-3 bg-white text-[#1B2B6B] border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition active:scale-95"
        >
          Ir al Inicio
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100 w-full max-w-xs">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          IESTP &quot;Andrés Avelino Cáceres Dorregaray&quot;
        </p>
      </div>
    </div>
  );
}
