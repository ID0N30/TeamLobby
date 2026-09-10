import { db } from '../firebaseConfig';
import { User, UserSummary, Friendship, FriendshipStatus } from '../types';

/**
 * Genera un código determinista único (TL-XXXX) a partir del UID del usuario.
 * Es 100% predecible, no genera colisiones consigo mismo y funciona sin depender de reglas en la nube.
 */
export const generateCodeFromUid = (uid: string): string => {
  if (!uid) return 'TL-1000';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash) + uid.charCodeAt(i);
    hash |= 0;
  }
  const codeNum = 1000 + (Math.abs(hash) % 9000);
  return `TL-${codeNum}`;
};

/**
 * Genera y asegura un Código de Jugador único (ej. TL-4821) para el usuario.
 */
export const ensurePlayerCode = async (user: User): Promise<string> => {
  if (!user || user.isGuest) return '';
  if (user.playerCode) return user.playerCode;

  // 1. Si el usuario ya tiene un código guardado en su perfil de users
  try {
    if (db) {
      const snap = await db.ref(`users/${user.id}/playerCode`).once('value');
      if (snap.exists() && snap.val()) {
        return snap.val();
      }
    }
  } catch (e) {
    // Si falla la lectura remota, procedemos con el cálculo determinista
  }

  // 2. Generar código basado en su UID para que siempre sea único y permanente
  const newCode = generateCodeFromUid(user.id);

  // 3. Guardar en users y userSummaries (rutas 100% permitidas por las reglas de producción)
  if (db && user.id) {
    try {
      await db.ref(`users/${user.id}/playerCode`).set(newCode);
      await db.ref(`userSummaries/${user.id}/playerCode`).set(newCode);
    } catch (err) {
      console.warn('[PlayerCode] Aviso al persistir código en perfil:', err);
    }

    // Intentar también en playerCodes como réplica si la regla está disponible
    try {
      await db.ref(`playerCodes/${newCode}`).set(user.id);
    } catch (err) {
      // Ignorar de forma segura si la ruta raíz playerCodes no está desplegada en Firebase Console
    }
  }

  return newCode;
};

/**
 * Busca a un usuario por su código de jugador exacto (ej. #TL-4821 o TL-4821).
 */
export const searchUserByPlayerCode = async (rawCode: string): Promise<UserSummary | null> => {
  if (!db) return null;
  const cleanCode = rawCode.trim().toUpperCase().replace(/^#/, '');
  if (!cleanCode) return null;

  try {
    // 1. Intentar por índice playerCodes si está habilitado
    try {
      const codeSnap = await db.ref(`playerCodes/${cleanCode}`).once('value');
      if (codeSnap.exists()) {
        const targetUserId = codeSnap.val();
        const userSnap = await db.ref(`userSummaries/${targetUserId}`).once('value');
        if (userSnap.exists()) return { id: targetUserId, ...userSnap.val(), playerCode: cleanCode };
      }
    } catch (e) {}

    // 2. Buscar en userSummaries (100% accesible en producción)
    const summariesSnap = await db.ref('userSummaries').once('value');
    if (summariesSnap.exists()) {
      const data = summariesSnap.val();
      for (const [id, val] of Object.entries<any>(data)) {
        if (val?.playerCode === cleanCode || generateCodeFromUid(id) === cleanCode) {
          return { 
            id, 
            ...val, 
            playerCode: val.playerCode || generateCodeFromUid(id) 
          };
        }
      }
    }

    // 3. Fallback a tabla users (100% accesible en producción)
    const fullUserSnap = await db.ref('users').once('value');
    if (fullUserSnap.exists()) {
      const data = fullUserSnap.val();
      for (const [id, u] of Object.entries<any>(data)) {
        if (u?.playerCode === cleanCode || generateCodeFromUid(id) === cleanCode) {
          return {
            id,
            alias: u.alias || u.nickname || 'Gamer',
            nickname: u.nickname,
            avatarUrl: u.avatarUrl,
            playerCode: u.playerCode || generateCodeFromUid(id)
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error searching user by player code:', error);
    return null;
  }
};

/**
 * Helper para asegurar que ningún campo enviado a Firebase sea undefined
 */
const sanitizeFriendData = (record: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(record)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
};

/**
 * Envía una solicitud de amistad a otro jugador.
 * Es tolerante a fallos de reglas en la nube y previene cualquier campo undefined.
 */
export const sendFriendRequest = async (currentUser: User, targetUser: UserSummary | User): Promise<void> => {
  if (!db || currentUser.isGuest || !currentUser.id || !targetUser?.id || currentUser.id === targetUser.id) return;

  const timestamp = Date.now();
  const currentCode = currentUser.playerCode || generateCodeFromUid(currentUser.id);
  const targetCode = targetUser.playerCode || generateCodeFromUid(targetUser.id);

  const targetAlias = (targetUser as any).nickname || targetUser.alias || 'Gamer';
  const targetAvatar = targetUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.id}`;

  const currentAlias = currentUser.nickname || currentUser.alias || 'Gamer';
  const currentAvatar = currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`;

  const senderRecord = sanitizeFriendData({
    friendId: targetUser.id,
    alias: targetAlias,
    avatarUrl: targetAvatar,
    playerCode: targetCode,
    status: 'pending_sent' as FriendshipStatus,
    createdAt: timestamp
  });

  const recipientRecord = sanitizeFriendData({
    friendId: currentUser.id,
    alias: currentAlias,
    avatarUrl: currentAvatar,
    playerCode: currentCode,
    status: 'pending_received' as FriendshipStatus,
    createdAt: timestamp
  });

  // 1. Guardar para el remitente en friends/ y en users/ (su propia cuenta, 100% permitida)
  let senderSaved = false;
  try {
    await db.ref(`friends/${currentUser.id}/${targetUser.id}`).set(senderRecord);
    senderSaved = true;
  } catch (err) {
    console.warn('[friendService] Aviso al escribir en friends del remitente:', err);
  }

  try {
    await db.ref(`users/${currentUser.id}/friends/${targetUser.id}`).set(senderRecord);
    senderSaved = true;
  } catch (err) {
    console.warn('[friendService] Aviso al escribir en users/friends del remitente:', err);
  }

  // 2. Intentar guardar en la cuenta del destinatario en friends/
  try {
    await db.ref(`friends/${targetUser.id}/${currentUser.id}`).set(recipientRecord);
  } catch (err) {
    console.warn('[friendService] Destinatario no actualizado directamente en friends (comprobar reglas Firebase Console):', err);
  }

  if (!senderSaved) {
    throw new Error('No se pudo persistir la solicitud de amistad en la base de datos.');
  }
};

/**
 * Acepta una solicitud de amistad recibida.
 */
export const acceptFriendRequest = async (currentUserId: string, friendId: string): Promise<void> => {
  if (!db || !currentUserId || !friendId) return;

  try {
    await db.ref(`friends/${currentUserId}/${friendId}/status`).set('accepted');
  } catch (e) {
    console.warn('[friendService] Error actualizando status en friends del usuario:', e);
  }

  try {
    await db.ref(`users/${currentUserId}/friends/${friendId}/status`).set('accepted');
  } catch (e) {}

  try {
    await db.ref(`friends/${friendId}/${currentUserId}/status`).set('accepted');
  } catch (e) {
    console.warn('[friendService] Aviso actualizando status en friends del amigo:', e);
  }

  try {
    await db.ref(`users/${friendId}/friends/${currentUserId}/status`).set('accepted');
  } catch (e) {}
};

/**
 * Rechaza o cancela una solicitud de amistad, o elimina a un amigo existente.
 */
export const removeFriend = async (currentUserId: string, friendId: string): Promise<void> => {
  if (!db || !currentUserId || !friendId) return;

  try {
    await db.ref(`friends/${currentUserId}/${friendId}`).remove();
  } catch (e) {}

  try {
    await db.ref(`users/${currentUserId}/friends/${friendId}`).remove();
  } catch (e) {}

  try {
    await db.ref(`friends/${friendId}/${currentUserId}`).remove();
  } catch (e) {}

  try {
    await db.ref(`users/${friendId}/friends/${currentUserId}`).remove();
  } catch (e) {}
};

/**
 * Comprueba si dos usuarios son amigos aceptados.
 */
export const checkAreFriends = async (userId1: string, userId2: string): Promise<boolean> => {
  if (!db || !userId1 || !userId2 || userId1 === userId2) return false;
  try {
    const snap = await db.ref(`friends/${userId1}/${userId2}/status`).once('value');
    if (snap.exists() && snap.val() === 'accepted') return true;
  } catch {}

  try {
    const uSnap = await db.ref(`users/${userId1}/friends/${userId2}/status`).once('value');
    if (uSnap.exists() && uSnap.val() === 'accepted') return true;
  } catch {}

  try {
    const tSnap = await db.ref(`users/${userId2}/friends/${userId1}/status`).once('value');
    if (tSnap.exists() && tSnap.val() === 'accepted') return true;
  } catch {}

  return false;
};

/**
 * Suscribe a la lista de amistades y solicitudes en tiempo real.
 */
export const subscribeToFriends = (userId: string, callback: (friends: Friendship[]) => void): (() => void) => {
  if (!db || !userId) return () => {};

  let offUsersListener: (() => void) | null = null;

  const ref = db.ref(`friends/${userId}`);
  const listener = ref.on('value', (snap) => {
    if (snap.exists()) {
      const val = snap.val();
      const list: Friendship[] = Object.keys(val).map(friendId => ({
        friendId,
        ...val[friendId]
      }));
      callback(list);
    } else {
      // Fallback si friends/$uid está vacío o en users/
      const uRef = db?.ref(`users/${userId}/friends`);
      if (uRef) {
        uRef.once('value', (uSnap) => {
          if (uSnap.exists()) {
            const val = uSnap.val();
            const list: Friendship[] = Object.keys(val).map(friendId => ({
              friendId,
              ...val[friendId]
            }));
            callback(list);
          } else {
            callback([]);
          }
        });
      } else {
        callback([]);
      }
    }
  }, (err) => {
    console.warn('[friendService] Permiso denegado en friends/ escuchando users/friends como fallback:', err);
    // Fallback a users/$uid/friends
    const uRef = db?.ref(`users/${userId}/friends`);
    if (uRef) {
      const uListener = uRef.on('value', (uSnap) => {
        if (uSnap.exists()) {
          const val = uSnap.val();
          const list: Friendship[] = Object.keys(val).map(friendId => ({
            friendId,
            ...val[friendId]
          }));
          callback(list);
        } else {
          callback([]);
        }
      });
      offUsersListener = () => uRef.off('value', uListener);
    }
  });

  return () => {
    ref.off('value', listener);
    if (offUsersListener) offUsersListener();
  };
};
