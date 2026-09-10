import React from 'react';
import { Sparkles, ExternalLink, Dice5, Swords, Shield, Scroll } from 'lucide-react';
import { useLanguage } from '../services/i18n';

interface DndCompanionPromoProps {
  className?: string;
  targetUrl?: string;
}

export const DndCompanionPromo: React.FC<DndCompanionPromoProps> = ({
  className = '',
  targetUrl = 'https://dnd-companion-chi.vercel.app/'
}) => {
  const { language } = useLanguage();
  const isEs = language === 'es';

  return (
    <div
      onClick={() => window.open(targetUrl, '_blank', 'noopener,noreferrer')}
      className={`relative group cursor-pointer overflow-hidden transition-all duration-500 active:scale-[0.99] ${className}`}
    >
      {/* Glow ambiental exterior estilo TeamLobby con tinte dorado D&D */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-600/10 to-amber-700/20 rounded-[2.2rem] blur-xl opacity-40 group-hover:opacity-80 transition duration-500 pointer-events-none" />

      {/* CONTENEDOR EXTERIOR: Guía de Estilo TeamLobby */}
      <div className="relative bg-[#121212] border border-gray-800 group-hover:border-amber-500/50 rounded-[2rem] p-6 sm:p-7 shadow-2xl transition-all duration-300">
        
        {/* Cabecera Gamer TeamLobby: Tag de recomendación */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f5d061]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
              {isEs ? 'Proyecto Recomendado' : 'Featured Project'}
            </span>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-widest text-gray-500 group-hover:text-amber-300 transition-colors">
            dnd-companion.web <ExternalLink size={11} />
          </span>
        </div>

        {/* NÚCLEO INTERIOR: Estilo Grimorio & Pergamino Oscuro D&D Companion */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#1c140e] via-[#241a12] to-[#120d09] border border-amber-500/20 p-5 sm:p-6 overflow-hidden shadow-inner">
          
          {/* Marca de agua / Runa mágica de fondo */}
          <div className="absolute -right-6 -bottom-6 text-amber-500/5 group-hover:text-amber-500/10 transition-colors pointer-events-none -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Dice5 size={140} strokeWidth={1} />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Título e Icono D20 */}
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/40 rounded-xl text-[#f5d061] shadow-[0_0_15px_rgba(245,208,97,0.2)] shrink-0">
                <Dice5 size={24} className="group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f5d061] tracking-wide leading-tight flex items-center gap-2">
                  <span>D&D Companion</span>
                  <Sparkles size={16} className="text-amber-400 animate-pulse shrink-0" />
                </h3>
                <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-amber-200/60 mt-0.5">
                  {isEs ? 'Mesa Virtual 5ª Edición & Hojas Interactivas' : '5th Edition Virtual Tabletop & Interactive Sheets'}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-xs text-gray-300/90 leading-relaxed font-sans">
              {isEs ? (
                <>
                  Lleva tus partidas al siguiente nivel: <strong className="text-amber-200">fichas de personaje en vivo</strong>, panel de DM en tiempo real, tiradas de dados 3D con físicas, gestión de inventario y combates sincronizados.
                </>
              ) : (
                <>
                  Elevate your campaign: <strong className="text-amber-200">live interactive character sheets</strong>, real-time DM command dashboard, 3D physics dice rolling, inventory tracking, and synchronized combat.
                </>
              )}
            </p>

            {/* Badges de Características D&D */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-amber-500/20 text-[10px] font-bold text-amber-300">
                <Swords size={11} className="text-amber-400" /> {isEs ? 'Combate en Tiempo Real' : 'Real-time Combat'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-amber-500/20 text-[10px] font-bold text-amber-300">
                <Shield size={11} className="text-amber-400" /> {isEs ? 'Panel DM Completo' : 'Full DM Dashboard'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-amber-500/20 text-[10px] font-bold text-amber-300">
                <Scroll size={11} className="text-amber-400" /> {isEs ? 'Reglas Oficiales 5e' : 'Official 5e Rules'}
              </span>
            </div>

            {/* Botón Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,208,97,0.3)] hover:shadow-[0_0_25px_rgba(245,208,97,0.5)] hover:brightness-105 transition-all"
              >
                <span>{isEs ? 'Explorar D&D Companion' : 'Explore D&D Companion'}</span>
                <ExternalLink size={13} strokeWidth={2.5} />
              </button>
              <span className="text-[10px] text-amber-200/50 font-mono text-center sm:text-right">
                {isEs ? '¡100% Gratuito en la web!' : '100% Free on the web!'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DndCompanionPromo;
