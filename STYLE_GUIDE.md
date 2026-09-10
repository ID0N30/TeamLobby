# TeamLobby — Guía de Estilo Artístico

## 1. Paleta de Colores

| Token | Hex | Uso |
|---|---|---|
| `background` | `#0a0a0a` | Fondo de página, overlays oscuros |
| `surface` | `#121212` | Tarjetas, modales, paneles elevados |
| `primary` | `#8b5cf6` (violet-500) | Botones principales, enlaces, estados activos |
| `secondary` | `#10b981` (emerald-500) | Éxito, ready, selección activa |
| `accent` | `#06b6d4` (cyan-500) | Acompaña a primary en gradientes del logo |
| `danger` | `#ef4444` (red-500) | Acciones destructivas, bans, errores |

Semántica extendida:
- Texto base: `#e5e5e5` (gray-200)
- Texto secundario: `#9ca3af`, `#6b7280`, `#4b5563` (gray-400/500/600)
- Bordes por defecto: `#1f2937` (gray-800)
- Inputs / fondos oscuros: `bg-black/40` a `bg-black/95`
- Overlays modales: `bg-black/90 backdrop-blur-md`

---

## 2. Tipografía

**Fuentes:**
- Sans-serif: `'Inter', 'system-ui', 'sans-serif'` (Google Fonts)
- Monospace: `'Fira Code', 'monospace'` (Google Fonts)

**Grosores:**
- `font-normal` (400) — cuerpo (raro)
- `font-bold` (700) — descripciones, labels
- `font-black` (900) — **el peso principal**: headings, botones, etiquetas, stats

**Patrones:**
- **MAYÚSCULAS en casi toda la UI**: botones, headers, etiquetas, navegación
- **Italic + uppercase + tracking-tighter** en headings para estética gamer
- Espaciado entre letras: `tracking-[0.2em]` a `tracking-[0.5em]` en botones y labels
- Códigos de sala en `font-mono font-black text-primary/80 tracking-widest`

---

## 3. Radios de Borde

| Clase | Uso |
|---|---|
| `rounded-lg` | Badges pequeños, tags |
| `rounded-xl` | Botones, inputs, filtros |
| `rounded-2xl` | Tarjetas, modales pequeños |
| `rounded-[2rem]` | **Radio estándar** de tarjetas y contenedores |
| `rounded-[2.5rem]` | Contenedores principales, modales, hero card |
| `rounded-[3rem]` | Contenedores grandes, empty states |
| `rounded-full` | Avatares, FAB, dots de estado |

---

## 4. Sombras

| Clase | Uso |
|---|---|
| `shadow-xl` | Sombra estándar de tarjetas |
| `shadow-2xl` | Modales, contenedores elevados |
| `shadow-inner` | Inputs |
| `shadow-xl shadow-primary/20` | Botones primarios |
| `shadow-[0_0_50px_rgba(139,92,246,0.05)]` | Card destacada (Community Lobby) |
| `shadow-[0_0_20px_rgba(139,92,246,0.3)]` | FAB de chat |
| `drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]` | Brillo de trofeo/ganador |

---

## 5. Glassmorphism y Efectos

- `backdrop-blur-xl` — header, modales principales
- `backdrop-blur-md` — overlays, sidebar mobile
- `backdrop-blur-2xl` — panel de chat
- Fondos semitransparentes: `bg-surface/30`, `bg-surface/40`, `bg-surface/50`
- **Brillo ambiental**: círculos enormes borrosos con color primary
  ```tsx
  className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[180px] pointer-events-none"
  ```

---

## 6. Layout

- Home: `grid-cols-1 lg:grid-cols-12 gap-10` (8 cols contenido + 4 cols sidebar)
- Featured rooms: `grid-cols-1 sm:grid-cols-2 gap-5`
- Parrilla de juegos: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8`
- Lobby: `h-screen` con sidebar fija (`w-72`) + área scrollable + FAB chat flotante
- Modales: `fixed inset-0` con overlay, centrados con `max-w-sm / max-w-md / max-w-4xl`

---

## 7. Animaciones

| Clase | Uso |
|---|---|
| `animate-spin` | Loaders (Loader2) |
| `animate-pulse` | Skeleton loaders, indicador ready |
| `animate-ping` | Dot de sala activa |
| `animate-in zoom-in-95 duration-200` | Entrada de modales |
| `slide-in-from-bottom-2/10` | Mensajes de chat, panel |
| `hover:translate-y-[-4px]` | Elevación de tarjetas |
| `active:scale-95` | Feedback de click en botones |
| `group-hover:scale-110` | Zoom de imagen en tarjeta |
| `transition-all duration-300` | Transición estándar |

---

## 8. Iconos

**Lucide React** v0.554.0. Iconos principales:
`Gamepad2`, `Users`, `Trophy`, `ThumbsUp`, `Settings`, `Plus`, `Search`, `MessageCircle`, `Send`, `Loader2`, `Lock`, `ShieldCheck`, `Ban`, `Trash2`, `Copy`, `ArrowLeft`, `X`, `Menu`, `Dices`, `Vote`, `PlayCircle`

---

## 9. Botones

| Estilo | Clases clave |
|---|---|
| Primario | `bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95` |
| Secundario | `bg-gray-800 text-gray-400 py-3 rounded-xl border border-gray-700` |
| Peligro | `bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white` |
| Deshabilitado | `bg-gray-900 text-gray-700 border-gray-800 cursor-not-allowed` |

---

## 10. Inputs

```tsx
// Estándar
className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-sm font-black focus:border-primary outline-none"

// Código de sala
className="flex-1 bg-black/60 border border-gray-800 rounded-2xl px-4 py-4 text-center tracking-[0.3em] font-black text-lg uppercase"

// Búsqueda
className="w-full bg-surface border border-gray-800 rounded-[2.5rem] py-5 pl-14 pr-6"
```

---

## 11. Modo Oscuro

Siempre oscuro, no hay modo claro. `darkMode: 'class'` en tailwind pero todo el diseño es dark-only.

---

## 12. Scrollbar Personalizada

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #262626; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #333; }
```

Clase `.custom-scrollbar` aplicada a áreas scrollables.

---

## 13. PWA

- Background: `#0a0a0a`
- Theme: `#0a0a0a`
- Display: `standalone`
- Orientation: `portrait-primary`

---

## 14. Resumen de Estética General

Interfaz **oscura con acento violeta** para gaming. Uso intensivo de:
- Mayúsculas y peso `black` en tipografía
- Radios de borde grandes (2rem-2.5rem)
- Efectos glassmorphism con backdrop blur
- Brillo ambiental con círculos borrosos
- Animaciones sutiles en hover (elevación, escala, color)
- Lenguaje visual competitivo (podios, trophies, ranks, ready states)
