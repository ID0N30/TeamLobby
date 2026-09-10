import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Platform, User } from './types';
import { onAuthStateChange, logout } from './services/authService';
import { subscribeToUserProfile } from './services/roomService';
import { LanguageProvider } from './services/i18n';
import { AlertProvider } from './components/CustomModal';
import { AuthModalProvider } from './components/LoginModal';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Showcase from './pages/Showcase';
import Legal from './pages/Legal';

const createGuestUser = (): User => {
  let guestId = sessionStorage.getItem("guestId");
  let guestAlias = sessionStorage.getItem("guestAlias");

  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    sessionStorage.setItem("guestId", guestId);
  }
  if (!guestAlias) {
    guestAlias = "Invitado";
    sessionStorage.setItem("guestAlias", guestAlias);
  }

  return {
    id: guestId,
    alias: guestAlias,
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

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(() => createGuestUser());
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    let profileUnsub = () => {};

    const unsubscribe = onAuthStateChange((user) => {
      if (user && !user.isGuest) {
        setCurrentUser(user);
        profileUnsub = subscribeToUserProfile(user.id, (dbData) => {
          setCurrentUser(prev => prev ? { ...prev, ...dbData } : prev);
        });
      } else {
        profileUnsub();
        // Mantener o restaurar la sesión de invitado
        setCurrentUser(createGuestUser());
      }
      setIsAuthChecking(false);
    });

    return () => {
      unsubscribe();
      profileUnsub();
    };
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem("guestId");
    sessionStorage.removeItem("guestAlias");
    await logout();
    setCurrentUser(createGuestUser());
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <img 
          src="/favicon.svg" 
          alt="TeamLobby" 
          className="w-16 h-16 animate-pulse drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]" 
        />
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Outlet context={{ currentUser }} />}>
          <Route path="/" element={<Home currentUser={currentUser} onLogout={handleLogout} />} />
          <Route path="/room/:code" element={<Lobby currentUser={currentUser} />} />
          <Route path="/profile" element={<Profile currentUser={currentUser} />} />
          <Route path="/showcase" element={<Showcase currentUser={currentUser} />} />
          <Route path="/showcase/:userId" element={<Showcase currentUser={currentUser} />} />
          <Route path="/admin" element={currentUser.isAdmin ? <Admin currentUser={currentUser} /> : <Navigate to="/" />} />
          <Route path="/terms" element={<Legal defaultTab="terms" />} />
          <Route path="/privacy" element={<Legal defaultTab="privacy" />} />
          <Route path="/cookies" element={<Legal defaultTab="cookies" />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AlertProvider>
        <AuthModalProvider>
          <AppContent />
        </AuthModalProvider>
      </AlertProvider>
    </LanguageProvider>
  );
};

export default App;
