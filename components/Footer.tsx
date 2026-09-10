import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Cookie, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  HelpCircle, 
  X, 
  Scroll, 
  Github, 
  MessageSquare,
  CheckCircle2,
  Swords,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../services/i18n';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const isEs = language === 'es';

  // Modals state
  const [showChangelog, setShowChangelog] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showDndModal, setShowDndModal] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const faqList = isEs ? [
    {
      q: '¿Cómo creo una sala y qué diferencia hay entre pública y privada?',
      a: 'Puedes crear una sala desde la pantalla principal haciendo clic en "Crear Sala". Las salas públicas aparecen en el listado de "Salas de la Comunidad" para que cualquiera pueda unirse. Las salas privadas requieren una clave de acceso secreta que solo conocerá tu escuadra.'
    },
    {
      q: '¿Cómo funciona la votación y el comando Ready?',
      a: 'Cualquier miembro puede sugerir videojuegos buscando en el catálogo de Steam o ingresando los datos manualmente. Todos pueden votar por sus favoritos. Cuando todos marcan "ESTOY LISTO", el líder puede procesar la actividad democrática o hacer girar la Ruleta del Destino.'
    },
    {
      q: '¿Qué es la Galería Gamer y cómo la comparto?',
      a: 'Es tu vitrina personal donde registras juegos completados, platinos, dificultades superadas y notas. Cada usuario tiene una URL única (ej. /showcase/tu-id) y un Código de Jugador (#TL-XXXX) para agregar amigos y lanzar retos.'
    },
    {
      q: '¿Es TeamLobby 100% gratuito?',
      a: 'Sí. Todas las funciones esenciales (creación ilimitada de salas, ruleta, votaciones, chat P2P, galería gamer y retos) son y seguirán siendo gratuitas.'
    },
    {
      q: '¿Cómo reporto un error o propongo una mejora?',
      a: 'Escríbenos directamente a jaomp3@gmail.com con el asunto "[TeamLobby Reporte]" describiendo los pasos del error o tu idea para la plataforma.'
    }
  ] : [
    {
      q: 'How do I create a lobby and what is the difference between public and private?',
      a: 'Create a room from the main home screen by clicking "Create Room". Public lobbies appear in the Community Rooms section for anyone to join. Private lobbies require a secret password known only to your squad.'
    },
    {
      q: 'How do game voting and the Ready command work?',
      a: 'Any squad member can propose games with Steam autocomplete or manual entry. Everyone votes on their favorites. Once all players toggle "I AM READY", the leader can process the vote or trigger the Roulette of Fate.'
    },
    {
      q: 'What is the Gamer Gallery and how do I share it?',
      a: 'It is your personal showcase to log beaten games, platinums, difficulty records, and notes. Each user has a unique showcase URL and a Player Code (#TL-XXXX) to connect with friends and launch challenges.'
    },
    {
      q: 'Is TeamLobby 100% free to use?',
      a: 'Yes. All core squad features (unlimited rooms, roulette, voting, P2P squad chat, gamer gallery, and friends challenges) are completely free.'
    },
    {
      q: 'How do I report a bug or request a feature?',
      a: 'Email us directly at jaomp3@gmail.com with the subject "[TeamLobby Issue]" detailing the reproduction steps or your feedback.'
    }
  ];

  return (
    <>
      <footer className="w-full bg-[#0d0d0d] border-t border-gray-800/80 text-gray-400 mt-20 relative z-30 transition-colors selection:bg-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Main 4-Column Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-gray-800/60">
            
            {/* Col 1: Brand & Operational Status (5 cols on lg) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="/favicon.svg" alt="TeamLobby" className="w-7 h-7" />
                <div className="flex flex-col">
                  <span className="font-black italic tracking-tighter text-lg text-white">
                    TEAM<span className="text-primary">LOBBY</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                    by Idoneus Software
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                {t('footer.tagline')}
              </p>

              <div className="space-y-2 pt-1">
                {/* Systems Operational Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('footer.allOperational')}</span>
                </div>

                {/* Country Pill */}
                <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                  <span>{t('footer.colombia')}</span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500/90 leading-snug border-l-2 border-primary/40 pl-3 pt-0.5">
                {t('footer.legalNotice')}
              </div>
            </div>

            {/* Col 2: Product & Ecosystem (2.5 cols on lg) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary" />
                <span>{t('footer.productTitle')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href="#features"
                    onClick={(e) => {
                      if (window.location.pathname !== '/') {
                        window.location.href = '/#features';
                      }
                    }}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {t('footer.features')}
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setShowChangelog(true)}
                    className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>{t('footer.changelog')}</span>
                    <span className="px-1.5 py-0.2 bg-primary/20 text-primary font-mono text-[9px] rounded font-bold">v2.4</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowPlans(true)}
                    className="hover:text-primary transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>{t('footer.freemiumPlans')}</span>
                    <span className="px-1.5 py-0.2 bg-yellow-500/20 text-yellow-400 font-mono text-[9px] rounded font-bold">Free</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowDndModal(true)}
                    className="hover:text-primary transition-colors text-left flex items-center gap-1.5 text-gray-400 group"
                  >
                    <span>{t('footer.dndCompanion')}</span>
                    <ExternalLink size={11} className="text-gray-500 group-hover:text-primary transition-colors" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Support & Contact (2.5 cols on lg) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                <HelpCircle size={14} className="text-emerald-400" />
                <span>{t('footer.supportTitle')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => setShowFaq(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t('footer.helpCenter')}
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:jaomp3@gmail.com?subject=%5BTeamLobby%20Reporte%5D%20Fallo%20o%20Sugerencia&body=Describe%20el%20problema%20y%20los%20pasos%20para%20reproducirlo:"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{t('footer.reportIssue')}</span>
                    <Mail size={12} className="text-red-400" />
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:jaomp3@gmail.com?subject=%5BTeamLobby%20Contacto%5D%20Consulta"
                    className="hover:text-white transition-colors flex items-center gap-1.5 font-mono text-[11px] text-gray-300"
                  >
                    <Mail size={12} className="text-primary" />
                    <span>jaomp3@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Compliance (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-yellow-400" />
                <span>{t('footer.legalTitle')}</span>
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors flex items-center gap-1">
                    <FileText size={12} className="text-gray-500" />
                    <span>{t('footer.terms')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1">
                    <ShieldCheck size={12} className="text-gray-500" />
                    <span>{t('footer.privacy')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-white transition-colors flex items-center gap-1">
                    <Cookie size={12} className="text-gray-500" />
                    <span>{t('footer.cookies')}</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Row: Copyright + Social Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-gray-500 text-center sm:text-left">
              <p className="font-medium">{t('footer.copyright')}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {isEs ? 'Publicado bajo el sello de desarrollo Idoneus Software.' : 'Published under Idoneus Software portfolio imprint.'}
              </p>
            </div>

            {/* Social / External Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/ID0N30/TeamLobby"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2.5 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
                title="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href="mailto:jaomp3@gmail.com"
                aria-label="Email Support"
                className="p-2.5 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-primary hover:border-primary/50 transition-all"
                title="jaomp3@gmail.com"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://discord.gg/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord Community"
                className="p-2.5 rounded-xl bg-surface border border-gray-800 text-gray-400 hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-all"
                title="Discord Community"
              >
                <MessageSquare size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CHANGELOG MODAL */}
      {showChangelog && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Scroll size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    {isEs ? 'Registro de Actualizaciones (Changelog)' : 'Software Changelog & Updates'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">TeamLobby Web Application</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
              
              {/* v2.4 */}
              <div className="relative pl-6 border-l-2 border-primary space-y-1.5">
                <div className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface" />
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">v2.4.0</span>
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-black uppercase text-[9px] tracking-wider">
                    {isEs ? 'Última Versión' : 'Latest Release'}
                  </span>
                  <span className="text-gray-500 text-[10px] font-mono">2026</span>
                </div>
                <h4 className="text-sm font-black text-gray-200">
                  {isEs ? 'Galería Gamer, Sistema de Amigos y Retos' : 'Gamer Gallery, Squad Friends & Challenges'}
                </h4>
                <ul className="text-gray-400 space-y-1 list-disc list-inside leading-relaxed">
                  <li>{isEs ? 'Galería gamer personal con estados: Terminado, 100% Platinado, Jugando, Por Jugar, Dropeado.' : 'Personal backlog showcase with statuses: Completed, Platinum, Playing, Backlog, Dropped.'}</li>
                  <li>{isEs ? 'Registro de trofeos: Dificultad Pesadilla, Speedrun, No-Hit, Co-op y notas personales.' : 'Trophy records: Nightmare, Speedrun, No-Hit, Co-op, and player notes.'}</li>
                  <li>{isEs ? 'Códigos de Jugador únicos (#TL-XXXX) para agregar amigos e invitar a salas.' : 'Unique Player Codes (#TL-XXXX) to connect with friends.'}</li>
                  <li>{isEs ? 'Sistema de Retos Gamer entre amigos con seguimiento de cumplimiento.' : 'Challenge friends with personalized game objectives.'}</li>
                </ul>
              </div>

              {/* v2.3 */}
              <div className="relative pl-6 border-l-2 border-gray-800 space-y-1.5">
                <div className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-gray-700 border-2 border-surface" />
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">v2.3.0</span>
                  <span className="text-gray-500 text-[10px] font-mono">2025</span>
                </div>
                <h4 className="text-sm font-black text-gray-300">
                  {isEs ? 'Soundboard Gamer y Audio FX' : 'Soundboard & Audio Effects Engine'}
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  {isEs 
                    ? 'Efectos de sonido interactivos al unirse miembros, votar propuestas, tirar la ruleta y ganar trofeos, con control maestro de mute.'
                    : 'Interactive audio feedback for lobby joins, voting, roulette spin, and trophy unlocks, with global mute persistence.'}
                </p>
              </div>

              {/* v2.2 */}
              <div className="relative pl-6 border-l-2 border-gray-800 space-y-1.5">
                <div className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-gray-700 border-2 border-surface" />
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">v2.2.0</span>
                  <span className="text-gray-500 text-[10px] font-mono">2025</span>
                </div>
                <h4 className="text-sm font-black text-gray-300">
                  {isEs ? 'Lobby Comunitario y Sincronización en Tiempo Real' : 'Community Hub & Realtime Sync'}
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  {isEs 
                    ? 'Acceso directo a la sala comunitaria global y optimización de latencia con Firebase Realtime Database.'
                    : 'Direct access to public community hub with low-latency Firebase Realtime sync.'}
                </p>
              </div>

              {/* v2.0 */}
              <div className="relative pl-6 border-l-2 border-gray-800 space-y-1.5">
                <div className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-gray-700 border-2 border-surface" />
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-white text-sm">v2.0.0</span>
                  <span className="text-gray-500 text-[10px] font-mono">2024</span>
                </div>
                <h4 className="text-sm font-black text-gray-300">
                  {isEs ? 'Búsqueda Inteligente de Steam y Portadas en HD' : 'Steam Search & HD Game Art'}
                </h4>
                <p className="text-gray-400 leading-relaxed">
                  {isEs 
                    ? 'Autocompletado con metadatos oficiales de Steam, género, capturas y carátulas de alta resolución.'
                    : 'Smart search integration with official Steam store metadata, pricing, and artwork.'}
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-end">
              <button
                onClick={() => setShowChangelog(false)}
                className="px-5 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800"
              >
                {t('common.close') || 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FREEMIUM PLANS MODAL */}
      {showPlans && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Idoneus Software</span>
                <h3 className="text-lg font-black uppercase text-white tracking-tight">
                  {isEs ? 'Esquema de Planes y Filosofía Freemium' : 'Plan Tiers & Freemium Philosophy'}
                </h3>
              </div>
              <button
                onClick={() => setShowPlans(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <p className="text-xs text-gray-300 leading-relaxed">
                {isEs
                  ? 'Nuestra meta es ofrecer una suite sólida y completamente accesible para escuadras de juego. A continuación detallamos las características disponibles hoy y los planes en desarrollo:'
                  : 'Our mission is to provide an accessible squad hub. Here is what is included today in our Free tier, and what is planned for future Guild tiers:'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Plan Free (Active) */}
                <div className="bg-black/50 border-2 border-primary/50 rounded-2xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-white uppercase tracking-tight">
                        {isEs ? 'Plan Gratuito' : 'Free Tier'}
                      </h4>
                      <p className="text-[11px] text-primary font-bold">
                        {isEs ? 'Para todo jugador y escuadra' : 'For all players and squads'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary font-black uppercase text-[10px]">
                      {isEs ? 'Activo' : 'Active'}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white">
                    $0 <span className="text-xs text-gray-500 font-normal">/ {isEs ? 'siempre gratis' : 'forever free'}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{isEs ? 'Salas públicas y privadas ilimitadas' : 'Unlimited public & private lobbies'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{isEs ? 'Ruleta del destino y votaciones democráticas' : 'Fate roulette and democratic voting'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{isEs ? 'Chat sincronizado en tiempo real' : 'Real-time synchronized squad chat'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{isEs ? 'Galería Gamer (hasta 100 juegos registrados)' : 'Gamer Gallery (up to 100 logged games)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{isEs ? 'Sistema de Amigos por Código y Retos' : 'Player Code friends & Challenges'}</span>
                    </li>
                  </ul>
                </div>

                {/* Plan Guild Pro (Upcoming) */}
                <div className="bg-black/30 border border-gray-800 rounded-2xl p-5 space-y-4 opacity-80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-gray-300 uppercase tracking-tight">
                        {isEs ? 'Plan Guild / Pro' : 'Guild / Pro Tier'}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-bold">
                        {isEs ? 'Para clanes y comunidades masivas' : 'For clans & large gaming guilds'}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-black uppercase text-[10px]">
                      {isEs ? 'Próximamente' : 'Coming Soon'}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-gray-400">
                    {isEs ? 'En desarrollo' : 'In Development'}
                  </div>

                  <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex items-center gap-2">
                      <Sparkles size={14} className="text-yellow-400 shrink-0" />
                      <span>{isEs ? 'Integración con bot de Discord para avisar partidas' : 'Discord bot webhook integration for squad alerts'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={14} className="text-yellow-400 shrink-0" />
                      <span>{isEs ? 'Banners y fondos personalizados de sala' : 'Custom clan banners and room backgrounds'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={14} className="text-yellow-400 shrink-0" />
                      <span>{isEs ? 'Galería gamer sin límites con subida de capturas' : 'Unlimited gallery with screenshot uploads'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles size={14} className="text-yellow-400 shrink-0" />
                      <span>{isEs ? 'Analíticas de juego y estadísticas de escuadra' : 'Squad win/play statistics and leaderboards'}</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-end">
              <button
                onClick={() => setShowPlans(false)}
                className="px-5 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800"
              >
                {t('common.close') || 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {showFaq && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    {isEs ? 'Preguntas Frecuentes (FAQ)' : 'Frequently Asked Questions (FAQ)'}
                  </h3>
                  <p className="text-xs text-gray-500">Centro de Asistencia de TeamLobby</p>
                </div>
              </div>
              <button
                onClick={() => setShowFaq(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              {faqList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-black text-gray-200 hover:text-white flex items-center justify-between gap-3"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform ${activeFaqIndex === idx ? 'rotate-180 text-primary' : 'text-gray-500'}`}
                    />
                  </button>
                  {activeFaqIndex === idx && (
                    <div className="p-4 pt-0 text-gray-400 leading-relaxed border-t border-gray-800/40 bg-surface/30">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-800 bg-black/40 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                {isEs ? '¿Aún tienes dudas? Escribe a jaomp3@gmail.com' : 'Still need help? Email jaomp3@gmail.com'}
              </span>
              <button
                onClick={() => setShowFaq(false)}
                className="px-5 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800"
              >
                {t('common.close') || 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DND COMPANION MODAL */}
      {showDndModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
                  <Swords size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">
                    DnD Companion
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Idoneus Software Ecosystem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDndModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-300 leading-relaxed">
              <p>
                {isEs
                  ? 'DnD Companion es la herramienta hermana de TeamLobby desarrollada para la gestión de partidas de rol de mesa (Dungeons & Dragons 5e), fichas de personaje, tiradas de dados sincronizadas y seguimiento de iniciativa de campaña.'
                  : 'DnD Companion is TeamLobby’s sister platform engineered for tabletop RPG session coordination (D&D 5e), character sheet tracking, synchronized dice rolls, and encounter initiative management.'}
              </p>
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 text-[11px] space-y-1.5">
                <div className="font-black uppercase text-primary">
                  {isEs ? 'Mismo Ecosistema y Mismas Reglas de Privacidad:' : 'Shared Ecosystem & Privacy Standards:'}
                </div>
                <p className="text-gray-400">
                  {isEs
                    ? 'Al igual que TeamLobby, opera bajo el desarrollo y responsabilidad jurídica de Julian Andrés Osorio Marín (Colombia), garantizando la total privacidad de tus datos de usuario.'
                    : 'Operated under the legal responsibility of Julian Andrés Osorio Marín (Colombia), ensuring uncompromising user data privacy.'}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-black/40 flex items-center justify-between">
              <a
                href="mailto:jaomp3@gmail.com?subject=Inter%C3%A9s%20en%20DnD%20Companion"
                className="text-primary font-bold text-xs hover:underline flex items-center gap-1"
              >
                <span>{isEs ? 'Consultar acceso a la beta' : 'Request beta access'}</span>
                <ExternalLink size={12} />
              </a>
              <button
                onClick={() => setShowDndModal(false)}
                className="px-5 py-2 bg-gray-900 border border-gray-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800"
              >
                {t('common.close') || 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
