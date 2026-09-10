import { db } from '../firebaseConfig';
import { GamerChallenge, User } from '../types';

/**
 * Crea y envía un Reto Gamer a un amigo.
 */
export const createChallenge = async (
  fromUser: User,
  toUserId: string,
  toUserName: string,
  gameTitle: string,
  gameImageUrl: string,
  challengeGoal: string
): Promise<string> => {
  if (!db || fromUser.isGuest) throw new Error('Action not allowed');

  const ref = db.ref('challenges').push();
  const challengeId = ref.key!;
  const timestamp = Date.now();

  const challenge: GamerChallenge = {
    id: challengeId,
    fromUserId: fromUser.id,
    fromUserName: fromUser.nickname || fromUser.alias,
    fromUserAvatar: fromUser.avatarUrl,
    toUserId,
    toUserName,
    gameTitle,
    gameImageUrl,
    challengeGoal: challengeGoal.trim(),
    status: 'pending',
    createdAt: timestamp
  };

  const updates: Record<string, any> = {};
  updates[`challenges/${challengeId}`] = challenge;
  updates[`userChallengesReceived/${toUserId}/${challengeId}`] = true;
  updates[`userChallengesSent/${fromUser.id}/${challengeId}`] = true;

  await db.ref().update(updates);
  return challengeId;
};

/**
 * Actualiza el estado de un reto (aceptar, completar o rechazar).
 */
export const updateChallengeStatus = async (
  challengeId: string,
  status: 'accepted' | 'completed' | 'declined'
): Promise<void> => {
  if (!db || !challengeId) return;

  const updates: Record<string, any> = {
    [`challenges/${challengeId}/status`]: status
  };

  if (status === 'completed') {
    updates[`challenges/${challengeId}/completedAt`] = Date.now();
  }

  await db.ref().update(updates);
};

/**
 * Suscribe a los retos recibidos por el usuario en tiempo real.
 */
export const subscribeToReceivedChallenges = (
  userId: string,
  callback: (challenges: GamerChallenge[]) => void
): (() => void) => {
  if (!db || !userId) return () => {};

  const indexRef = db.ref(`userChallengesReceived/${userId}`);
  const listener = indexRef.on('value', async (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    const ids = Object.keys(snap.val());
    const promises = ids.map(id => db!.ref(`challenges/${id}`).once('value'));
    const snaps = await Promise.all(promises);

    const challenges: GamerChallenge[] = snaps
      .filter(s => s.exists())
      .map(s => s.val() as GamerChallenge)
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(challenges);
  });

  return () => indexRef.off('value', listener);
};

/**
 * Suscribe a los retos enviados por el usuario en tiempo real.
 */
export const subscribeToSentChallenges = (
  userId: string,
  callback: (challenges: GamerChallenge[]) => void
): (() => void) => {
  if (!db || !userId) return () => {};

  const indexRef = db.ref(`userChallengesSent/${userId}`);
  const listener = indexRef.on('value', async (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    const ids = Object.keys(snap.val());
    const promises = ids.map(id => db!.ref(`challenges/${id}`).once('value'));
    const snaps = await Promise.all(promises);

    const challenges: GamerChallenge[] = snaps
      .filter(s => s.exists())
      .map(s => s.val() as GamerChallenge)
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(challenges);
  });

  return () => indexRef.off('value', listener);
};
