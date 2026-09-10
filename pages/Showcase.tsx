import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trophy, Flame, Shield, Users, Star, 
  MessageSquare, Lock, Globe, Share2, Copy, Check, Swords, 
  Trash2, Edit3, Sparkles, Send, Gamepad2, AlertCircle, X, ExternalLink,
  UserPlus, UserCheck, Clock
} from 'lucide-react';
import { 
  User, ShowcaseGame, ShowcaseComment, ShowcasePrivacy, 
  GameGenre, Platform, Friendship, UserSummary, GameStatus 
} from '../types';
import { 
  subscribeToUserShowcase, addGameToShowcase, updateShowcaseGame, 
  deleteShowcaseGame, addShowcaseComment, deleteShowcaseComment,
  getUserShowcasePrivacy, updateShowcasePrivacy 
} from '../services/showcaseService';
import { 
  checkAreFriends, subscribeToFriends, sendFriendRequest, acceptFriendRequest,
  ensurePlayerCode, generateCodeFromUid 
} from '../services/friendService';
import { createChallenge } from '../services/challengeService';
import { searchGamesAutocomplete, GameSuggestion } from '../services/gameSearchService';
import { soundService } from '../services/soundService';
import { useLanguage } from '../services/i18n';
import { useAlert } from '../components/CustomModal';
import { useAuthModal } from '../components/LoginModal';
import Footer from '../components/Footer';
import { db, auth } from '../firebaseConfig';

interface ShowcaseProps {
  currentUser: User;
}

const Showcase: React.FC<ShowcaseProps> = ({ currentUser }) => {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { openLoginModal } = useAuthModal();

  const targetUserId = paramUserId || currentUser.id;
  const isOwner = currentUser.id === targetUserId && !currentUser.isGuest;

  // Estados de la Vitrina
  const [games, setGames] = useState<ShowcaseGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacy, setPrivacy] = useState<ShowcasePrivacy>('public');
  const [hasAccess, setHasAccess] = useState(true);
  const [targetUser, setTargetUser] = useState<UserSummary | null>(null);

  // Estados de Amistad y Retos
  const [isFriend, setIsFriend] = useState(false);
  const [myFriends, setMyFriends] = useState<Friendship[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Filtros
  const [filter, setFilter] = useState<'all' | GameStatus | 'hardcore'>('all');

  // Modales
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<ShowcaseGame | null>(null);
  const [activeGameDetail, setActiveGameDetail] = useState<ShowcaseGame | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeGame, setChallengeGame] = useState<ShowcaseGame | null>(null);

  // Formulario de Juego
  const [gameTitle, setGameTitle] = useState('');
  const [gameImage, setGameImage] = useState('');
  const [gameGenre, setGameGenre] = useState<GameGenre>(GameGenre.ACTION);
  const [gamePlatform, setGamePlatform] = useState<Platform>(Platform.PC);
  const [gameStatus, setGameStatus] = useState<GameStatus>('completed');
  const [gameDifficulty, setGameDifficulty] = useState<ShowcaseGame['difficulty']>('normal');
  const [isPlatinum, setIsPlatinum] = useState(false);
  const [isHardcore, setIsHardcore] = useState(false);
  const [isSpeedrun, setIsSpeedrun] = useState(false);
  const [isNoHit, setIsNoHit] = useState(false);
  const [isCoop, setIsCoop] = useState(false);
  const [coopFriendAlias, setCoopFriendAlias] = useState('');
  const [gameNotes, setGameNotes] = useState('');
  const [gameRating, setGameRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // Autocompletado de Steam
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Comentarios y Retos Form
  const [commentText, setCommentText] = useState('');
  const [challengeFriendId, setChallengeFriendId] = useState('');
  const [challengeGoal, setChallengeGoal] = useState('');
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);

  // Cargar usuario objetivo y verificar privacidad
  useEffect(() => {
    let unsubShowcase = () => {};

    const loadUserData = async () => {
      setLoading(true);
      if (!targetUserId) return;

      // Cargar información del usuario objetivo
      if (isOwner) {
        setTargetUser({
          id: currentUser.id,
          alias: currentUser.alias,
          nickname: currentUser.nickname,
          avatarUrl: currentUser.avatarUrl,
          playerCode: currentUser.playerCode || generateCodeFromUid(currentUser.id)
        });
        setHasAccess(true);
      } else {
        try {
          const snap = await db?.ref(`users/${targetUserId}`).once('value');
          if (snap?.exists()) {
            const u = snap.val();
            setTargetUser({
              id: targetUserId,
              alias: u.alias || u.nickname || 'Gamer',
              nickname: u.nickname,
              avatarUrl: u.avatarUrl,
              playerCode: u.playerCode || generateCodeFromUid(targetUserId)
            });
          } else {
            const sumSnap = await db?.ref(`userSummaries/${targetUserId}`).once('value');
            if (sumSnap?.exists()) {
              const u = sumSnap.val();
              setTargetUser({
                id: targetUserId,
                alias: u.alias || u.nickname || 'Gamer',
                nickname: u.nickname,
                avatarUrl: u.avatarUrl,
                playerCode: u.playerCode || generateCodeFromUid(targetUserId)
              });
            } else {
              setTargetUser({
                id: targetUserId,
                alias: 'Gamer',
                avatarUrl: '',
                playerCode: generateCodeFromUid(targetUserId)
              });
            }
          }
        } catch (e) {
          console.error(e);
          setTargetUser({
            id: targetUserId,
            alias: 'Gamer',
            avatarUrl: '',
            playerCode: generateCodeFromUid(targetUserId)
          });
        }
      }

      // Privacidad
      const userPrivacy = await getUserShowcasePrivacy(targetUserId);
      setPrivacy(userPrivacy);

      if (isOwner) {
        setHasAccess(true);
      } else if (userPrivacy === 'public') {
        setHasAccess(true);
      } else if (userPrivacy === 'friends') {
        const friends = await checkAreFriends(currentUser.id, targetUserId);
        setIsFriend(friends);
        setHasAccess(friends);
      } else {
        setHasAccess(false);
      }

      // Suscribirse a los juegos de la vitrina
      unsubShowcase = subscribeToUserShowcase(targetUserId, (loadedGames) => {
        setGames(loadedGames);
        setLoading(false);
      });
    };

    loadUserData();

    return () => unsubShowcase();
  }, [targetUserId, currentUser.id, isOwner]);

  // Cargar lista de amigos para retos
  useEffect(() => {
    if (currentUser.isGuest) return;
    const unsub = subscribeToFriends(currentUser.id, (friendsList) => {
      const accepted = friendsList.filter(f => f.status === 'accepted');
      setMyFriends(accepted);
      if (accepted.length > 0 && !challengeFriendId) {
        setChallengeFriendId(accepted[0].friendId);
      }
    });
    return () => unsub();
  }, [currentUser.id]);

  // Escuchar estado de amistad en tiempo real con el jugador objetivo
  useEffect(() => {
    if (!currentUser?.id || currentUser.isGuest || !targetUserId || isOwner) {
      setFriendshipStatus('none');
      return;
    }
    if (!db) return;
    const ref = db.ref(`friends/${currentUser.id}/${targetUserId}`);
    const listener = ref.on('value', (snap) => {
      if (snap.exists() && snap.val()?.status) {
        const st = snap.val().status;
        setFriendshipStatus(st);
        if (st === 'accepted') {
          setIsFriend(true);
          setHasAccess(true);
        }
      } else {
        setFriendshipStatus('none');
      }
    });
    return () => {
      ref.off('value', listener);
    };
  }, [currentUser?.id, currentUser?.isGuest, targetUserId, isOwner]);

  // Buscar juegos en Steam / curados con debounce
  useEffect(() => {
    if (!gameTitle.trim() || gameTitle.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGamesAutocomplete(gameTitle);
        setSuggestions(results);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [gameTitle]);

  const handleSelectSuggestion = (sug: GameSuggestion) => {
    soundService.playPop();
    setGameTitle(sug.title);
    setGameImage(sug.imageUrl);
    setGameGenre(sug.genre);
    if (sug.platforms && sug.platforms.length > 0) {
      setGamePlatform(sug.platforms[0]);
    }
    setSuggestions([]);
  };

  const handleOpenAddModal = () => {
    soundService.playPop();
    setEditingGame(null);
    setGameTitle('');
    setGameImage('');
    setGameGenre(GameGenre.ACTION);
    setGamePlatform(Platform.PC);
    setGameStatus('completed');
    setGameDifficulty('normal');
    setIsPlatinum(false);
    setIsHardcore(false);
    setIsSpeedrun(false);
    setIsNoHit(false);
    setIsCoop(false);
    setCoopFriendAlias('');
    setGameNotes('');
    setGameRating(5);
    setIsGameModalOpen(true);
  };

  const handleOpenEditModal = (game: ShowcaseGame, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playPop();
    setEditingGame(game);
    setGameTitle(game.gameTitle);
    setGameImage(game.imageUrl);
    setGameGenre(game.genre);
    setGamePlatform(game.platform);
    setGameStatus(game.status);
    setGameDifficulty(game.difficulty || 'normal');
    setIsPlatinum(!!game.trophies?.isPlatinum);
    setIsHardcore(!!game.trophies?.isHardcore);
    setIsSpeedrun(!!game.trophies?.isSpeedrun);
    setIsNoHit(!!game.trophies?.isNoHit);
    setIsCoop(!!game.trophies?.isCoop);
    setCoopFriendAlias(game.trophies?.coopFriendAlias || '');
    setGameNotes(game.notes || '');
    setGameRating(game.rating || 5);
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async () => {
    if (currentUser.isGuest || !auth?.currentUser) {
      openLoginModal('auth.login');
      return;
    }

    if (isSaving) return;

    if (!gameTitle.trim()) {
      return showAlert({ message: 'Por favor ingresa el nombre del juego', type: 'error' });
    }

    const payload: Omit<ShowcaseGame, 'id'> = {
      gameTitle: gameTitle.trim(),
      imageUrl: gameImage.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      genre: gameGenre,
      platform: gamePlatform,
      status: gameStatus,
      difficulty: gameDifficulty,
      trophies: {
        isPlatinum: isPlatinum || gameStatus === '100_percent',
        isHardcore,
        isSpeedrun,
        isNoHit,
        isCoop,
        ...(isCoop && coopFriendAlias.trim() ? { coopFriendAlias: coopFriendAlias.trim() } : {})
      },
      notes: gameNotes.trim(),
      rating: gameRating,
      completedAt: editingGame?.completedAt || Date.now()
    };

    setIsSaving(true);
    try {
      if (editingGame) {
        await updateShowcaseGame(currentUser.id, editingGame.id, payload);
        showAlert({ message: t('showcase.gameUpdated'), type: 'success' });
      } else {
        await addGameToShowcase(currentUser.id, payload);
        soundService.playTrophy();
        showAlert({ message: t('showcase.gameAdded'), type: 'success' });
      }
      setIsGameModalOpen(false);
    } catch (e: any) {
      console.error('Error saving game:', e);
      const errMsg = e?.message || '';
      if (errMsg.includes('PERMISSION_DENIED')) {
        showAlert({ 
          title: 'Sesión Requerida', 
          message: 'No se tienen permisos en la base de datos. Por favor inicia sesión con Google para guardar en tu galería.', 
          type: 'error' 
        });
      } else {
        showAlert({ 
          title: 'Error',
          message: errMsg || t('common.error'), 
          type: 'error' 
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGame = async (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playPop();
    showAlert({
      message: t('showcase.deleteConfirm'),
      type: 'confirm',
      onConfirm: async () => {
        await deleteShowcaseGame(currentUser.id, gameId);
        if (activeGameDetail?.id === gameId) setActiveGameDetail(null);
        showAlert({ message: t('showcase.gameDeleted'), type: 'info' });
      }
    });
  };

  const handleTogglePrivacy = async () => {
    if (!isOwner) return;
    soundService.playPop();
    const cycle: Record<ShowcasePrivacy, ShowcasePrivacy> = {
      public: 'friends',
      friends: 'private',
      private: 'public'
    };
    const nextPrivacy = cycle[privacy];
    setPrivacy(nextPrivacy);
    await updateShowcasePrivacy(currentUser.id, nextPrivacy);
  };

  const handleAddComment = async () => {
    if (currentUser.isGuest) {
      openLoginModal('auth.commentReason');
      return;
    }
    if (!commentText.trim() || !activeGameDetail) return;

    soundService.playPop();
    try {
      await addShowcaseComment(targetUserId, activeGameDetail.id, currentUser, commentText);
      setCommentText('');
      // Actualizar vista local del modal
      const snap = await db?.ref(`users/${targetUserId}/showcase/games/${activeGameDetail.id}`).once('value');
      if (snap?.exists()) {
        setActiveGameDetail(snap.val());
      }
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeGameDetail) return;
    soundService.playPop();
    try {
      await deleteShowcaseComment(targetUserId, activeGameDetail.id, commentId);
      const snap = await db?.ref(`users/${targetUserId}/showcase/games/${activeGameDetail.id}`).once('value');
      if (snap?.exists()) {
        setActiveGameDetail(snap.val());
      }
    } catch (e) {}
  };

  const handleOpenChallenge = (game: ShowcaseGame) => {
    if (currentUser.isGuest) {
      openLoginModal('auth.login');
      return;
    }
    if (myFriends.length === 0) {
      showAlert({ 
        message: 'Añade amigos primero para poder retarlos desde tu galería.', 
        type: 'info' 
      });
      return;
    }
    soundService.playPop();
    setChallengeGame(game);
    setChallengeGoal(`Pasarse ${game.gameTitle} al 100%`);
    setIsChallengeModalOpen(true);
  };

  const handleSendChallenge = async () => {
    if (!challengeGame || !challengeFriendId || !challengeGoal.trim()) return;
    const friend = myFriends.find(f => f.friendId === challengeFriendId);
    if (!friend) return;

    setIsSubmittingChallenge(true);
    try {
      await createChallenge(
        currentUser,
        friend.friendId,
        friend.alias,
        challengeGame.gameTitle,
        challengeGame.imageUrl,
        challengeGoal
      );
      soundService.playChime();
      showAlert({ message: t('challenges.created'), type: 'success' });
      setIsChallengeModalOpen(false);
    } catch (e) {
      showAlert({ message: t('common.error'), type: 'error' });
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  const handleCopyCode = async () => {
    if (!targetUser?.playerCode) return;
    try {
      await navigator.clipboard.writeText(`#${targetUser.playerCode}`);
      setCopiedCode(true);
      soundService.playPop();
      showAlert({ 
        message: `${t('friends.codeCopied')}: #${targetUser.playerCode}`, 
        type: 'success' 
      });
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error('Error copying player code:', e);
    }
  };

  const handleSendFriendRequest = async () => {
    if (currentUser.isGuest) {
      openLoginModal('auth.login');
      return;
    }
    if (!targetUser || isOwner) return;

    setIsSendingRequest(true);
    try {
      soundService.playPop();
      await sendFriendRequest(currentUser, targetUser);
      showAlert({ message: t('friends.requestSent'), type: 'success' });
    } catch (e) {
      console.error('Error sending friend request:', e);
      showAlert({ message: t('common.error'), type: 'error' });
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleAcceptFriend = async () => {
    if (currentUser.isGuest || !targetUserId) return;
    try {
      soundService.playChime();
      await acceptFriendRequest(currentUser.id, targetUserId);
      showAlert({ message: t('friends.requestAccepted'), type: 'success' });
    } catch (e) {
      console.error('Error accepting friend request:', e);
      showAlert({ message: t('common.error'), type: 'error' });
    }
  };

  // Estadísticas calculadas
  const beatenCount = games.filter(g => g.status === 'completed' || g.status === '100_percent').length;
  const platinumsCount = games.filter(g => g.trophies?.isPlatinum || g.status === '100_percent').length;
  const playingCount = games.filter(g => g.status === 'playing').length;
  const backlogCount = games.filter(g => g.status === 'backlog').length;
  const onHoldCount = games.filter(g => g.status === 'on_hold').length;
  const droppedCount = games.filter(g => g.status === 'dropped').length;
  const hardcoreCount = games.filter(g => g.difficulty === 'nightmare' || g.trophies?.isHardcore).length;

  // Filtrado de juegos
  const filteredGames = games.filter(g => {
    if (filter === 'all') return true;
    if (filter === '100_percent') return g.status === '100_percent' || g.trophies?.isPlatinum;
    if (filter === 'hardcore') return g.difficulty === 'nightmare' || g.trophies?.isHardcore;
    return g.status === filter;
  });

  const renderStatusBadge = (status: GameStatus) => {
    switch (status) {
      case 'playing':
        return (
          <span className="px-2 py-0.5 bg-emerald-500/90 text-white font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {t('showcase.status.playing')}
          </span>
        );
      case '100_percent':
        return (
          <span className="px-2 py-0.5 bg-yellow-500 text-black font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
            <Trophy size={10} fill="currentColor" /> {t('showcase.status.100_percent')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 bg-blue-600/90 text-white font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
            <Check size={10} /> {t('showcase.status.completed')}
          </span>
        );
      case 'backlog':
        return (
          <span className="px-2 py-0.5 bg-purple-600/90 text-white font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
            ⏳ {t('showcase.status.backlog')}
          </span>
        );
      case 'on_hold':
        return (
          <span className="px-2 py-0.5 bg-amber-500/90 text-black font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
            ⏸️ {t('showcase.status.on_hold')}
          </span>
        );
      case 'dropped':
        return (
          <span className="px-2 py-0.5 bg-rose-600/90 text-white font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
            🛑 {t('showcase.status.dropped')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col p-3 sm:p-4 md:p-8 relative overflow-x-hidden custom-scrollbar">
      <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[180px] pointer-events-none" />

      {/* HEADER SUPERIOR */}
      <header className="flex justify-between items-center mb-6 sm:mb-8 z-10 max-w-6xl mx-auto w-full bg-surface/30 backdrop-blur-xl p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-800/50 shadow-2xl gap-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 sm:p-2.5 bg-surface hover:bg-gray-800 rounded-xl transition-all border border-gray-800 text-gray-400 hover:text-white shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/favicon.svg" 
              alt="TeamLobby" 
              className="w-8 h-8 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-transform" 
            />
            <span className="hidden sm:inline text-lg font-black italic tracking-tighter uppercase text-white">
              TeamLobby
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isOwner && (
            <button
              onClick={handleTogglePrivacy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-primary/40 rounded-xl text-[10px] font-black uppercase text-gray-300 transition-all active:scale-95"
              title={t('showcase.privacyDesc')}
            >
              {privacy === 'public' && <><Globe size={13} className="text-emerald-400" /> <span className="hidden xs:inline">{t('showcase.privacy.public')}</span></>}
              {privacy === 'friends' && <><Users size={13} className="text-blue-400" /> <span className="hidden xs:inline">{t('showcase.privacy.friends')}</span></>}
              {privacy === 'private' && <><Lock size={13} className="text-amber-400" /> <span className="hidden xs:inline">{t('showcase.privacy.private')}</span></>}
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>{t('showcase.addGame')}</span>
            </button>
          )}

          {!paramUserId && currentUser.isGuest && (
            <button
              onClick={() => openLoginModal('auth.login')}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>{t('showcase.addGame')}</span>
            </button>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto w-full z-10 space-y-6 sm:space-y-8 pb-20">
        {/* Banner para Invitados */}
        {!paramUserId && currentUser.isGuest && (
          <div className="bg-primary/10 border border-primary/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-white tracking-wide">
                  Crea tu Galería Gamer Personal
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Inicia sesión con Google para registrar tus juegos superados, trofeos platinados, notas y compartirlos con tus amigos.
                </p>
              </div>
            </div>
            <button
              onClick={() => openLoginModal('auth.login')}
              className="px-5 py-2.5 bg-primary hover:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all shrink-0"
            >
              {t('auth.login')}
            </button>
          </div>
        )}
        {/* TARJETA DE IDENTIDAD GAMER & STATS */}
        <div className="bg-surface/40 border border-gray-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Perfil del Jugador */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <img 
                  src={targetUser?.avatarUrl || currentUser.avatarUrl} 
                  alt={targetUser?.alias || 'Gamer'} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-primary shadow-xl shadow-primary/20 bg-gray-900 object-cover" 
                />
                <div className="absolute -bottom-1.5 -right-1.5 bg-yellow-500 text-black p-1 rounded-lg border-2 border-surface shadow-lg">
                  <Trophy size={13} fill="currentColor" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
                    {targetUser?.nickname || targetUser?.alias || 'Gamer'}
                  </h1>
                  {isOwner && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-md text-[9px] font-black uppercase tracking-widest">
                      {t('showcase.myShowcase')}
                    </span>
                  )}
                </div>

                {/* Código de Jugador y Acciones de Amistad */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {targetUser?.playerCode && (
                    <button 
                      onClick={handleCopyCode}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/80 border border-gray-800 hover:border-primary/50 text-gray-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      title={t('friends.copyCode')}
                    >
                      <span className="text-[10px] font-sans font-black text-gray-500 uppercase tracking-wider">ID:</span>
                      <span className="text-primary font-black">#{targetUser.playerCode}</span>
                      {copiedCode ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-sans font-black">
                          <Check size={13} className="text-emerald-400" />
                          <span>{t('friends.copied')}</span>
                        </span>
                      ) : (
                        <Copy size={13} className="text-gray-400 group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  )}

                  {/* Botón / Estado de Amistad (al visitar a otro jugador) */}
                  {!isOwner && targetUserId && (
                    <>
                      {friendshipStatus === 'accepted' || isFriend ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                          <UserCheck size={14} />
                          <span>{t('friends.friendsBadge')}</span>
                        </span>
                      ) : friendshipStatus === 'pending_sent' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                          <Clock size={14} />
                          <span>{t('friends.pendingSentBadge')}</span>
                        </span>
                      ) : friendshipStatus === 'pending_received' ? (
                        <button
                          onClick={handleAcceptFriend}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                          <UserCheck size={14} />
                          <span>{t('friends.accept')}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSendFriendRequest}
                          disabled={isSendingRequest}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <UserPlus size={14} />
                          <span>{isSendingRequest ? '...' : t('friends.addFriend')}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* BARRA DE ESTADÍSTICAS GAMER */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 w-full md:w-auto">
              <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-2.5 sm:p-3 text-center min-w-[75px]">
                <div className="text-lg sm:text-xl font-black text-blue-400 italic">{beatenCount}</div>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                  {t('showcase.stats.completed')}
                </div>
              </div>

              <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 text-center min-w-[75px]">
                <div className="text-lg sm:text-xl font-black text-yellow-400 italic flex items-center justify-center gap-1">
                  <Trophy size={14} fill="currentColor" /> {platinumsCount}
                </div>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                  {t('showcase.stats.platinums')}
                </div>
              </div>

              <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-2.5 sm:p-3 text-center min-w-[75px]">
                <div className="text-lg sm:text-xl font-black text-emerald-400 italic flex items-center justify-center gap-1">
                  <Gamepad2 size={14} /> {playingCount}
                </div>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                  {t('showcase.stats.playing')}
                </div>
              </div>

              <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-2.5 sm:p-3 text-center min-w-[75px]">
                <div className="text-lg sm:text-xl font-black text-purple-400 italic">
                  {backlogCount}
                </div>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                  {t('showcase.stats.backlog')}
                </div>
              </div>

              <div className="bg-black/40 border border-rose-500/30 rounded-2xl p-2.5 sm:p-3 text-center min-w-[75px] col-span-2 sm:col-span-1">
                <div className="text-lg sm:text-xl font-black text-rose-400 italic">
                  {droppedCount}
                </div>
                <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">
                  {t('showcase.stats.dropped')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACCESO DENEGADO POR PRIVACIDAD */}
        {!hasAccess ? (
          <div className="bg-surface/20 border border-gray-800 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
            <Lock size={48} className="mx-auto text-amber-400 opacity-60" />
            <h2 className="text-xl font-black uppercase italic tracking-tight text-white">{t('showcase.restricted')}</h2>
            <p className="text-xs text-gray-500 font-bold">
              Para ver la galería de {targetUser?.nickname || targetUser?.alias}, debes ser su amigo en TeamLobby.
            </p>
            {!isFriend && (
              <div className="pt-2">
                {friendshipStatus === 'pending_sent' ? (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-black text-xs uppercase tracking-widest">
                    <Clock size={15} />
                    <span>{t('friends.pendingSentBadge')}</span>
                  </div>
                ) : friendshipStatus === 'pending_received' ? (
                  <button 
                    onClick={handleAcceptFriend}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    {t('friends.accept')}
                  </button>
                ) : (
                  <button 
                    onClick={handleSendFriendRequest}
                    disabled={isSendingRequest}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {t('friends.sendRequest')}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* BARRA DE FILTROS ESTILO MAL */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                  filter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                Todos ({games.length})
              </button>
              <button
                onClick={() => setFilter('playing')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === 'playing' ? 'bg-emerald-500 text-black font-black shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('showcase.status.playing')} ({playingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === 'completed' ? 'bg-blue-600 text-white shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <Check size={11} /> {t('showcase.status.completed')} ({games.filter(g => g.status === 'completed').length})
              </button>
              <button
                onClick={() => setFilter('100_percent')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === '100_percent' ? 'bg-yellow-500 text-black shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <Trophy size={11} fill="currentColor" /> {t('showcase.status.100_percent')} ({platinumsCount})
              </button>
              <button
                onClick={() => setFilter('backlog')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === 'backlog' ? 'bg-purple-600 text-white shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                ⏳ {t('showcase.status.backlog')} ({backlogCount})
              </button>
              <button
                onClick={() => setFilter('on_hold')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === 'on_hold' ? 'bg-amber-500 text-black shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                ⏸️ {t('showcase.status.on_hold')} ({onHoldCount})
              </button>
              <button
                onClick={() => setFilter('dropped')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                  filter === 'dropped' ? 'bg-rose-600 text-white shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                🛑 {t('showcase.status.dropped')} ({droppedCount})
              </button>
              {hardcoreCount > 0 && (
                <button
                  onClick={() => setFilter('hardcore')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
                    filter === 'hardcore' ? 'bg-red-500 text-white shadow-md' : 'bg-surface/50 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  <Flame size={11} /> Pesadilla ({hardcoreCount})
                </button>
              )}
            </div>

            {/* GRILLA DE JUEGOS */}
            {filteredGames.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-800/60 rounded-3xl space-y-3 bg-surface/5">
                <Gamepad2 size={40} className="mx-auto text-gray-600 opacity-40" />
                <p className="text-gray-500 font-bold text-sm italic">{t('showcase.empty')}</p>
                {isOwner ? (
                  <button
                    onClick={handleOpenAddModal}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-violet-600 transition-all active:scale-95"
                  >
                    {t('showcase.addGame')}
                  </button>
                ) : (!paramUserId && currentUser.isGuest) ? (
                  <button
                    onClick={() => openLoginModal('auth.login')}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:bg-violet-600 transition-all active:scale-95"
                  >
                    {t('auth.login')}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGames.map(game => {
                  const commentsCount = game.comments ? Object.keys(game.comments).length : 0;

                  return (
                    <div
                      key={game.id}
                      onClick={() => {
                        soundService.playPop();
                        setActiveGameDetail(game);
                      }}
                      className="group bg-surface/40 border border-gray-800/70 hover:border-primary/50 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                    >
                      {/* Carátula */}
                      <div className="relative h-44 w-full bg-gray-900 overflow-hidden">
                        <img 
                          src={game.imageUrl} 
                          alt={game.gameTitle} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        {/* Badges superiores */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          {renderStatusBadge(game.status)}
                          {game.status !== '100_percent' && game.trophies?.isPlatinum && (
                            <span className="px-2 py-0.5 bg-yellow-500 text-black font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
                              <Trophy size={10} fill="currentColor" /> Platino
                            </span>
                          )}
                          {game.difficulty === 'nightmare' && (
                            <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider backdrop-blur-sm">
                              <Flame size={10} /> Pesadilla
                            </span>
                          )}
                          {game.trophies?.isSpeedrun && (
                            <span className="px-2 py-0.5 bg-cyan-500 text-black font-black text-[9px] rounded-lg shadow-md uppercase tracking-wider backdrop-blur-sm">
                              Speedrun
                            </span>
                          )}
                        </div>

                        {/* Botones de acción del propietario */}
                        {isOwner && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleOpenEditModal(game, e)}
                              className="p-1.5 bg-black/70 hover:bg-white text-white hover:text-black rounded-lg transition-colors shadow"
                              title={t('common.edit')}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteGame(game.id, e)}
                              className="p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg transition-colors shadow"
                              title={t('common.delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}

                        {/* Título sobre la carátula */}
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                          <h3 className="text-base font-black text-white uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                            {game.gameTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-0.5">
                            <span className="text-primary font-black uppercase">{game.genre}</span>
                            <span>•</span>
                            <span className="uppercase">{game.platform}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cuerpo de la tarjeta */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-surface/20">
                        {/* Notas si existen */}
                        {game.notes ? (
                          <p className="text-xs text-gray-400 line-clamp-2 italic font-medium">
                            "{game.notes}"
                          </p>
                        ) : (
                          <div className="text-[10px] text-gray-600 italic">Sin notas registradas</div>
                        )}

                        {/* Footer de la tarjeta con trofeos e interacciones */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
                          {/* Rating estrellas */}
                          <div className="flex items-center gap-0.5 text-yellow-500">
                            {Array(game.rating || 5).fill(0).map((_, i) => (
                              <Star key={i} size={11} fill="currentColor" />
                            ))}
                          </div>

                          <div className="flex items-center gap-3 text-gray-500 text-[10px] font-bold">
                            {game.trophies?.isCoop && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Users size={12} /> Co-op
                              </span>
                            )}
                            <span className="flex items-center gap-1 hover:text-white transition-colors">
                              <MessageSquare size={12} /> {commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* MODAL: AGREGAR / EDITAR JUEGO EN LA VITRINA */}
      {isGameModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                  {editingGame ? t('showcase.editGame') : t('showcase.addGame')}
                </h2>
                <p className="text-xs text-gray-500 font-bold">Registra tus logros, dificultad y notas personales</p>
              </div>
              <button onClick={() => setIsGameModalOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Buscador y Título con Autocompletado */}
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Título del Juego</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="Ej. Elden Ring, Hollow Knight..."
                  className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl px-4 py-3 text-sm text-white font-bold outline-none transition-colors"
                />

                {/* Desplegable de Sugerencias de Steam */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-gray-800 rounded-xl overflow-hidden shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar">
                    {suggestions.map((sug, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="flex items-center gap-3 p-2.5 hover:bg-primary/20 cursor-pointer transition-colors border-b border-gray-800/40 last:border-0"
                      >
                        <img src={sug.imageUrl} alt={sug.title} className="w-12 h-6 object-cover rounded" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white truncate">{sug.title}</p>
                          <p className="text-[9px] text-gray-400 uppercase">{sug.genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URL de Portada */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">URL de Portada / Imagen</label>
                <input
                  type="text"
                  value={gameImage}
                  onChange={(e) => setGameImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none transition-colors"
                />
              </div>

              {/* Selector de Género y Plataforma */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Género</label>
                  <select
                    value={gameGenre}
                    onChange={(e) => setGameGenre(e.target.value as GameGenre)}
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none"
                  >
                    {Object.values(GameGenre).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Plataforma</label>
                  <select
                    value={gamePlatform}
                    onChange={(e) => setGamePlatform(e.target.value as Platform)}
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none"
                  >
                    {Object.values(Platform).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado y Dificultad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Estado en la Galería</label>
                  <select
                    value={gameStatus}
                    onChange={(e) => {
                      const val = e.target.value as GameStatus;
                      setGameStatus(val);
                      if (val === '100_percent') {
                        setIsPlatinum(true);
                      }
                    }}
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none"
                  >
                    <option value="playing">🟢 {t('showcase.status.playing')}</option>
                    <option value="completed">✅ {t('showcase.status.completed')}</option>
                    <option value="100_percent">🏆 {t('showcase.status.100_percent')}</option>
                    <option value="backlog">⏳ {t('showcase.status.backlog')}</option>
                    <option value="on_hold">⏸️ {t('showcase.status.on_hold')}</option>
                    <option value="dropped">🛑 {t('showcase.status.dropped')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Dificultad Superada</label>
                  <select
                    value={gameDifficulty}
                    onChange={(e) => setGameDifficulty(e.target.value as any)}
                    className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none"
                  >
                    <option value="easy">Fácil</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difícil</option>
                    <option value="nightmare">Pesadilla / Hardcore 🔥</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>
              </div>

              {/* SELECTOR DE TROFEOS / LOGROS */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Trofeos y Logros Especiales</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlatinum(!isPlatinum)}
                    className={`p-2 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      isPlatinum ? 'bg-yellow-500 text-black border-yellow-400 shadow-md' : 'bg-black/40 border-gray-800 text-gray-400'
                    }`}
                  >
                    <Trophy size={13} fill={isPlatinum ? 'currentColor' : 'none'} /> Platino
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHardcore(!isHardcore)}
                    className={`p-2 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      isHardcore ? 'bg-red-500 text-white border-red-400 shadow-md' : 'bg-black/40 border-gray-800 text-gray-400'
                    }`}
                  >
                    <Flame size={13} /> Hardcore
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSpeedrun(!isSpeedrun)}
                    className={`p-2 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      isSpeedrun ? 'bg-cyan-500 text-black border-cyan-400 shadow-md' : 'bg-black/40 border-gray-800 text-gray-400'
                    }`}
                  >
                    Speedrun
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNoHit(!isNoHit)}
                    className={`p-2 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center justify-center gap-1.5 ${
                      isNoHit ? 'bg-purple-500 text-white border-purple-400 shadow-md' : 'bg-black/40 border-gray-800 text-gray-400'
                    }`}
                  >
                    No-Hit
                  </button>
                </div>
              </div>

              {/* Modo Cooperativo */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isCoop"
                    checked={isCoop}
                    onChange={(e) => setIsCoop(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <label htmlFor="isCoop" className="text-xs font-black uppercase text-gray-300 flex items-center gap-1.5 cursor-pointer">
                    <Users size={14} className="text-primary" /> ¿Lo superaste en Cooperativo con un amigo?
                  </label>
                </div>
                {isCoop && (
                  <input
                    type="text"
                    value={coopFriendAlias}
                    onChange={(e) => setCoopFriendAlias(e.target.value)}
                    placeholder="Alias o nombre de tu compañero..."
                    className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl px-4 py-2 text-xs text-white font-bold outline-none"
                  />
                )}
              </div>

              {/* Notas del Jugador */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {t('showcase.notes')}
                </label>
                <textarea
                  value={gameNotes}
                  onChange={(e) => setGameNotes(e.target.value)}
                  placeholder={t('showcase.notesPlaceholder')}
                  rows={3}
                  className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl p-3 text-xs text-white font-medium outline-none resize-none"
                />
              </div>

              {/* Puntuación */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Tu Valoración</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setGameRating(star)}
                      className={`p-1 transition-transform ${star <= gameRating ? 'text-yellow-400 scale-110' : 'text-gray-700'}`}
                    >
                      <Star size={18} fill={star <= gameRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsGameModalOpen(false)}
                className="px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveGame}
                className={`px-6 py-2.5 bg-primary hover:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('common.saving')}</span>
                  </>
                ) : (
                  <span>{t('common.save')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALLE DEL JUEGO, COMENTARIOS Y RETOS */}
      {activeGameDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header con carátula grande */}
            <div className="relative h-56 bg-gray-900 overflow-hidden shrink-0">
              <img src={activeGameDetail.imageUrl} alt={activeGameDetail.gameTitle} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <button
                onClick={() => setActiveGameDetail(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex flex-wrap gap-2 mb-2">
                  {renderStatusBadge(activeGameDetail.status)}
                  {activeGameDetail.status !== '100_percent' && activeGameDetail.trophies?.isPlatinum && (
                    <span className="px-2.5 py-0.5 bg-yellow-500 text-black font-black text-[10px] rounded-lg shadow uppercase flex items-center gap-1">
                      <Trophy size={12} fill="currentColor" /> Platino
                    </span>
                  )}
                  {activeGameDetail.difficulty && (
                    <span className="px-2.5 py-0.5 bg-primary/30 border border-primary/50 text-white font-black text-[10px] rounded-lg uppercase">
                      Dificultad: {activeGameDetail.difficulty}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">{activeGameDetail.gameTitle}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase">{activeGameDetail.genre} • {activeGameDetail.platform}</p>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Notas del Jugador */}
              {activeGameDetail.notes && (
                <div className="bg-black/30 border border-gray-800/80 rounded-2xl p-4 space-y-1.5">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">{t('showcase.notes')}</p>
                  <p className="text-sm text-gray-300 font-medium italic">"{activeGameDetail.notes}"</p>
                </div>
              )}

              {/* Botón de Retar a un Amigo */}
              <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                    <Swords size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">¿Tienes un amigo que juegue a esto?</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Lánzale un reto para ver si puede superarlo como tú</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenChallenge(activeGameDetail)}
                  className="px-4 py-2 bg-primary hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 shrink-0"
                >
                  {t('challenges.challengeFriend')}
                </button>
              </div>

              {/* SECCIÓN DE COMENTARIOS */}
              <div className="space-y-4 pt-2 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">
                    {t('showcase.comments')} ({activeGameDetail.comments ? Object.keys(activeGameDetail.comments).length : 0})
                  </h3>
                </div>

                {/* Input para nuevo comentario */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder={currentUser.isGuest ? 'Inicia sesión para comentar...' : 'Escribe un comentario a tu amigo...'}
                    className="flex-1 bg-black/60 border border-gray-800 focus:border-primary rounded-xl px-4 py-2.5 text-xs text-white font-medium outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    className="p-2.5 bg-primary hover:bg-violet-600 text-white rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>

                {/* Lista de comentarios */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {!activeGameDetail.comments || Object.keys(activeGameDetail.comments).length === 0 ? (
                    <p className="text-xs text-gray-600 italic">{t('showcase.noComments')}</p>
                  ) : (
                    Object.values(activeGameDetail.comments).map(c => (
                      <div key={c.id} className="p-3 bg-black/30 border border-gray-800/60 rounded-xl flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <img src={c.userAvatar} alt={c.userName} className="w-7 h-7 rounded-lg bg-gray-800 object-cover mt-0.5" />
                          <div>
                            <p className="text-[11px] font-black text-white">{c.userName}</p>
                            <p className="text-xs text-gray-300 font-medium mt-0.5">{c.text}</p>
                          </div>
                        </div>

                        {(c.userId === currentUser.id || isOwner) && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LANZAR RETO A UN AMIGO */}
      {isChallengeModalOpen && challengeGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-gray-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Swords size={18} className="text-primary" />
                <h3 className="text-base font-black uppercase italic tracking-tight text-white">{t('challenges.challengeFriend')}</h3>
              </div>
              <button onClick={() => setIsChallengeModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-black/40 border border-gray-800 rounded-xl">
                <img src={challengeGame.imageUrl} alt={challengeGame.gameTitle} className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase truncate">{challengeGame.gameTitle}</h4>
                  <p className="text-[10px] text-primary font-bold uppercase">{challengeGame.genre}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {t('challenges.selectFriend')}
                </label>
                <select
                  value={challengeFriendId}
                  onChange={(e) => setChallengeFriendId(e.target.value)}
                  className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none"
                >
                  {myFriends.map(f => (
                    <option key={f.friendId} value={f.friendId}>{f.alias} (#{f.playerCode})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {t('challenges.goalLabel')}
                </label>
                <textarea
                  value={challengeGoal}
                  onChange={(e) => setChallengeGoal(e.target.value)}
                  placeholder={t('challenges.goalPlaceholder')}
                  rows={3}
                  className="w-full bg-black/60 border border-gray-800 focus:border-primary rounded-xl p-3 text-xs text-white font-medium outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsChallengeModalOpen(false)}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={isSubmittingChallenge}
                onClick={handleSendChallenge}
                className="px-5 py-2 bg-primary hover:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Swords size={14} />
                <span>{t('challenges.send')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase;
