import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, User as UserIcon, CheckCircle, Shield, Sparkles, 
  Users, Swords, Copy, Check, Search, UserPlus, UserCheck, UserX, 
  Trash2, Globe, Lock, Trophy, ExternalLink, Flame 
} from 'lucide-react';
import { User, Friendship, GamerChallenge, UserSummary, ShowcasePrivacy } from '../types';
import { updateUserProfile } from '../services/roomService';
import { 
  ensurePlayerCode, searchUserByPlayerCode, sendFriendRequest, 
  acceptFriendRequest, removeFriend, subscribeToFriends,
  generateCodeFromUid 
} from '../services/friendService';
import { 
  subscribeToReceivedChallenges, subscribeToSentChallenges, 
  updateChallengeStatus 
} from '../services/challengeService';
import { 
  getUserShowcasePrivacy, updateShowcasePrivacy 
} from '../services/showcaseService';
import { soundService } from '../services/soundService';
import { useLanguage } from '../services/i18n';
import { useAlert } from '../components/CustomModal';
import { useAuthModal } from '../components/LoginModal';
import Footer from '../components/Footer';

interface ProfileProps {
  currentUser: User;
  onUpdateUser?: (data: Partial<User>) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { openLoginModal } = useAuthModal();

  const [activeTab, setActiveTab] = useState<'general' | 'friends' | 'challenges'>('general');

  // General tab states
  const [nickname, setNickname] = useState(currentUser.nickname || currentUser.alias);
  const [playerCode, setPlayerCode] = useState(
    currentUser.playerCode || (currentUser.isGuest ? '' : generateCodeFromUid(currentUser.id))
  );
  const [privacy, setPrivacy] = useState<ShowcasePrivacy>('public');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Friends tab states
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchedUser, setSearchedUser] = useState<UserSummary | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // Challenges tab states
  const [receivedChallenges, setReceivedChallenges] = useState<GamerChallenge[]>([]);
  const [sentChallenges, setSentChallenges] = useState<GamerChallenge[]>([]);

  // Inicializar playerCode y privacidad
  useEffect(() => {
    if (!currentUser.isGuest) {
      ensurePlayerCode(currentUser).then(code => {
        if (code) setPlayerCode(code);
      });
      getUserShowcasePrivacy(currentUser.id).then(p => {
        setPrivacy(p);
      });
    }
  }, [currentUser]);

  // Suscripción a amigos y retos
  useEffect(() => {
    if (currentUser.isGuest) return;

    const unsubFriends = subscribeToFriends(currentUser.id, setFriends);
    const unsubReceived = subscribeToReceivedChallenges(currentUser.id, setReceivedChallenges);
    const unsubSent = subscribeToSentChallenges(currentUser.id, setSentChallenges);

    return () => {
      unsubFriends();
      unsubReceived();
      unsubSent();
    };
  }, [currentUser]);

  const handleSave = async () => {
    soundService.playPop();
    setIsSaving(true);
    try {
      await updateUserProfile(currentUser.id, { nickname });
      await updateShowcasePrivacy(currentUser.id, privacy);
      showAlert({ message: t('profile.updated'), type: 'success' });
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (!playerCode) return;
    soundService.playPop();
    navigator.clipboard.writeText(playerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSearchFriend = async () => {
    if (!searchCode.trim()) return;
    soundService.playPop();
    setIsSearching(true);
    setSearchError(false);
    setSearchedUser(null);

    try {
      const result = await searchUserByPlayerCode(searchCode);
      if (result) {
        setSearchedUser(result);
      } else {
        setSearchError(true);
      }
    } catch (e) {
      setSearchError(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!searchedUser) return;
    soundService.playPop();
    try {
      await sendFriendRequest(currentUser, searchedUser);
      showAlert({ message: t('friends.requestSent'), type: 'success' });
      setSearchedUser(null);
      setSearchCode('');
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    }
  };

  const handleAcceptFriend = async (friendId: string) => {
    soundService.playChime();
    try {
      await acceptFriendRequest(currentUser.id, friendId);
      showAlert({ message: '¡Amistad aceptada!', type: 'success' });
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    }
  };

  const handleRejectOrRemoveFriend = async (friendId: string) => {
    soundService.playPop();
    try {
      await removeFriend(currentUser.id, friendId);
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    }
  };

  const handleChallengeStatus = async (challengeId: string, status: 'accepted' | 'completed' | 'declined') => {
    soundService.playPop();
    if (status === 'completed') {
      soundService.playTrophy();
    }
    try {
      await updateChallengeStatus(challengeId, status);
      if (status === 'completed') {
        showAlert({ message: t('challenges.completedToast'), type: 'success' });
      }
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    }
  };

  const pendingReceived = friends.filter(f => f.status === 'pending_received');
  const pendingSent = friends.filter(f => f.status === 'pending_sent');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  return (
    <div className="min-h-screen bg-background text-gray-100 p-3 sm:p-4 md:p-8 flex flex-col items-center custom-scrollbar">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-surface hover:bg-gray-800 rounded-xl transition-colors border border-gray-800 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={18}/>
            </button>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">{t('profile.title')}</h1>
          </div>

          {!currentUser.isGuest && (
            <Link
              to={`/showcase/${currentUser.id}`}
              className="flex items-center gap-2 px-3.5 py-2 bg-primary/20 hover:bg-primary border border-primary/40 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary hover:text-white transition-all shadow-md active:scale-95"
            >
              <Trophy size={14} />
              <span>{t('showcase.myShowcase')}</span>
            </Link>
          )}
        </header>

        {/* Tarjeta de Perfil Resumida */}
        <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-2xl flex items-center gap-4">
          <div className="relative shrink-0">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.alias} 
              className="w-16 h-16 rounded-2xl border-2 border-primary shadow-lg shadow-primary/20 bg-gray-900 object-cover" 
            />
            {currentUser.isAdmin && (
              <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black p-1 rounded-full border-2 border-surface shadow-xl">
                <Shield size={12} fill="currentColor" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-white italic truncate">{currentUser.nickname || currentUser.alias}</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">
              {currentUser.email || t('profile.guestSession')}
            </p>

            {/* Código de Jugador */}
            {playerCode && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-mono font-black text-primary bg-black/50 px-2.5 py-1 rounded-lg border border-gray-800">
                  #{playerCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                  title={t('friends.codeCopied')}
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PESTAÑAS */}
        <div className="flex border-b border-gray-800 space-x-4">
          <button
            onClick={() => { soundService.playPop(); setActiveTab('general'); }}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'general' ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Ajustes
          </button>
          {!currentUser.isGuest && (
            <>
              <button
                onClick={() => { soundService.playPop(); setActiveTab('friends'); }}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'friends' ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Users size={14} />
                <span>Amigos ({acceptedFriends.length})</span>
                {pendingReceived.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                )}
              </button>

              <button
                onClick={() => { soundService.playPop(); setActiveTab('challenges'); }}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'challenges' ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Swords size={14} />
                <span>Retos ({receivedChallenges.filter(c => c.status === 'pending' || c.status === 'accepted').length})</span>
              </button>
            </>
          )}
        </div>

        {/* CONTENIDO PESTAÑA 1: AJUSTES GENERALES */}
        {activeTab === 'general' && (
          <div className="bg-surface border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                {t('profile.nickname')}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <UserIcon size={18}/>
                </div>
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold text-white text-sm"
                  placeholder={t('profile.nicknameHint')}
                />
              </div>
            </div>

            {/* Privacidad de la Vitrina */}
            {!currentUser.isGuest && (
              <div className="space-y-2 pt-2 border-t border-gray-800/60">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                  {t('showcase.privacyDesc')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrivacy('public')}
                    className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
                      privacy === 'public' ? 'bg-primary/20 border-primary text-white shadow-md' : 'bg-black/40 border-gray-800 text-gray-500'
                    }`}
                  >
                    <Globe size={16} className={privacy === 'public' ? 'text-primary' : ''} />
                    <span>Pública</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacy('friends')}
                    className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
                      privacy === 'friends' ? 'bg-primary/20 border-primary text-white shadow-md' : 'bg-black/40 border-gray-800 text-gray-500'
                    }`}
                  >
                    <Users size={16} className={privacy === 'friends' ? 'text-primary' : ''} />
                    <span>Amigos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrivacy('private')}
                    className={`p-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
                      privacy === 'private' ? 'bg-primary/20 border-primary text-white shadow-md' : 'bg-black/40 border-gray-800 text-gray-500'
                    }`}
                  >
                    <Lock size={16} className={privacy === 'private' ? 'text-primary' : ''} />
                    <span>Privada</span>
                  </button>
                </div>
              </div>
            )}

            {currentUser.isGuest && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl text-primary">
                    <Sparkles size={18}/>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white uppercase">{t('profile.guestSession')}</p>
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">{t('profile.guestWarning')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openLoginModal()} 
                  className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                  {t('auth.google')}
                </button>
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl hover:bg-violet-600 shadow-primary/20"
            >
              {isSaving ? <span className="animate-pulse">{t('common.saving')}</span> : <><Save size={16}/> {t('common.save')}</>}
            </button>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: AMIGOS */}
        {activeTab === 'friends' && !currentUser.isGuest && (
          <div className="space-y-6">
            {/* Buscador de Amigos por Código */}
            <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Añadir Amigo por Código de Jugador</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchFriend()}
                    placeholder="Ej. #TL-4821 o TL-4821"
                    className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl py-2.5 pl-10 pr-4 text-xs text-white font-mono font-bold outline-none"
                  />
                </div>
                <button
                  onClick={handleSearchFriend}
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-primary hover:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shrink-0"
                >
                  {t('friends.searchBtn')}
                </button>
              </div>

              {searchError && (
                <p className="text-xs text-red-400 font-bold">{t('friends.userNotFound')}</p>
              )}

              {/* Resultado de búsqueda */}
              {searchedUser && (
                <div className="p-3 bg-black/40 border border-primary/40 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <Link 
                    to={`/showcase/${searchedUser.id}`} 
                    className="flex items-center gap-3 min-w-0 group/card cursor-pointer"
                    title={t('friends.viewShowcase')}
                  >
                    <img src={searchedUser.avatarUrl} alt="" className="w-10 h-10 rounded-xl bg-gray-800 object-cover group-hover/card:ring-2 ring-primary transition-all" />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white truncate group-hover/card:text-primary transition-colors">{searchedUser.nickname || searchedUser.alias}</p>
                      <p className="text-[10px] font-mono text-primary font-bold">#{searchedUser.playerCode}</p>
                    </div>
                  </Link>
                  {searchedUser.id === currentUser.id ? (
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Eres tú</span>
                  ) : acceptedFriends.some(f => f.friendId === searchedUser.id) ? (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <UserCheck size={14} /> Ya sois amigos
                    </span>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      className="px-3.5 py-1.5 bg-primary hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <UserPlus size={13} /> {t('friends.sendRequest')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Solicitudes Recibidas */}
            {pendingReceived.length > 0 && (
              <div className="bg-surface border border-primary/30 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <UserPlus size={14} /> {t('friends.pendingReceived')} ({pendingReceived.length})
                </h3>
                <div className="space-y-2">
                  {pendingReceived.map(f => (
                    <div key={f.friendId} className="p-3 bg-black/40 border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
                      <Link 
                        to={`/showcase/${f.friendId}`} 
                        className="flex items-center gap-3 min-w-0 group/card cursor-pointer"
                        title={t('friends.viewShowcase')}
                      >
                        <img src={f.avatarUrl} alt="" className="w-9 h-9 rounded-xl bg-gray-800 object-cover group-hover/card:ring-2 ring-primary transition-all" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover/card:text-primary transition-colors">{f.alias}</p>
                          <p className="text-[9px] font-mono text-gray-400">#{f.playerCode}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAcceptFriend(f.friendId)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                        >
                          {t('friends.accept')}
                        </button>
                        <button
                          onClick={() => handleRejectOrRemoveFriend(f.friendId)}
                          className="p-1 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Amigos */}
            <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                {t('friends.title')} ({acceptedFriends.length})
              </h3>

              {acceptedFriends.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4 text-center">{t('friends.noFriends')}</p>
              ) : (
                <div className="space-y-2.5">
                  {acceptedFriends.map(f => (
                    <div key={f.friendId} className="p-3 bg-black/30 border border-gray-800/80 rounded-2xl flex items-center justify-between gap-3">
                      <Link 
                        to={`/showcase/${f.friendId}`} 
                        className="flex items-center gap-3 min-w-0 group/card cursor-pointer"
                        title={t('friends.viewShowcase')}
                      >
                        <img src={f.avatarUrl} alt="" className="w-10 h-10 rounded-xl bg-gray-800 object-cover group-hover/card:ring-2 ring-primary transition-all" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover/card:text-primary transition-colors">{f.alias}</p>
                          <p className="text-[10px] font-mono text-primary font-bold">#{f.playerCode}</p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/showcase/${f.friendId}`}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-primary border border-gray-800 hover:border-primary text-gray-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                        >
                          <Trophy size={12} /> {t('friends.viewShowcase')}
                        </Link>
                        <button
                          onClick={() => handleRejectOrRemoveFriend(f.friendId)}
                          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                          title={t('friends.remove')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: RETOS */}
        {activeTab === 'challenges' && !currentUser.isGuest && (
          <div className="space-y-6">
            {/* Retos Recibidos */}
            <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Swords size={16} className="text-primary" /> {t('challenges.received')} ({receivedChallenges.length})
              </h3>

              {receivedChallenges.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4 text-center">{t('challenges.noChallenges')}</p>
              ) : (
                <div className="space-y-3">
                  {receivedChallenges.map(c => (
                    <div key={c.id} className="p-4 bg-black/40 border border-gray-800/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={c.gameImageUrl} alt="" className="w-12 h-12 object-cover rounded-xl shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white uppercase truncate">{c.gameTitle}</h4>
                            <p className="text-[10px] text-gray-400 font-medium">De: <span className="text-primary font-bold">{c.fromUserName}</span></p>
                          </div>
                        </div>

                        <div>
                          {c.status === 'completed' ? (
                            <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-[9px] font-black uppercase tracking-wider">
                              ¡Completado! 🏆
                            </span>
                          ) : c.status === 'accepted' ? (
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[9px] font-black uppercase tracking-wider">
                              En Curso
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-surface/50 border border-gray-800/60 rounded-xl text-xs text-gray-300 italic font-medium">
                        "{c.challengeGoal}"
                      </div>

                      {c.status !== 'completed' && c.status !== 'declined' && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          {c.status === 'pending' && (
                            <button
                              onClick={() => handleChallengeStatus(c.id, 'accepted')}
                              className="px-3 py-1.5 bg-primary hover:bg-violet-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                              Aceptar Reto
                            </button>
                          )}
                          {c.status === 'accepted' && (
                            <button
                              onClick={() => handleChallengeStatus(c.id, 'completed')}
                              className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
                            >
                              <Trophy size={12} fill="currentColor" /> {t('challenges.complete')}
                            </button>
                          )}
                          <button
                            onClick={() => handleChallengeStatus(c.id, 'declined')}
                            className="px-3 py-1.5 bg-gray-900 text-gray-400 hover:text-white rounded-lg text-[10px] font-black uppercase transition-colors"
                          >
                            Declinar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Retos Enviados */}
            {sentChallenges.length > 0 && (
              <div className="bg-surface border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  {t('challenges.sent')} ({sentChallenges.length})
                </h3>
                <div className="space-y-2.5">
                  {sentChallenges.map(c => (
                    <div key={c.id} className="p-3 bg-black/30 border border-gray-800/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white uppercase truncate">{c.gameTitle}</p>
                        <p className="text-[10px] text-gray-400">Para: <span className="text-primary font-bold">{c.toUserName}</span></p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        c.status === 'completed' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
