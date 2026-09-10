import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, Gamepad2, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../services/authService';
import { soundService } from '../services/soundService';
import { useLanguage } from '../services/i18n';
import { useAlert } from './CustomModal';

interface AuthModalContextType {
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { language, t } = useLanguage();
  const { showAlert } = useAlert();

  const openLoginModal = (customReason?: string) => {
    soundService.playPop();
    setReason(customReason || null);
    setIsOpen(true);
  };

  const closeLoginModal = () => {
    soundService.playPop();
    setIsOpen(false);
    setReason(null);
  };

  const getReasonText = () => {
    if (!reason) return t('auth.modalDesc');
    if (reason === 'auth.proposeReason' || reason.includes('proponer')) return t('auth.proposeReason');
    if (reason === 'auth.commentReason' || reason.includes('comentario')) return t('auth.commentReason');
    return reason;
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    soundService.playPop();
    try {
      await signInWithGoogle();
      setIsOpen(false);
      setReason(null);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      const isRedirectMismatch = /redirect_uri_mismatch|auth\/unauthorized-domain|unauthorized domain/i.test(
        [error?.code, error?.message, error?.customData?._tokenResponse?.error].filter(Boolean).join(' ')
      );
      showAlert({
        title: t('auth.googleErrorTitle'),
        message: isRedirectMismatch
          ? t('auth.googleErrorMismatch')
          : t('auth.googleErrorGeneric'),
        type: 'error'
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <AuthModalContext.Provider value={{ openLoginModal, closeLoginModal, isLoginModalOpen: isOpen }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface border border-gray-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 text-center">
            {/* Botón Cerrar */}
            <button 
              onClick={closeLoginModal} 
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            <div className="flex justify-center pt-2">
              <div className="p-3 bg-surface/80 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20">
                <img 
                  src="/favicon.svg" 
                  alt="TeamLobby Logo" 
                  className="w-12 h-12 drop-shadow-[0_0_15px_rgba(139,92,246,0.7)]" 
                />
              </div>
            </div>

            {/* Título y Subtítulo */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                TeamLobby
              </h3>
              <p className="text-gray-400 text-xs font-bold leading-relaxed px-2">
                {getReasonText()}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={handleGoogleSignIn} 
                disabled={isSigningIn}
                className="w-full bg-white text-black font-black py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-gray-200 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {isSigningIn ? (
                  <Loader2 size={18} className="animate-spin text-black" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                    {t('auth.google')}
                  </>
                )}
              </button>

              <button 
                onClick={closeLoginModal} 
                disabled={isSigningIn}
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-all"
              >
                {t('auth.guest')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
