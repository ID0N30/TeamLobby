import { db } from '../firebaseConfig';
import { ShowcaseGame, ShowcaseComment, ShowcasePrivacy, User } from '../types';

/**
 * Elimina cualquier valor undefined del objeto para prevenir errores de Firebase Realtime Database.
 */
export const cleanForFirebase = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Añade un juego a la Galería Gamer del usuario.
 * Escribe en `users/${userId}/showcase/games`, compatible 100% con las reglas
 * existentes en Firebase Realtime Database (`users/$uid`).
 */
export const addGameToShowcase = async (
  userId: string, 
  gameData: Omit<ShowcaseGame, 'id'>
): Promise<string> => {
  if (!db || !userId) throw new Error('Database not initialized or invalid user');

  const id = db.ref().push().key!;
  
  const entry: ShowcaseGame = {
    ...gameData,
    id,
    completedAt: gameData.completedAt || Date.now()
  };

  const cleanEntry = cleanForFirebase(entry);

  await db.ref(`users/${userId}/showcase/games/${id}`).set(cleanEntry);

  return id;
};

/**
 * Actualiza un juego existente en la Galería.
 */
export const updateShowcaseGame = async (
  userId: string, 
  gameId: string, 
  gameData: Partial<ShowcaseGame>
): Promise<void> => {
  if (!db || !userId || !gameId) return;
  const cleanData = cleanForFirebase(gameData);
  await db.ref(`users/${userId}/showcase/games/${gameId}`).update(cleanData);
};

/**
 * Elimina un juego de la Galería.
 */
export const deleteShowcaseGame = async (userId: string, gameId: string): Promise<void> => {
  if (!db || !userId || !gameId) return;
  await db.ref(`users/${userId}/showcase/games/${gameId}`).remove();
};

/**
 * Suscribe a la colección de juegos de la Galería de un usuario en tiempo real.
 * Escucha con manejadores de error explícitos para prevenir excepciones no controladas de Firebase.
 */
export const subscribeToUserShowcase = (
  userId: string, 
  callback: (games: ShowcaseGame[]) => void
): (() => void) => {
  if (!db || !userId) return () => {};

  let isMounted = true;
  const parseGames = (val: any): ShowcaseGame[] => {
    if (!val || typeof val !== 'object') return [];
    return Object.keys(val).map(key => ({
      id: key,
      ...val[key]
    })).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  };

  const usersRef = db.ref(`users/${userId}/showcase/games`);

  const usersListener = usersRef.on('value', (snap) => {
    if (!isMounted) return;
    if (snap.exists()) {
      callback(parseGames(snap.val()));
    } else {
      callback([]);
    }
  }, (err) => {
    console.warn('[Showcase] Aviso al escuchar users showcase:', err?.message || err);
    if (isMounted) callback([]);
  });

  return () => {
    isMounted = false;
    usersRef.off('value', usersListener);
  };
};

/**
 * Obtiene la configuración de privacidad de la vitrina de un usuario.
 */
export const getUserShowcasePrivacy = async (userId: string): Promise<ShowcasePrivacy> => {
  if (!db || !userId) return 'public';
  try {
    const snap = await db.ref(`users/${userId}/showcasePrivacy`).once('value');
    return snap.exists() ? (snap.val() as ShowcasePrivacy) : 'public';
  } catch {
    return 'public';
  }
};

/**
 * Actualiza la preferencia de privacidad de la vitrina del usuario.
 */
export const updateShowcasePrivacy = async (userId: string, privacy: ShowcasePrivacy): Promise<void> => {
  if (!db || !userId) return;
  try {
    await db.ref(`users/${userId}/showcasePrivacy`).set(privacy);
  } catch (err) {
    console.warn('[Showcase] Error guardando privacidad:', err);
  }
};

/**
 * Agrega un comentario en un juego de la Galería.
 */
export const addShowcaseComment = async (
  ownerId: string, 
  gameId: string, 
  user: User, 
  text: string
): Promise<void> => {
  if (!db || !ownerId || !gameId || !text.trim() || user.isGuest) return;

  const commentId = db.ref().push().key!;
  const comment: ShowcaseComment = {
    id: commentId,
    userId: user.id,
    userName: user.nickname || user.alias,
    userAvatar: user.avatarUrl,
    text: text.trim(),
    timestamp: Date.now()
  };

  await db.ref(`users/${ownerId}/showcase/games/${gameId}/comments/${commentId}`).set(cleanForFirebase(comment));
};

/**
 * Elimina un comentario de la galería (por el autor o por el dueño de la galería).
 */
export const deleteShowcaseComment = async (
  ownerId: string, 
  gameId: string, 
  commentId: string
): Promise<void> => {
  if (!db || !ownerId || !gameId || !commentId) return;
  try {
    await db.ref(`users/${ownerId}/showcase/games/${gameId}/comments/${commentId}`).remove();
  } catch (err) {
    console.warn('[Showcase] Error eliminando comentario:', err);
  }
};
