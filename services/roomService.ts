
import { db } from "../firebaseConfig";
import { Room, Game, User, UserSummary, Message, RoomSummary, Comment, ReadySession } from "../types";

const ROOMS_REF = "rooms";
const USERS_REF = "users";
const USER_SUMMARIES_REF = "userSummaries";
const USERS_PAGE_SIZE = 50;
const SETTINGS_REF = "settings";

/**
 * Elimina cualquier valor undefined del objeto para prevenir excepciones fatales
 * de Firebase Realtime Database ("value argument contains undefined").
 */
export const cleanForFirebase = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

// --- CONFIGURACIÓN GLOBAL ---
export const subscribeToSettings = (callback: (settings: any) => void) => {
    if (!db) return () => {};
    const ref = db.ref(SETTINGS_REF);
    const listener = ref.on('value', (snap) => {
        callback(snap.val() || { communityHubCode: "UC2PI" });
    }, (err) => {
        console.warn('[Settings] Error escuchando settings:', err?.message || err);
        callback({ communityHubCode: "UC2PI" });
    });
    return () => ref.off('value', listener);
};

export const updateSettings = async (settings: any) => {
    if (!db) return;
    await db.ref(SETTINGS_REF).update(cleanForFirebase(settings));
};

// --- GESTIÓN DE SALA ---
export const cleanupRoomMembers = async (code: string) => {
    if (!db) return;
    const [membersSnap, presenceSnap] = await Promise.all([
        db.ref(`${ROOMS_REF}/${code}/members`).once('value'),
        db.ref(`${ROOMS_REF}/${code}/activePresence`).once('value')
    ]);
    if (!membersSnap.exists()) return;
    const data = membersSnap.val();
    const presence = presenceSnap.val() || {};
    const updates: any = {};
    let hasChanges = false;
    Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (!value || typeof value !== 'object' || !value.id || key !== value.id) {
            updates[key] = null;
            hasChanges = true;
        } else if (value.isGuest && !presence[key]) {
            updates[key] = null;
            hasChanges = true;
        }
    });
    if (hasChanges) await db.ref(`${ROOMS_REF}/${code}/members`).update(updates);
};

export const getActiveGuestCount = async (code: string): Promise<number> => {
    if (!db) return 0;
    const [membersSnap, presenceSnap] = await Promise.all([
        db.ref(`${ROOMS_REF}/${code}/members`).once("value"),
        db.ref(`${ROOMS_REF}/${code}/activePresence`).once("value")
    ]);
    if (!membersSnap.exists()) return 0;

    const members = Object.values(membersSnap.val()) as any[];
    const presence = presenceSnap.val() || {};
    return members.filter((m) => m.isGuest === true && presence[m.id] === true).length;
};

export const createRoom = async (host: User, roomName: string, password?: string): Promise<string> => {
    if (!db) throw new Error("Database not initialized");
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = db.ref(`${ROOMS_REF}/${code}`);
    const hostData = cleanForFirebase({ 
        ...host, 
        nickname: host.nickname || host.alias || "Gamer", 
        isReady: false, 
        isOnline: true 
    });
    const newRoom: any = cleanForFirebase({
        code, 
        name: roomName || `Room ${code}`, 
        isPrivate: !!password, 
        password: password || "", 
        hostId: host.id,
        members: { [host.id]: hostData }, 
        gameQueue: {}, 
        createdAt: Date.now(),
        chatHistory: { 
            'init': { 
                id: 'init', 
                userId: 'system', 
                userName: 'System', 
                content: `Room created by ${hostData.nickname || 'Host'}.`, 
                timestamp: Date.now(), 
                isSystem: true 
            } 
        },
        readySession: { type: 'roulette', status: 'idle', suggestions: {}, votes: {}, active: false },
        activePresence: { [host.id]: true }
    });
    await roomRef.set(newRoom);
    return code;
};

export const joinRoom = async (
    code: string, 
    user: User, 
    passwordAttempt?: string,
    isCommunityHub: boolean = false
): Promise<{success: boolean, message?: string}> => {
    if (!db) throw new Error("Database not initialized");
    const normalizedCode = (code || "").trim().toUpperCase();
    const roomRef = db.ref(`${ROOMS_REF}/${normalizedCode}`);
    let snapshot = await roomRef.once('value');

    // Auto-inicializar Community Lobby si no existe en la base de datos
    if (!snapshot.exists() && (normalizedCode === "UC2PI" || isCommunityHub)) {
        const hostData = cleanForFirebase({ 
            ...user, 
            nickname: user.nickname || user.alias || "Gamer", 
            isReady: false, 
            isOnline: true 
        });
        const communityRoom: any = cleanForFirebase({
            code: normalizedCode,
            name: "Community Lobby",
            isPrivate: false,
            password: "",
            hostId: user.id,
            members: { [user.id]: hostData },
            gameQueue: {},
            createdAt: Date.now(),
            chatHistory: { 
                'init': { 
                    id: 'init', 
                    userId: 'system', 
                    userName: 'System', 
                    content: '¡Bienvenidos al Community Lobby de TeamLobby!', 
                    timestamp: Date.now(), 
                    isSystem: true 
                } 
            },
            readySession: { type: 'roulette', status: 'idle', suggestions: {}, votes: {}, active: false },
            activePresence: { [user.id]: true }
        });
        await roomRef.set(communityRoom);
        snapshot = await roomRef.once('value');
    }

    if (!snapshot.exists()) return { success: false, message: "Room not found" };
    const roomData = snapshot.val();
    if (roomData.isPrivate && roomData.hostId !== user.id && roomData.password !== passwordAttempt) {
        return { success: false, message: "Invalid Password" };
    }
    const userDataToStore = cleanForFirebase({ 
        ...user, 
        nickname: user.nickname || user.alias || "Gamer", 
        isReady: false, 
        isOnline: true 
    });

    try {
        await cleanupRoomMembers(normalizedCode);
    } catch (e) {
        console.warn('[Room] Error limpiando miembros:', e);
    }

    await db.ref(`${ROOMS_REF}/${normalizedCode}/members/${user.id}`).set(userDataToStore); 
    return { success: true };
};

export const subscribeToRoom = (code: string, callback: (room: Room) => void) => {
    if (!db) return () => {};
    const normalizedCode = (code || "").trim().toUpperCase();
    const roomRef = db.ref(`${ROOMS_REF}/${normalizedCode}`);
    const listener = roomRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const parseCollection = (obj: any) => {
                if (!obj) return [];
                const items = Array.isArray(obj) ? obj : Object.values(obj);
                return items.filter(i => i && typeof i === 'object');
            };
            callback({ ...data, 
                members: parseCollection(data.members), 
                gameQueue: parseCollection(data.gameQueue), 
                chatHistory: parseCollection(data.chatHistory),
                activePresence: data.activePresence || {}
            });
        } else {
            // @ts-ignore
            callback(null);
        }
    }, (err) => {
        console.warn(`[Room] Error escuchando sala ${normalizedCode}:`, err?.message || err);
    });
    return () => roomRef.off('value', listener);
};

export const toggleUserReadyState = async (code: string, userId: string, forcedValue?: boolean) => {
    if (!db) return;
    const memberReadyRef = db.ref(`${ROOMS_REF}/${code}/members/${userId}/isReady`);
    if (forcedValue !== undefined) {
        await memberReadyRef.set(forcedValue);
    } else {
        const snap = await memberReadyRef.once('value');
        await memberReadyRef.set(!(snap.val() || false));
    }
};

// --- READY SESSION ACTIONS ---

export const startReadyActivity = async (code: string, type: 'roulette' | 'voting') => {
    if (!db) return;
    await db.ref(`${ROOMS_REF}/${code}/readySession`).set({
        type, status: 'collecting', suggestions: {}, votes: {}, active: true
    });
};

export const submitReadySuggestion = async (code: string, userId: string, userName: string, gameId: string, gameTitle: string) => {
    if (!db) return;
    await toggleUserReadyState(code, userId, true);
    await db.ref(`${ROOMS_REF}/${code}/readySession/suggestions/${userId}`).set({
        gameId, gameTitle, userName
    });
};

export const setReadyStatus = async (code: string, status: ReadySession['status']) => {
    if (!db) return;
    await db.ref(`${ROOMS_REF}/${code}/readySession/status`).set(status);
};

export const submitReadyVote = async (code: string, voterId: string, gameId: string) => {
    if (!db) return;
    await db.ref(`${ROOMS_REF}/${code}/readySession/votes/${voterId}`).set(gameId);
};

export const resolveReadyActivity = async (code: string) => {
    if (!db) return;
    const ref = db.ref(`${ROOMS_REF}/${code}/readySession`);
    const snap = await ref.once('value');
    if (!snap.exists()) return;
    const session = snap.val() as ReadySession;
    
    const suggestionsMap = session.suggestions || {};
    const votesMap = session.votes || {};
    const suggestions = Object.values(suggestionsMap);
    
    if (suggestions.length === 0) {
        await ref.update({ status: 'idle', active: false });
        return;
    }

    if (session.type === 'roulette') {
        const winner = suggestions[Math.floor(Math.random() * suggestions.length)];
        await ref.update({ status: 'results', winner: winner.gameId });
    } else {
        const counts: Record<string, number> = {};
        suggestions.forEach(s => counts[s.gameId] = 0);
        Object.values(votesMap).forEach(gameId => {
            counts[gameId] = (counts[gameId] || 0) + 1;
        });
        
        let max = 0;
        Object.values(counts).forEach(c => { if (c > max) max = c; });
        
        const winnerIds = Array.from(new Set(
            suggestions
                .filter(s => counts[s.gameId] === max)
                .map(s => s.gameId)
        ));
        
        await ref.update({ 
            status: 'results', 
            winner: winnerIds.length === 1 ? winnerIds[0] : winnerIds 
        });
    }
};

export const resetReadyActivity = async (code: string) => {
    if (!db) return;
    await db.ref(`${ROOMS_REF}/${code}/readySession`).update({
        status: 'idle', active: false, suggestions: {}, votes: {}, winner: null
    });
};

// --- GESTIÓN DE JUEGOS ---
export const addGameToRoom = async (code: string, game: Game, user: User) => {
    if (!db || user.isGuest || user.id.startsWith('guest_')) {
        console.warn('[Room] Acción denegada: los usuarios invitados no pueden proponer juegos.');
        return;
    }
    const gameId = game.id || `game-${Date.now()}`;
    const gameWithMeta: Game = { ...game, id: gameId, proposedBy: user.id, status: 'approved', votedBy: { [user.id]: true } };
    await db.ref(`${ROOMS_REF}/${code}/gameQueue/${gameId}`).set(cleanForFirebase(gameWithMeta));
};

export const voteForGame = async (code: string, gameId: string, userId: string, isGuest: boolean = false) => {
    if (!db || isGuest || !userId || userId.startsWith('guest_')) {
        console.warn('[Room] Acción denegada: los usuarios invitados no pueden votar propuestas.');
        return;
    }
    const votesRef = db.ref(`${ROOMS_REF}/${code}/gameQueue/${gameId}/votedBy`);
    const snap = await votesRef.once('value');
    const existing = snap.val() || {};
    const votes: Record<string, boolean> = Array.isArray(existing)
        ? Object.fromEntries(existing.map((id: string) => [id, true]))
        : existing;

    if (votes[userId]) delete votes[userId];
    else votes[userId] = true;

    await votesRef.set(votes);
};

export const sendChatMessage = async (code: string, message: Message, isGuest: boolean = false) => {
    if (!db || isGuest || message.userId.startsWith('guest_')) {
        console.warn('[Room] Acción denegada: los invitados no pueden enviar mensajes al chat.');
        return;
    }
    await db.ref(`${ROOMS_REF}/${code}/chatHistory/${message.id}`).set(cleanForFirebase(message));
};

export const setupRoomPresence = (code: string, user: User) => {
    if (!db) return () => {};
    const connectedRef = db.ref(".info/connected");
    const memberRef = db.ref(`${ROOMS_REF}/${code}/members/${user.id}`);
    const presenceRef = db.ref(`${ROOMS_REF}/${code}/activePresence/${user.id}`);
    const suggestionsRef = db.ref(`${ROOMS_REF}/${code}/readySession/suggestions/${user.id}`);
    const votesRef = db.ref(`${ROOMS_REF}/${code}/readySession/votes/${user.id}`);

    const handleConnected = (snap: any) => {
        if (snap.val() === true) {
            presenceRef.onDisconnect().remove().catch(() => {});

            if (user.isGuest) {
                memberRef.onDisconnect().remove().catch(() => {});
                suggestionsRef.onDisconnect().remove().catch(() => {});
                votesRef.onDisconnect().remove().catch(() => {});
                memberRef.update({ isOnline: true }).catch(() => {});
            } else {
                memberRef.onDisconnect().update({ isOnline: false, isReady: false }).catch(() => {});
                memberRef.update({ isOnline: true }).catch(() => {});
            }

            presenceRef.set(true).catch(() => {});
        }
    };

    connectedRef.on('value', handleConnected, (err: any) => {
        console.warn('[Presence] Error en .info/connected:', err?.message || err);
    });

    return () => {
        connectedRef.off('value', handleConnected);
    };
};

export const leaveRoomCleanly = async (code: string, user: User | string) => {
    if (!db) return;
    const userId = typeof user === 'string' ? user : user.id;
    const isGuest = typeof user === 'string' ? false : (user.isGuest ?? false);

    const memberRef = db.ref(`${ROOMS_REF}/${code}/members/${userId}`);
    const presenceRef = db.ref(`${ROOMS_REF}/${code}/activePresence/${userId}`);
    const suggestionsRef = db.ref(`${ROOMS_REF}/${code}/readySession/suggestions/${userId}`);
    const votesRef = db.ref(`${ROOMS_REF}/${code}/readySession/votes/${userId}`);

    try {
        await presenceRef.onDisconnect().cancel();
        await memberRef.onDisconnect().cancel();
        await suggestionsRef.onDisconnect().cancel();
        await votesRef.onDisconnect().cancel();
    } catch (e) {
        // Silencioso si no había handlers pendientes
    }

    await presenceRef.remove().catch(() => {});

    if (isGuest) {
        await memberRef.remove().catch(() => {});
        await suggestionsRef.remove().catch(() => {});
        await votesRef.remove().catch(() => {});
    } else {
        await memberRef.update({ isOnline: false, isReady: false }).catch(() => {});
    }
};

export const deleteRoom = async (code: string) => { if (db) await db.ref(`${ROOMS_REF}/${code}`).remove(); };
export const updateUserProfile = async (userId: string, data: Partial<User>) => { if (db) await db.ref(`${USERS_REF}/${userId}`).update(cleanForFirebase(data)); };
export const subscribeToUserProfile = (userId: string, callback: (user: Partial<User>) => void) => { if (!db) return () => {}; const ref = db.ref(`${USERS_REF}/${userId}`); const listener = ref.on('value', snap => { if (snap.exists()) callback(snap.val()); }); return () => ref.off('value', listener); };
export const updateGameInRoom = async (code: string, gameId: string, data: Partial<Game>, userId?: string) => { if (!db || (userId && userId.startsWith('guest_'))) return; await db.ref(`${ROOMS_REF}/${code}/gameQueue/${gameId}`).update(cleanForFirebase(data)); };
export const addCommentToGame = async (roomCode: string, gameId: string, comment: Comment, isGuest: boolean = false) => { if (!db || isGuest || comment.userId.startsWith('guest_')) return; await db.ref(`${ROOMS_REF}/${roomCode}/gameQueue/${gameId}/comments/${comment.id}`).set(cleanForFirebase(comment)); };
export const removeGameFromRoom = async (code: string, gameId: string, userId: string, isAdmin: boolean) => { if (!db || userId.startsWith('guest_')) return; const ref = db.ref(`${ROOMS_REF}/${code}/gameQueue/${gameId}`); const snap = await ref.once('value'); if (snap.exists() && (isAdmin || snap.val().proposedBy === userId)) await ref.remove(); };
export const getAllRooms = async (): Promise<Room[]> => { if (!db) return []; const snap = await db.ref(ROOMS_REF).once('value'); if (!snap.exists()) return []; return Object.values(snap.val()).map((r: any) => ({ ...r, members: Object.values(r.members || {}), gameQueue: Object.values(r.gameQueue || {}), chatHistory: Object.values(r.chatHistory || {}) })); };
export const toggleBanUser = async (userId: string, isBanned: boolean) => {
    if (!db) return;
    await db.ref().update({
        [`${USERS_REF}/${userId}/isBanned`]: isBanned,
        [`${USER_SUMMARIES_REF}/${userId}/isBanned`]: isBanned,
    });
};

export const toggleMuteUser = async (userId: string, isMuted: boolean) => {
    if (!db) return;
    await db.ref().update({
        [`${USERS_REF}/${userId}/isMuted`]: isMuted,
        [`${USER_SUMMARIES_REF}/${userId}/isMuted`]: isMuted,
    });
};
export const subscribeToAllUsers = (
    callback: (users: UserSummary[]) => void,
    limitCount: number = USERS_PAGE_SIZE
) => {
    if (!db) return () => {};

    const ref = db
        .ref(USER_SUMMARIES_REF)
        .orderByKey()
        .limitToFirst(limitCount);

    const listener = ref.on("value", (snap) => {
        if (!snap.exists()) {
            callback([]);
            return;
        }

        const data = snap.val();
        const users: UserSummary[] = Object.entries(data)
            .map(([id, val]: [string, any]) => ({
                id,
                alias: val.alias || "Unknown",
                nickname: val.nickname,
                avatarUrl: val.avatarUrl || "",
                isAdmin: val.isAdmin || false,
                isBanned: val.isBanned || false,
                isMuted: val.isMuted || false,
            }))
            .filter((u) => u.alias && u.avatarUrl);

        callback(users);
    });

    return () => ref.off("value", listener);
};

export const getUsersPage = async (
    afterKey: string | null,
    limitCount: number = USERS_PAGE_SIZE
): Promise<{ users: UserSummary[]; lastKey: string | null }> => {
    if (!db) return { users: [], lastKey: null };

    let query = db
        .ref(USER_SUMMARIES_REF)
        .orderByKey()
        .limitToFirst(limitCount + 1);

    if (afterKey) {
        query = db
            .ref(USER_SUMMARIES_REF)
            .orderByKey()
            .startAfter(afterKey)
            .limitToFirst(limitCount + 1);
    }

    const snap = await query.once("value");
    if (!snap.exists()) return { users: [], lastKey: null };

    const entries = Object.entries(snap.val());
    const hasMore = entries.length > limitCount;
    const pageEntries = hasMore ? entries.slice(0, limitCount) : entries;

    const users: UserSummary[] = pageEntries.map(([id, val]: [string, any]) => ({
        id,
        alias: val.alias || "Unknown",
        nickname: val.nickname,
        avatarUrl: val.avatarUrl || "",
        isAdmin: val.isAdmin || false,
        isBanned: val.isBanned || false,
        isMuted: val.isMuted || false,
    }));

    const lastKey = hasMore ? (pageEntries[pageEntries.length - 1][0] as string) : null;

    return { users, lastKey };
};
export const getUserRooms = async (userId: string): Promise<RoomSummary[]> => { if (!db || !userId) return []; const snap = await db.ref(`${USERS_REF}/${userId}/visitedRooms`).once('value'); if (!snap.exists()) return []; const data = snap.val(); return Object.values(data) as RoomSummary[]; };

export const getFeaturedRooms = async (limit: number = 4): Promise<Room[]> => {
    if (!db) return [];
    const snap = await db.ref(ROOMS_REF).limitToLast(20).once('value');
    if (!snap.exists()) return [];
    const rooms = Object.values(snap.val()).map((r: any) => {
        const members = Object.values(r.members || {});
        const gameQueue = Object.values(r.gameQueue || {});
        return {
            ...r,
            members,
            gameQueue,
            chatHistory: Object.values(r.chatHistory || {}),
            popularityScore: (members.length * 5) + (gameQueue.length * 2)
        };
    }) as Room[];
    
    return rooms
        .sort((a, b) => ((b as any).popularityScore || 0) - ((a as any).popularityScore || 0))
        .slice(0, limit);
};
