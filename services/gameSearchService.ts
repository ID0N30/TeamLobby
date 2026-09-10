import { GameGenre, Platform } from '../types';

export interface GameSuggestion {
  title: string;
  description: string;
  imageUrl: string;
  genre: GameGenre;
  platforms: Platform[];
  link: string;
  source?: 'steam' | 'curated';
}

/**
 * Base de datos local curada de los juegos multijugador y cooperativos más populares.
 * Permite autocompletado con 0ms de latencia, carátulas HD verificadas y metadatos exactos.
 */
const CURATED_GAMES: GameSuggestion[] = [
  {
    title: 'Helldivers 2',
    description: 'Shooter cooperativo en tercera persona donde luchas por la Democracia Gestionada en una galaxia hostil.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg',
    genre: GameGenre.SHOOTER,
    platforms: [Platform.PC, Platform.PS5],
    link: 'https://store.steampowered.com/app/553850/HELLDIVERS_2/',
    source: 'curated'
  },
  {
    title: 'Lethal Company',
    description: 'Juego cooperativo de terror y supervivencia donde recolectas chatarra en lunas industrializadas abandonadas.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966720/header.jpg',
    genre: GameGenre.HORROR,
    platforms: [Platform.PC],
    link: 'https://store.steampowered.com/app/1966720/Lethal_Company/',
    source: 'curated'
  },
  {
    title: 'It Takes Two',
    description: 'Aventura cooperativa pura diseñada exclusivamente para dos jugadores con mecánicas variadas y emotivas.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1426210/header.jpg',
    genre: GameGenre.ADVENTURE,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/1426210/It_Takes_Two/',
    source: 'curated'
  },
  {
    title: 'Baldur\'s Gate 3',
    description: 'RPG épico por turnos ambientado en Dungeons & Dragons con cooperativo total de hasta 4 jugadores.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg',
    genre: GameGenre.RPG,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/1086940/Baldurs_Gate_3/',
    source: 'curated'
  },
  {
    title: 'Minecraft',
    description: 'El sandbox definitivo de construcción, exploración y supervivencia en mundos infinitos con amigos.',
    imageUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=800&auto=format&fit=crop',
    genre: GameGenre.SANDBOX,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://www.minecraft.net/',
    source: 'curated'
  },
  {
    title: 'Phasmophobia',
    description: 'Terror psicológico cooperativo para 4 jugadores donde investigas actividades paranormales con equipo de cazafantasmas.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg',
    genre: GameGenre.HORROR,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/739630/Phasmophobia/',
    source: 'curated'
  },
  {
    title: 'Deep Rock Galactic',
    description: 'FPS cooperativo de enanos espaciales mineros con entornos 100% destructibles y hordas alienígenas.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/548430/header.jpg',
    genre: GameGenre.SHOOTER,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/548430/Deep_Rock_Galactic/',
    source: 'curated'
  },
  {
    title: 'Palworld',
    description: 'Supervivencia y recolección de criaturas "Pals" en un inmenso mundo abierto multijugador.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg',
    genre: GameGenre.SURVIVAL,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/1623730/Palworld/',
    source: 'curated'
  },
  {
    title: 'Overcooked! All You Can Eat',
    description: 'Caos culinario cooperativo donde coordinas pedidos en cocinas disparatadas y desafiantes.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1243830/header.jpg',
    genre: GameGenre.CASUAL,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/1243830/Overcooked_All_You_Can_Eat/',
    source: 'curated'
  },
  {
    title: 'God of War Ragnarök',
    description: 'Kratos y Atreus deben viajar a cada uno de los Nueve Reinos en busca de respuestas mientras las fuerzas asgardianas se preparan para la batalla profetizada.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg',
    genre: GameGenre.ACTION,
    platforms: [Platform.PC, Platform.PS5],
    link: 'https://store.steampowered.com/app/2322010/God_of_War_Ragnark/',
    source: 'curated'
  },
  {
    title: 'God of War',
    description: 'Vengándose de los dioses del Olimpo, Kratos ahora vive en el reino de las deidades y los monstruos nórdicos junto a su hijo Atreus.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg',
    genre: GameGenre.ACTION,
    platforms: [Platform.PC, Platform.PS5],
    link: 'https://store.steampowered.com/app/1593500/God_of_War/',
    source: 'curated'
  },
  {
    title: 'Elden Ring',
    description: 'Obra maestra de RPG de acción en mundo abierto de FromSoftware con soporte cooperativo e invasiones.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg',
    genre: GameGenre.RPG,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/1245620/ELDEN_RING/',
    source: 'curated'
  },
  {
    title: 'Valheim',
    description: 'Brutal juego de supervivencia y exploración vikinga para 1 a 10 jugadores en un purgatorio generado por procedimientos.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/892970/header.jpg',
    genre: GameGenre.SURVIVAL,
    platforms: [Platform.PC, Platform.XBOX],
    link: 'https://store.steampowered.com/app/892970/Valheim/',
    source: 'curated'
  },
  {
    title: 'Sea of Thieves',
    description: 'La experiencia pirata definitiva: navega, saquea, explora islas y combate en navíos con tu tripulación.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172620/header.jpg',
    genre: GameGenre.ADVENTURE,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/1172620/Sea_of_Thieves_2024_Edition/',
    source: 'curated'
  },
  {
    title: 'Left 4 Dead 2',
    description: 'El clásico FPS cooperativo de zombis por excelencia de Valve donde 4 supervivientes luchan contra hordas de infectados.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/550/header.jpg',
    genre: GameGenre.SHOOTER,
    platforms: [Platform.PC],
    link: 'https://store.steampowered.com/app/550/Left_4_Dead_2/',
    source: 'curated'
  },
  {
    title: 'Portal 2',
    description: 'Innovador juego de acertijos con una brillante campaña cooperativa para 2 jugadores con pistolas de portales.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/header.jpg',
    genre: GameGenre.PUZZLE,
    platforms: [Platform.PC, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/620/Portal_2/',
    source: 'curated'
  },
  {
    title: 'Among Us',
    description: 'Juego social de deducción y traición para 4-15 jugadores en el espacio. Encuentra al impostor antes de que acabe con la nave.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg',
    genre: GameGenre.CASUAL,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/945360/Among_Us/',
    source: 'curated'
  },
  {
    title: 'Dead by Daylight',
    description: 'Multijugador asimétrico de terror 4 vs 1 donde un Asesino implacable caza a cuatro Supervivientes.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg',
    genre: GameGenre.HORROR,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/381210/Dead_by_Daylight/',
    source: 'curated'
  },
  {
    title: 'Monster Hunter: World',
    description: 'Caza bestias descomunales en ecosistemas vivos y fabrica armaduras legendarias con tu escuadrón.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg',
    genre: GameGenre.ACTION,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/582010/Monster_Hunter_World/',
    source: 'curated'
  },
  {
    title: 'Terraria',
    description: 'Aventura 2D de excavación, lucha, exploración y construcción con cientos de jefes y armamentos.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg',
    genre: GameGenre.SANDBOX,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/105600/Terraria/',
    source: 'curated'
  },
  {
    title: 'Rocket League',
    description: 'Fútbol frenético impulsado por coches propulsados por cohetes con partidas competitivas y cooperativas.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    genre: GameGenre.SPORTS,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://www.rocketleague.com/',
    source: 'curated'
  },
  {
    title: 'Counter-Strike 2',
    description: 'El referente táctico de disparos en primera persona 5v5 con jugabilidad competitiva de precisión milimétrica.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
    genre: GameGenre.SHOOTER,
    platforms: [Platform.PC],
    link: 'https://store.steampowered.com/app/730/CounterStrike_2/',
    source: 'curated'
  },
  {
    title: 'Apex Legends',
    description: 'Battle Royale gratuito basado en leyendas con habilidades extraordinarias que compiten por la gloria.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
    genre: GameGenre.SHOOTER,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/1172470/Apex_Legends/',
    source: 'curated'
  },
  {
    title: 'Content Warning',
    description: 'Graba a tus amigos haciendo cosas aterradoras en el Mundo Subterráneo para hacerte viral en SpookTube.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2881650/header.jpg',
    genre: GameGenre.HORROR,
    platforms: [Platform.PC],
    link: 'https://store.steampowered.com/app/2881650/Content_Warning/',
    source: 'curated'
  },
  {
    title: 'Project Zomboid',
    description: 'El RPG sandbox de supervivencia zombi definitivo. ¿Cómo vas a morir?',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg',
    genre: GameGenre.SURVIVAL,
    platforms: [Platform.PC],
    link: 'https://store.steampowered.com/app/108600/Project_Zomboid/',
    source: 'curated'
  },
  {
    title: 'Stardew Valley',
    description: 'Encantador simulador de granja y vida rural con modo multijugador cooperativo de hasta 8 personas.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg',
    genre: GameGenre.SIMULATION,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
    source: 'curated'
  },
  {
    title: 'Grand Theft Auto V',
    description: 'Explora Los Santos y vive atracos en equipo en el colosal mundo multijugador de GTA Online.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
    genre: GameGenre.ACTION,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/',
    source: 'curated'
  },
  {
    title: 'Rust',
    description: 'El único objetivo en Rust es sobrevivir. Supera el hambre, la sed, el frío y a otros jugadores hostiles.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg',
    genre: GameGenre.SURVIVAL,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX],
    link: 'https://store.steampowered.com/app/252490/Rust/',
    source: 'curated'
  },
  {
    title: 'PlateUp!',
    description: 'Cocina y sirve platos, diseña y automatiza tus restaurantes con roguelite cooperativo caótico.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599600/header.jpg',
    genre: GameGenre.STRATEGY,
    platforms: [Platform.PC, Platform.PS5, Platform.XBOX, Platform.SWITCH],
    link: 'https://store.steampowered.com/app/1599600/PlateUp/',
    source: 'curated'
  },
  {
    title: 'Party Animals',
    description: 'Pelea con o contra tus amigos como adorables cachorros, gatitos y otras criaturas peludas con físicas divertidas.',
    imageUrl: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1260320/header.jpg',
    genre: GameGenre.FIGHTING,
    platforms: [Platform.PC, Platform.XBOX],
    link: 'https://store.steampowered.com/app/1260320/Party_Animals/',
    source: 'curated'
  }
];

/**
 * Infiere el género del juego a partir del nombre o palabras clave si no está especificado.
 */
function inferGenre(name: string): GameGenre {
  const lower = name.toLowerCase();
  if (lower.includes('horror') || lower.includes('dead') || lower.includes('zombie') || lower.includes('resident') || lower.includes('dark')) {
    return GameGenre.HORROR;
  }
  if (lower.includes('shoot') || lower.includes('duty') || lower.includes('strike') || lower.includes('sniper') || lower.includes('halo') || lower.includes('warfare')) {
    return GameGenre.SHOOTER;
  }
  if (lower.includes('rpg') || lower.includes('fantasy') || lower.includes('dragon') || lower.includes('scrolls') || lower.includes('souls')) {
    return GameGenre.RPG;
  }
  if (lower.includes('surviv') || lower.includes('craft') || lower.includes('forest') || lower.includes('rust')) {
    return GameGenre.SURVIVAL;
  }
  if (lower.includes('race') || lower.includes('speed') || lower.includes('kart') || lower.includes('forza')) {
    return GameGenre.RACING;
  }
  if (lower.includes('puzzle') || lower.includes('portal')) {
    return GameGenre.PUZZLE;
  }
  if (lower.includes('sport') || lower.includes('fifa') || lower.includes('nba') || lower.includes('fc ')) {
    return GameGenre.SPORTS;
  }
  if (lower.includes('strategy') || lower.includes('age of') || lower.includes('civilization') || lower.includes('total war')) {
    return GameGenre.STRATEGY;
  }
  if (lower.includes('simulat') || lower.includes('farm') || lower.includes('tycoon')) {
    return GameGenre.SIMULATION;
  }
  return GameGenre.ACTION;
}

/**
 * Búsqueda de autocompletado en tiempo real:
 * 1. Filtra primero en el catálogo local de 0ms de latencia.
 * 2. Si la consulta tiene al menos 2 caracteres, busca en la API de Steam Store mediante proxy.
 * 3. Deduplica y combina los resultados.
 */
export async function searchGamesAutocomplete(query: string): Promise<GameSuggestion[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const normalizedQuery = cleanQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Coincidencias en base de datos local curada (soporte con o sin tildes/diacríticos)
  const localMatches = CURATED_GAMES.filter(g => {
    const title = g.title.toLowerCase();
    const desc = g.description.toLowerCase();
    const titleNorm = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const descNorm = desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return title.includes(cleanQuery) || 
           titleNorm.includes(normalizedQuery) ||
           desc.includes(cleanQuery) || 
           descNorm.includes(normalizedQuery);
  });

  // Si ya tenemos suficientes coincidencias exactas o el query es muy corto, devolvemos temprano
  if (cleanQuery.length < 2) {
    return localMatches.slice(0, 6);
  }

  // 2. Búsqueda remota en Steam Store Search (vía proxy Vite/Vercel)
  let steamMatches: GameSuggestion[] = [];
  try {
    const primaryUrl = `/api/steam-search?term=${encodeURIComponent(normalizedQuery)}&l=spanish&cc=US`;
    const response = await fetch(primaryUrl).catch(() => null);

    if (response && response.ok) {
      const data = await response.json().catch(() => null);
      const items = (data && Array.isArray(data.items)) ? data.items : [];

      steamMatches = items.map((item: any) => {
        const appId = item.id;
        // Carátula en alta definición de Steam (header 460x215)
        const headerUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
        const storeLink = `https://store.steampowered.com/app/${appId}/`;

        const platforms: Platform[] = [Platform.PC];
        return {
          title: item.name,
          description: `Juego disponible en Steam. Metascore: ${item.metascore || 'N/A'}.`,
          imageUrl: headerUrl,
          genre: inferGenre(item.name),
          platforms,
          link: storeLink,
          source: 'steam' as const
        };
      });
    }
  } catch (err) {
    // Si falla la red o Steam está inaccesible, nos apoyamos limpiamente en la base local
  }

  // 3. Combinar y deduplicar por título
  const seenTitles = new Set<string>();
  const combined: GameSuggestion[] = [];

  // Dar prioridad a las curadas (tienen mejor descripción y plataformas completas)
  for (const item of localMatches) {
    const key = item.title.toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      combined.push(item);
    }
  }

  // Agregar resultados de Steam
  for (const item of steamMatches) {
    const key = item.title.toLowerCase();
    if (!seenTitles.has(key)) {
      seenTitles.add(key);
      combined.push(item);
    }
  }

  return combined.slice(0, 8);
}
