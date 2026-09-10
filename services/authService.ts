
import { auth, googleProvider, db } from "../firebaseConfig";
import { User, Platform } from "../types";
import { generateCodeFromUid } from "./friendService";


export const onAuthStateChange = (callback: (user: User | null) => void) => {
    if (!auth) return () => {};
    return auth.onAuthStateChanged(async (firebaseUser) => {
        if (!firebaseUser) {
            callback(null);
            return;
        }

        const uid = firebaseUser.uid;

        let isAdmin = false;
        const adminSnap = await db?.ref(`admins/${uid}`).once("value");
        isAdmin = adminSnap?.val() === true;

        const userRef = db?.ref(`users/${uid}`);
        const snapshot = await userRef?.once('value');
        const dbUser = snapshot?.val();

        if (dbUser && dbUser.isBanned) {
            const bannedUser: User = { ...dbUser, id: uid, isGuest: false, isAdmin };
            callback(bannedUser);
            return;
        }

        const assignedPlayerCode = dbUser?.playerCode || generateCodeFromUid(uid);

        const user: User = {
            id: uid,
            alias: firebaseUser.displayName || "Gamer",
            ...(dbUser?.nickname ? { nickname: dbUser.nickname } : {}),
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
            platforms: dbUser?.platforms || [Platform.PC],
            isReady: false,
            isGuest: false,
            isAdmin,
            isBanned: dbUser?.isBanned || false,
            isMuted: dbUser?.isMuted || false,
            playerCode: assignedPlayerCode,
            showcasePrivacy: dbUser?.showcasePrivacy || 'public'
        };

        if (db) {
            try {
                await db.ref(`playerCodes/${assignedPlayerCode}`).set(uid);
            } catch (e) {}
        }

        const updates: Record<string, any> = {
            [`users/${uid}/alias`]: user.alias,
            [`users/${uid}/email`]: user.email,
            [`users/${uid}/avatarUrl`]: user.avatarUrl,
            [`users/${uid}/isAdmin`]: isAdmin,
            [`users/${uid}/isGuest`]: false,
            [`users/${uid}/lastLogin`]: Date.now(),

            [`userSummaries/${uid}/alias`]: user.alias,
            [`userSummaries/${uid}/avatarUrl`]: user.avatarUrl,
            [`userSummaries/${uid}/isAdmin`]: isAdmin,
            [`userSummaries/${uid}/isBanned`]: user.isBanned,
            [`userSummaries/${uid}/isMuted`]: user.isMuted,
        };

        if (assignedPlayerCode) {
            updates[`users/${uid}/playerCode`] = assignedPlayerCode;
            updates[`userSummaries/${uid}/playerCode`] = assignedPlayerCode;
        }

        await db?.ref().update(updates);

        callback(user);
    });
};

export const signInWithGoogle = async (): Promise<void> => {
    if (!auth || !googleProvider) throw new Error("Auth not initialized");
    await auth.setPersistence('local'); 
    await auth.signInWithPopup(googleProvider);
};

export const createGuestSession = (guestNumber: number): User => {
    const existingId = sessionStorage.getItem("guestId");
    const guestId = existingId || `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    if (!existingId) {
        sessionStorage.setItem("guestId", guestId);
    }

    return {
        id: guestId,
        alias: `Invitado ${guestNumber}`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
        platforms: [Platform.PC],
        isReady: false,
        isGuest: true,
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        email: "",
    };
};

export const createGuestUser = async (): Promise<void> => {
    // No-op: guest sessions are local and temporary, not Firebase Auth users.
};

export const logout = async () => {
    if (!auth) return;
    await auth.signOut();
};
