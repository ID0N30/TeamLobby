import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Cookie, ArrowLeft, Mail, Globe, CheckCircle2, Lock } from 'lucide-react';
import { useLanguage } from '../services/i18n';

interface LegalProps {
  defaultTab?: 'terms' | 'privacy' | 'cookies';
}

const Legal: React.FC<LegalProps> = ({ defaultTab = 'terms' }) => {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies'>(defaultTab);

  useEffect(() => {
    if (location.pathname === '/terms') setActiveTab('terms');
    else if (location.pathname === '/privacy') setActiveTab('privacy');
    else if (location.pathname === '/cookies') setActiveTab('cookies');
    else if (defaultTab) setActiveTab(defaultTab);
  }, [location.pathname, defaultTab]);

  const isEs = language === 'es';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-800/80 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/5"
            >
              <ArrowLeft size={16} />
              <span>{isEs ? 'Volver al Inicio' : 'Back to Home'}</span>
            </Link>
            <div className="h-4 w-px bg-gray-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="TeamLobby" className="w-6 h-6" />
              <span className="font-black italic tracking-tighter text-base text-white">
                TEAM<span className="text-primary">LOBBY</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                LEGAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(isEs ? 'en' : 'es')}
              className="px-3 py-1.5 rounded-xl border border-gray-800 hover:border-gray-700 bg-black/40 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Globe size={13} className="text-primary" />
              <span>{isEs ? 'English' : 'Español'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        {/* Hero title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
            <ShieldCheck size={14} />
            <span>Idoneus Software Legal Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white mb-3">
            {isEs ? 'Términos, Privacidad y Cumplimiento' : 'Terms, Privacy & Compliance'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
            {isEs
              ? 'Información transparente sobre el uso de TeamLobby y DnD Companion, tratamiento de datos personales y políticas de almacenamiento.'
              : 'Transparent information regarding the usage of TeamLobby and DnD Companion, personal data processing, and client storage policies.'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-8 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-primary text-white bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <FileText size={16} />
            <span>{isEs ? 'Términos de Servicio' : 'Terms of Service'}</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-primary text-white bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Lock size={16} />
            <span>{isEs ? 'Política de Privacidad' : 'Privacy Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'cookies'
                ? 'border-primary text-white bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Cookie size={16} />
            <span>{isEs ? 'Política de Cookies y Almacenamiento' : 'Cookie & Storage Policy'}</span>
          </button>
        </div>

        {/* TAB 1: TÉRMINOS DE SERVICIO */}
        {activeTab === 'terms' && (
          <div className="bg-surface/50 border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Idoneus Software</span>
                <h2 className="text-xl font-black uppercase text-white">
                  {isEs ? 'Términos y Condiciones de Uso' : 'Terms and Conditions of Use'}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                {isEs ? 'Vigencia: Año 2026' : 'Effective: 2026'}
              </span>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">1.</span> {isEs ? 'Aceptación de los Términos' : 'Acceptance of Terms'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'Al acceder, navegar o utilizar la plataforma web TeamLobby (incluyendo sus módulos asociados como la Galería Gamer y herramientas afines del ecosistema de Idoneus Software como DnD Companion), el usuario declara haber leído, comprendido y aceptado en su totalidad estos Términos de Servicio. Si no estás de acuerdo con cualquiera de estas cláusulas, deberás abstenerte de utilizar la plataforma.'
                  : 'By accessing, browsing, or using the TeamLobby web platform (including associated modules such as the Gamer Gallery and related ecosystem tools like DnD Companion), you acknowledge having read, understood, and agreed to be bound by these Terms of Service in full. If you do not agree, please discontinue using the platform.'}
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">2.</span> {isEs ? 'Descripción del Servicio y Modelo Freemium' : 'Service Description & Freemium Model'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'TeamLobby es una herramienta digital de coordinación de escuadras y comunidades gamer que permite crear salas en tiempo real, proponer y votar videojuegos para sesiones grupales, consultar información de Steam y registrar bibliotecas y logros personales.'
                  : 'TeamLobby is a digital coordination utility for gaming squads and communities allowing real-time lobby creation, game suggestions and voting for group sessions, Steam catalog lookup, and personal gamer gallery/trophy tracking.'}
              </p>
              <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-black uppercase text-yellow-400">
                  {isEs ? 'Esquema de Planes y Barreras del Modelo Freemium:' : 'Plan Structure and Freemium Tiers:'}
                </h4>
                <ul className="text-xs space-y-1.5 text-gray-300 list-disc list-inside">
                  <li>
                    <strong>{isEs ? 'Nivel Gratuito (Actual):' : 'Free Tier (Current):'}</strong> {isEs ? 'Acceso sin costo a creación de salas públicas y privadas, ruleta de decisión, votación democrática, chat sincronizado, catálogo de autocompletado y registro en la Galería Gamer personal.' : 'Free access to public and private lobbies, decision roulette, democratic voting, synchronized chat, catalog autocomplete, and personal Gamer Gallery tracking.'}
                  </li>
                  <li>
                    <strong>{isEs ? 'Futuras Funcionalidades Premium / Pro:' : 'Future Premium / Pro Features:'}</strong> {isEs ? 'Idoneus Software se reserva el derecho de implementar planes de suscripción o micropagos para funcionalidades avanzadas (tales como analíticas de gremios, integración directa con webhooks de Discord, almacenamiento ilimitado de capturas o personalización visual de salas).' : 'Idoneus Software reserves the right to introduce optional paid tiers for advanced features (e.g., guild analytics, Discord webhook bots, unlimited high-res media storage, or customized lobby branding).'}
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">3.</span> {isEs ? 'Reglas de Conducta Comunitaria' : 'Community Conduct & Acceptable Use'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'Queda terminantemente prohibido utilizar los nombres de salas, comentarios de juegos, chats de escuadra o alias de usuario para publicar contenido ilícito, amenazante, difamatorio, xenófobo, racista o que atente contra los derechos de terceros. Idoneus Software se reserva la facultad de suspender, silenciar o eliminar cuentas que incumplan estas disposiciones sin previo aviso.'
                  : 'Using room names, game comments, squad chats, or usernames to publish unlawful, abusive, defamatory, discriminatory, or infringing content is strictly prohibited. Idoneus Software reserves the right to suspend, mute, or ban accounts violating these rules without prior notice.'}
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">4.</span> {isEs ? 'Propiedad Intelectual y Atribución' : 'Intellectual Property & Attribution'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'El código fuente original, diseño de interfaz y arquitectura de TeamLobby son propiedad exclusiva de Julian Andrés Osorio Marín bajo el sello de portafolio Idoneus Software (© 2026). Los nombres comerciales de videojuegos, logotipos, carátulas y metadatos mostrados a través de la integración con APIs públicas de Steam pertenecen a Valve Corporation y a sus respectivos titulares de derechos.'
                  : 'Original source code, interface design, and architecture of TeamLobby are the sole property of Julian Andrés Osorio Marín under the portfolio imprint Idoneus Software (© 2026). Video game trademarks, logos, cover artwork, and metadata retrieved via public Steam APIs belong to Valve Corporation and their respective copyright holders.'}
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">5.</span> {isEs ? 'Limitación de Responsabilidad' : 'Limitation of Liability'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'El servicio se suministra "tal como está" ("as is") y "según disponibilidad". Idoneus Software no garantiza la ausencia total de interrupciones técnicas derivadas de fallos de proveedores de infraestructura en la nube (Google Firebase, Vercel o Steam API) ni asume responsabilidad por pérdida de datos por incompatibilidad local del navegador.'
                  : 'The platform is provided "as is" and "as available". Idoneus Software makes no express guarantees regarding uninterrupted uptime caused by third-party cloud infrastructure (Google Firebase, Vercel, or Steam API) and bears no liability for local browser data loss.'}
              </p>
            </section>
          </div>
        )}

        {/* TAB 2: POLÍTICA DE PRIVACIDAD */}
        {activeTab === 'privacy' && (
          <div className="bg-surface/50 border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Idoneus Software</span>
                <h2 className="text-xl font-black uppercase text-white">
                  {isEs ? 'Política de Privacidad y Tratamiento de Datos' : 'Privacy Policy & Data Processing'}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                {isEs ? 'Normativa Colombia / Ley 1581' : 'Colombia Law 1581 / GDPR Compliant'}
              </span>
            </div>

            {/* CRITICAL LEGAL DECLARATION CARD */}
            <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-wider">
                <ShieldCheck size={18} />
                <span>{isEs ? 'Declaración Obligatoria de Responsabilidad Jurídica' : 'Mandatory Legal Entity Declaration'}</span>
              </div>
              <p className="text-white text-xs sm:text-sm font-semibold leading-relaxed">
                {isEs ? (
                  <>
                    En cumplimiento de la legislación colombiana de protección de datos personales (<strong>Ley Estatutaria 1581 de 2012</strong>, Decreto 1377 de 2013) y estándares internacionales, se declara expresamente que la recolección, el almacenamiento, la custodia y el tratamiento de los datos de cuentas para las aplicaciones <strong>TeamLobby</strong> y <strong>DnD Companion</strong> están bajo la responsabilidad directa, legal y personal de <strong>Julian Andrés Osorio Marín</strong>, quien actúa como persona natural domiciliada en la República de <strong>Colombia</strong>.
                  </>
                ) : (
                  <>
                    Pursuant to Colombian personal data protection legislation (<strong>Statutory Law 1581 of 2012</strong>, Decree 1377 of 2013) and international data governance principles, it is explicitly declared that account data collection, storage, custody, and processing for <strong>TeamLobby</strong> and <strong>DnD Companion</strong> are the direct, personal, and legal responsibility of <strong>Julian Andrés Osorio Marín</strong>, operating as a natural person resident in <strong>Colombia</strong>.
                  </>
                )}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-gray-300">
                <div className="flex items-center gap-1.5 text-primary">
                  <Mail size={14} />
                  <span>Canal Oficial de Atención:</span>
                  <a href="mailto:jaomp3@gmail.com" className="underline hover:text-white transition-colors">
                    jaomp3@gmail.com
                  </a>
                </div>
                <div className="text-gray-500">•</div>
                <div>Jurisdicción: Colombia 🇨🇴</div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">1.</span> {isEs ? 'Información que Recopilamos' : 'Information We Collect'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'Recopilamos únicamente los datos mínimos indispensables para el funcionamiento técnico de las salas y galerías:'
                  : 'We strictly collect the minimum data necessary for the operational functioning of lobbies and galleries:'}
              </p>
              <ul className="space-y-2 text-xs text-gray-300 list-disc list-inside bg-black/40 p-4 rounded-xl border border-gray-800">
                <li>
                  <strong>{isEs ? 'Datos de Autenticación de Google:' : 'Google Authentication Data:'}</strong> {isEs ? 'Al iniciar sesión con Google OAuth, obtenemos tu identificador único de usuario (UID de Firebase), nombre público, correo electrónico y URL de foto de perfil.' : 'Upon logging in via Google OAuth, we receive your Firebase unique user identifier (UID), public name, email address, and avatar URL.'}
                </li>
                <li>
                  <strong>{isEs ? 'Datos de Partidas y Comunidad:' : 'Community and Gameplay Data:'}</strong> {isEs ? 'Historial de salas creadas, juegos guardados en tu Galería Gamer, dificultades superadas, trofeos platinados, retos gamer entre amigos y notas personales.' : 'History of visited lobbies, games cataloged in your Gamer Gallery, difficulty records, platinum badges, friend challenges, and personal notes.'}
                </li>
                <li>
                  <strong>{isEs ? 'Modo Invitado:' : 'Guest Mode:'}</strong> {isEs ? 'Los usuarios sin sesión iniciada reciben un identificador aleatorio efímero almacenado en sessionStorage para coordinar votos sin recopilar identidad personal.' : 'Users in guest mode are assigned an ephemeral identifier in sessionStorage to allow voting without collecting personal identity.'}
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">2.</span> {isEs ? 'Finalidad y Uso de la Información' : 'Purpose and Data Utilization'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'La información personal se utiliza exclusivamente para: (a) autenticar tu acceso a la plataforma, (b) sincronizar tus salas y biblioteca de juegos en tiempo real mediante Firebase Realtime Database, y (c) permitir la interacción con tus amigos mediante solicitudes de amistad y retos.'
                  : 'Personal data is strictly used to: (a) authenticate your account access, (b) synchronize your active lobbies and game library in real-time via Firebase Realtime Database, and (c) facilitate friend interaction via player codes and gaming challenges.'}
              </p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>
                  {isEs
                    ? 'Garantía de no comercialización: Jamás vendemos, alquilamos ni compartimos tu información personal con anunciantes o terceros para fines comerciales.'
                    : 'Non-commercialization guarantee: We never sell, rent, or trade your personal data with advertising brokers or commercial third parties.'}
                </span>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">3.</span> {isEs ? 'Ejercicio de Derechos ARCO (Habeas Data)' : 'ARCO Rights (Access, Rectification, Erasure)'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'Como titular de tus datos personales, tienes derecho a conocer, actualizar, rectificar y solicitar la supresión de tus datos de nuestros registros en cualquier momento. Para ejercer estos derechos, simplemente envía una solicitud formal al correo del responsable:'
                  : 'As the owner of your personal data, you are entitled to access, review, rectify, or request complete erasure of your records at any time. To exercise these rights, submit your request to our data officer:'}
              </p>
              <div className="p-4 rounded-xl bg-black border border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-white uppercase">Julian Andrés Osorio Marín</p>
                  <p className="text-xs text-primary font-mono mt-0.5">jaomp3@gmail.com</p>
                  <p className="text-[10px] text-gray-500 mt-1">{isEs ? 'Tiempo promedio de respuesta: menos de 48 horas hábiles.' : 'Typical response time: under 48 business hours.'}</p>
                </div>
                <a
                  href="mailto:jaomp3@gmail.com?subject=Solicitud%20Derechos%20ARCO%20-%20TeamLobby"
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-violet-600 transition-all"
                >
                  {isEs ? 'Enviar Solicitud' : 'Send Request'}
                </a>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: POLÍTICA DE COOKIES Y STORAGE */}
        {activeTab === 'cookies' && (
          <div className="bg-surface/50 border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Idoneus Software</span>
                <h2 className="text-xl font-black uppercase text-white">
                  {isEs ? 'Política de Cookies y Almacenamiento Local' : 'Cookie & Client Storage Policy'}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gray-500">
                {isEs ? 'Tecnologías de Persistencia Web' : 'Web Persistence Technologies'}
              </span>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">1.</span> {isEs ? '¿Qué Tecnologías Empleamos?' : 'What Technologies Do We Use?'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'TeamLobby no utiliza cookies invasivas de seguimiento publicitario de terceros. En su lugar, hacemos uso de las tecnologías nativas del navegador conocidas como Almacenamiento Web (Web Storage API: localStorage y sessionStorage), las cuales permiten retener preferencias esenciales de usuario directamente en tu dispositivo de forma segura.'
                  : 'TeamLobby does not deploy invasive third-party ad tracking cookies. Instead, we make use of modern browser Web Storage APIs (localStorage and sessionStorage) to retain essential user preferences directly on your local device securely.'}
              </p>
            </section>

            {/* Section 2: Table */}
            <section className="space-y-4">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">2.</span> {isEs ? 'Inventario de Claves y Persistencia' : 'Storage Inventory & Purposes'}
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-gray-400 uppercase font-black tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="p-3.5">Clave / Key</th>
                      <th className="p-3.5">Mecanismo</th>
                      <th className="p-3.5">{isEs ? 'Propósito' : 'Purpose'}</th>
                      <th className="p-3.5">{isEs ? 'Caducidad' : 'Duration'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 bg-surface/30 text-gray-300">
                    <tr>
                      <td className="p-3.5 font-mono text-primary font-bold">appLanguage</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">localStorage</span></td>
                      <td className="p-3.5">{isEs ? 'Guarda el idioma preferido de la interfaz (Español o Inglés).' : 'Stores preferred UI language (Spanish or English).'}</td>
                      <td className="p-3.5 text-gray-400">{isEs ? 'Permanente hasta borrado de datos' : 'Persistent until cache clear'}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono text-primary font-bold">sound_muted</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">localStorage</span></td>
                      <td className="p-3.5">{isEs ? 'Recuerda si el audio/soundboard está en silencio.' : 'Remembers whether sound FX/soundboard is muted.'}</td>
                      <td className="p-3.5 text-gray-400">{isEs ? 'Permanente' : 'Persistent'}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono text-primary font-bold">guestId / guestAlias</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">sessionStorage</span></td>
                      <td className="p-3.5">{isEs ? 'Identificador y alias temporal para coordinar salas como invitado sin login.' : 'Temporary ID and nickname for guest lobby navigation.'}</td>
                      <td className="p-3.5 text-gray-400">{isEs ? 'Al cerrar la pestaña del navegador' : 'Expires when browser tab closes'}</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono text-primary font-bold">firebase:authUser</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">IndexedDB / Local</span></td>
                      <td className="p-3.5">{isEs ? 'Token de sesión cifrado para mantener abierta tu cuenta de Google.' : 'Encrypted session token to keep your Google login active.'}</td>
                      <td className="p-3.5 text-gray-400">{isEs ? 'Hasta cierre de sesión (Logout)' : 'Until manual user logout'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="text-primary">3.</span> {isEs ? '¿Cómo Limpiar o Gestionar el Almacenamiento?' : 'How to Manage or Clear Local Storage'}
              </h3>
              <p className="text-gray-300">
                {isEs
                  ? 'Puedes eliminar en cualquier momento estos datos desde las herramientas de configuración de tu navegador (Opciones > Privacidad y Seguridad > Borrar datos de navegación / Cookies y datos del sitio). Ten presente que al borrarlos se cerrará tu sesión activa y se restablecerán tus preferencias de idioma y sonido a los valores predeterminados.'
                  : 'You can clear these stored values at any time from your browser settings (Settings > Privacy & Security > Clear Browsing Data / Site Data). Please note that clearing this data will sign you out and reset your language and audio preferences to defaults.'}
              </p>
            </section>
          </div>
        )}

        {/* Bottom Contact Help Card */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 via-surface to-accent/10 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-black uppercase italic text-white mb-1">
              {isEs ? '¿Preguntas sobre nuestras políticas?' : 'Questions about our legal policies?'}
            </h4>
            <p className="text-xs text-gray-400 max-w-lg">
              {isEs
                ? 'Escríbenos directamente para resolver cualquier inquietud sobre la plataforma o ejercer tus derechos de privacidad.'
                : 'Get in touch directly to resolve any inquiries about our platform or exercise your privacy rights.'}
            </p>
          </div>
          <a
            href="mailto:jaomp3@gmail.com?subject=Consulta%20Legal%20TeamLobby"
            className="px-6 py-3 bg-white text-black font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2 shrink-0 active:scale-95 shadow-lg"
          >
            <Mail size={16} />
            <span>jaomp3@gmail.com</span>
          </a>
        </div>
      </main>

      {/* Mini footer */}
      <footer className="border-t border-gray-900 bg-black/80 py-6 text-center text-xs text-gray-600 font-mono">
        © 2026 Idoneus Software. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'} • Colombia 🇨🇴
      </footer>
    </div>
  );
};

export default Legal;
