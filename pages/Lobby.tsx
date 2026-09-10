
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Gamepad2, Menu, Plus, Search, X, 
  Loader2, Lock, MessageCircle, LayoutGrid, Trophy, Trash2,
  ExternalLink, Edit3, Send, ThumbsUp, Monitor, Tv, Box, CheckCircle2, Info, Copy,
  Clock, Dices, Vote, Sparkles, RefreshCcw, UserPlus, PlayCircle, MessageSquare, ChevronDown, ChevronUp, MoreHorizontal, Medal, Crown,
  Volume2, VolumeX, LogIn
} from 'lucide-react';
import { Room, User, Game, GameGenre, Platform, ViewState, Comment } from '../types';
import { 
  subscribeToRoom, addGameToRoom, voteForGame, sendChatMessage,
  toggleUserReadyState, removeGameFromRoom, addCommentToGame, updateGameInRoom, leaveRoomCleanly, cleanupRoomMembers,
  startReadyActivity, submitReadySuggestion, submitReadyVote, resolveReadyActivity, resetReadyActivity, joinRoom,
  setupRoomPresence
} from '../services/roomService';
import { soundService } from '../services/soundService';
import { searchGamesAutocomplete, GameSuggestion } from '../services/gameSearchService';
import Chat from '../components/Chat';
import GameCard from '../components/GameCard';
import { useLanguage, TranslationKey } from '../services/i18n';
import { useAlert } from '../components/CustomModal';
import { useAuthModal } from '../components/LoginModal';

interface LobbyProps {
    currentUser: User;
}

const PlatformIcon = ({ p }: { p: string }) => {
    if (p.includes('PC')) return <Monitor size={14} />;
    if (p.includes('Xbox')) return <Box size={14} />;
    if (p.includes('PS')) return <Tv size={14} />;
    if (p.includes('Switch')) return <Gamepad2 size={14} />;
    return null;
};

const getVotesCount = (votedBy?: Record<string, boolean> | string[]): number => {
    if (!votedBy) return 0;
    if (Array.isArray(votedBy)) return votedBy.length;
    return Object.values(votedBy).filter(Boolean).length;
};

const hasUserVotedGame = (votedBy?: Record<string, boolean> | string[], userId?: string): boolean => {
    if (!votedBy || !userId) return false;
    if (Array.isArray(votedBy)) return votedBy.includes(userId);
    return !!votedBy[userId];
};

const Lobby: React.FC<LobbyProps> = ({ currentUser }) => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { showAlert } = useAlert();
    const { openLoginModal } = useAuthModal();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [view, setView] = useState<ViewState>('LOBBY');
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'VOTED' | 'RECENT'>('ALL');
    const [showGuestBanner, setShowGuestBanner] = useState(true);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');

    const [newGameTitle, setNewGameTitle] = useState('');
    const [newGameGenre, setNewGameGenre] = useState<GameGenre>(GameGenre.ACTION);
    const [newGamePlatforms, setNewGamePlatforms] = useState<Platform[]>([Platform.PC]);
    const [newGameLink, setNewGameLink] = useState('');
    const [newGameImageUrl, setNewGameImageUrl] = useState('');
    const [newGameDesc, setNewGameDesc] = useState('');
    const [showAllGenres, setShowAllGenres] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);

    const [isMuted, setIsMuted] = useState(soundService.isMuted());
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<GameSuggestion[]>([]);
    const [isSearchingAutocomplete, setIsSearchingAutocomplete] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const unsubMute = soundService.onMuteChange(setIsMuted);
        return () => unsubMute();
    }, []);

    const handleTitleChange = async (val: string) => {
        setNewGameTitle(val);
        if (val.trim().length >= 1) {
            setIsSearchingAutocomplete(true);
            try {
                const results = await searchGamesAutocomplete(val);
                setAutocompleteSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (e) {
                setAutocompleteSuggestions([]);
            } finally {
                setIsSearchingAutocomplete(false);
            }
        } else {
            setAutocompleteSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (suggestion: GameSuggestion) => {
        setNewGameTitle(suggestion.title);
        setNewGameDesc(suggestion.description);
        setNewGameImageUrl(suggestion.imageUrl);
        setNewGameGenre(suggestion.genre);
        setNewGamePlatforms(suggestion.platforms);
        setNewGameLink(suggestion.link);
        setShowSuggestions(false);
        soundService.playAutocompleteSelect();
    };

    useEffect(() => {
        if (code) {
            cleanupRoomMembers(code);
            joinRoom(code, currentUser).catch(console.error);
            const unsubPresence = setupRoomPresence(code, currentUser);
            const unsub = subscribeToRoom(code, (updatedRoom) => {
                if (!updatedRoom) { navigate('/'); return; }
                setRoom(updatedRoom);
            });
            return () => { 
                unsub(); 
                unsubPresence();
                leaveRoomCleanly(code, currentUser); 
            };
        }
    }, [code, navigate, currentUser.id, currentUser.isGuest]);

    // Filtrado y Ordenado de Juegos (CORREGIDO)
    const filteredGames = useMemo(() => {
        if (!room?.gameQueue) return [];
        let list = [...room.gameQueue];
        
        if (activeFilter === 'ALL') {
            return list.sort((a, b) => a.title.localeCompare(b.title));
        }
        if (activeFilter === 'VOTED') {
            return list.sort((a, b) => getVotesCount(b.votedBy) - getVotesCount(a.votedBy));
        }
        if (activeFilter === 'RECENT') {
            return list.sort((a, b) => {
                const timeA = a.id.includes('custom-') ? parseInt(a.id.split('-')[1]) : 0;
                const timeB = b.id.includes('custom-') ? parseInt(b.id.split('-')[1]) : 0;
                return timeB - timeA;
            });
        }
        return list;
    }, [room?.gameQueue, activeFilter]);

    // Calcular Podio de Colaboradores (Sidebar) - Excluyendo autovoto y con pedestales anchos
    const contributorPodium = useMemo(() => {
        if (!room?.gameQueue || !room?.members) return [];
        const scores: Record<string, number> = {};
        
        room.gameQueue.forEach(game => {
            if (!game.proposedBy) return;
            const proposerId = game.proposedBy;
            let externalVotes = 0;
            if (game.votedBy) {
                if (Array.isArray(game.votedBy)) {
                    externalVotes = game.votedBy.filter(voterId => voterId !== proposerId).length;
                } else {
                    externalVotes = Object.keys(game.votedBy).filter(voterId => voterId !== proposerId && (game.votedBy as any)[voterId]).length;
                }
            }
            scores[proposerId] = (scores[proposerId] || 0) + externalVotes;
        });

        return Object.entries(scores)
            .map(([userId, score]) => {
                const member = room.members.find(m => m.id === userId);
                return { member, score };
            })
            .filter(item => item.member && item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }, [room?.gameQueue, room?.members]);

    // Helper para verificar presencia real en tiempo real
    const checkIsMemberOnline = (userId: string, isOnlineFlag?: boolean) => {
        if (userId === currentUser.id) return true;
        if (room?.activePresence) {
            return !!room.activePresence[userId];
        }
        return isOnlineFlag === true;
    };

    // FILTRADO DE MIEMBROS:
    // 1. Invitados (isGuest: true): ÚNICAMENTE aparecen si están online (o si es el propio currentUser).
    // 2. Usuarios con sesión iniciada (!isGuest): Aparecen siempre (tanto online como offline).
    const members = useMemo(() => {
        if (!room?.members) return [];
        return room.members.filter(m => {
            if (m.isGuest) {
                return checkIsMemberOnline(m.id, m.isOnline);
            }
            return true;
        });
    }, [room?.members, room?.activePresence, currentUser.id]);

    // ORDENAMIENTO DE SQUAD MEMBERS:
    // 1. Usuarios conectados y READY al principio.
    // 2. Usuarios conectados sin READY a continuación.
    // 3. Usuarios desconectados (solo registrados) al final.
    const sortedMembers = useMemo(() => {
        return [...members].sort((a, b) => {
            const aOnline = checkIsMemberOnline(a.id, a.isOnline);
            const bOnline = checkIsMemberOnline(b.id, b.isOnline);
            if (aOnline !== bOnline) return aOnline ? -1 : 1;
            if (a.isReady !== b.isReady) return a.isReady ? -1 : 1;
            return (a.nickname || a.alias || "").localeCompare(b.nickname || b.alias || "");
        });
    }, [members, room?.activePresence, currentUser.id]);

    const handleCopyCode = () => {
        if (code) {
            soundService.playPop();
            navigator.clipboard.writeText(code);
            showAlert({ message: t('lobby.copied'), type: 'success' });
        }
    };

    const handleLeave = () => { 
        soundService.playPop();
        if (code) leaveRoomCleanly(code, currentUser); 
        navigate('/'); 
    };

    const handleVote = (id: string) => {
        if (!room) return;
        if (currentUser.isGuest) {
            soundService.playPop();
            showAlert({
                title: t('lobby.guestVoteRestrictedTitle'),
                message: t('lobby.guestVoteRestricted'),
                type: 'info',
                confirmText: t('auth.login'),
                onConfirm: () => openLoginModal('auth.login')
            });
            return;
        }
        const game = room.gameQueue.find(g => g.id === id);
        const currentlyVoted = game?.votedBy 
            ? (Array.isArray(game.votedBy) ? game.votedBy.includes(currentUser.id) : !!game.votedBy[currentUser.id]) 
            : false;
        soundService.playVote(!currentlyVoted);
        voteForGame(room.code, id, currentUser.id, currentUser.isGuest);
    };

    const handleReady = () => {
        if (!room) return;
        const currentMember = room.members?.find(m => m.id === currentUser.id);
        const currentIsReady = currentMember ? currentMember.isReady : currentUser.isReady;
        soundService.playReady(!currentIsReady);
        toggleUserReadyState(room.code, currentUser.id);
    };

    const handleSendMsg = (txt: string) => {
        if (!room) return;
        if (currentUser.isGuest) {
            openLoginModal('auth.login');
            return;
        }
        soundService.playMessageSent();
        sendChatMessage(room.code, { id: `${Date.now()}`, userId: currentUser.id, userName: currentUser.nickname || currentUser.alias, content: txt, timestamp: Date.now() }, currentUser.isGuest);
    };

    const handleStartActivity = (type: 'roulette' | 'voting') => {
        soundService.playPop();
        if (room) startReadyActivity(room.code, type);
    };

    const handleReadySuggestion = (game: Game) => {
        soundService.playPop();
        if (room) submitReadySuggestion(room.code, currentUser.id, currentUser.nickname || currentUser.alias, game.id, game.title);
    };

    const handleAdvancePhase = () => {
        if (!room || !room.readySession) return;
        const suggestionsCount = Object.keys(room.readySession.suggestions || {}).length;
        if (suggestionsCount < 2) {
            soundService.playPop();
            showAlert({ message: t('lobby.readyMinSuggestions'), type: 'info' });
            return;
        }
        if (room.readySession.type === 'roulette') {
            setIsSpinning(true);
            let delay = 60;
            let elapsed = 0;
            const tick = () => {
                soundService.playRouletteTick(1 + Math.random() * 0.15);
                elapsed += delay;
                delay = Math.min(delay * 1.08, 400);
                if (elapsed < 2800) {
                    setTimeout(tick, delay);
                }
            };
            tick();

            setTimeout(() => {
                resolveReadyActivity(room.code);
                setIsSpinning(false);
                soundService.playVictory();
            }, 3000);
        } else {
            resolveReadyActivity(room.code);
            soundService.playVictory();
        }
    };

    const handleSaveGame = async () => {
        if (!newGameTitle || !room) return;
        if (currentUser.isGuest) {
            showAlert({ message: t('lobby.guestAddGameRestricted'), type: 'info' });
            openLoginModal('auth.proposeReason');
            return;
        }
        setIsUploading(true);
        try {
            const gameData: Partial<Game> = { 
                title: newGameTitle, 
                description: newGameDesc || t('lobby.noDesc'), 
                imageUrl: newGameImageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', 
                genre: newGameGenre, 
                platforms: newGamePlatforms,
                link: newGameLink 
            };
            if (editingGameId) await updateGameInRoom(room.code, editingGameId, gameData, currentUser.id);
            else {
                const newGame: Game = { ...gameData as Game, id: `custom-${Date.now()}`, votedBy: [currentUser.id], tags: ['Custom'], status: 'approved', proposedBy: currentUser.id, comments: {} };
                await addGameToRoom(room.code, newGame, currentUser);
            }
            closeModal();
        } catch(e) { showAlert({ message: t('common.error'), type: 'error' }); } finally { setIsUploading(false); }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedGame || !room) return;
        if (currentUser.isGuest) {
            openLoginModal('auth.commentReason');
            return;
        }
        const comment: Comment = { id: `comment-${Date.now()}`, userId: currentUser.id, userName: currentUser.nickname || currentUser.alias, text: newComment, timestamp: Date.now() };
        await addCommentToGame(room.code, selectedGame.id, comment, currentUser.isGuest);
        setNewComment('');
        const updatedComments = { ...(selectedGame.comments || {}), [comment.id]: comment };
        setSelectedGame({ ...selectedGame, comments: updatedComments });
    };

    const handleDeleteGame = async (gameId: string) => {
        if (!room || currentUser.isGuest) return;
        showAlert({
            title: t('lobby.removeGameTitle'),
            message: t('lobby.removeGameConfirm'),
            type: 'confirm',
            onConfirm: async () => {
                await removeGameFromRoom(room.code, gameId, currentUser.id, currentUser.isAdmin || false);
                if (selectedGame?.id === gameId) setSelectedGame(null);
            }
        });
    };

    const togglePlatform = (p: Platform) => {
        setNewGamePlatforms(prev => 
            prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
        );
    };

    const closeModal = () => { 
        soundService.playPop();
        setIsGameModalOpen(false); 
        setEditingGameId(null); 
        setNewGameTitle(''); 
        setNewGameImageUrl(''); 
        setNewGameLink(''); 
        setNewGameDesc(''); 
        setNewGamePlatforms([Platform.PC]);
        setShowAllGenres(false);
        setAutocompleteSuggestions([]);
        setShowSuggestions(false);
    };

    const openEditModal = (game: Game) => {
        setEditingGameId(game.id);
        setNewGameTitle(game.title);
        setNewGameDesc(game.description);
        setNewGameImageUrl(game.imageUrl);
        setNewGameGenre(game.genre);
        // Fix: Changed setNewLibLink to setNewGameLink as the former was not defined in this scope.
        setNewGameLink(game.link || '');
        setNewGamePlatforms(game.platforms || [Platform.PC]);
        setIsGameModalOpen(true);
    };

    if (!room) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48}/></div>;

    const allMembers = room.members || [];
    const currentUserMember = allMembers.find(m => m.id === currentUser.id);
    const isUserReady = !!currentUserMember?.isReady;

    const suggestions = room.readySession?.suggestions || {};
    const genres = Object.values(GameGenre);
    const visibleGenres = showAllGenres ? genres : genres.slice(0, 5);

    const getProposerName = (id?: string) => {
        if (!id) return t('common.anonymous');
        if (id === 'AI') return t('common.system');
        const member = members.find(m => m.id === id);
        return member?.nickname || member?.alias || id;
    };

    return (
        <div className="h-screen bg-background text-gray-100 flex overflow-hidden font-sans relative">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-surface border-r border-gray-800 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <img 
                                src="/favicon.svg" 
                                alt="TeamLobby" 
                                className="w-7 h-7 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform shrink-0" 
                            />
                            <span className="font-black text-lg tracking-tighter uppercase italic text-white group-hover:text-primary transition-colors">
                                TeamLobby
                            </span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white shrink-0"><X size={18}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                        <nav className="space-y-1.5">
                            <button onClick={() => { setView('LOBBY'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'LOBBY' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-800'}`}>
                                <LayoutGrid size={20}/> <span className="text-[10px] uppercase font-black tracking-widest">{t('lobby.viewLobby')}</span>
                            </button>
                            <button onClick={() => { setView('READY'); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${view === 'READY' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-800'}`}>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={20}/> <span className="uppercase tracking-widest text-[10px] font-black">{t('lobby.ready')}</span>
                                </div>
                                {room.readySession?.active && <div className="w-2 h-2 rounded-full bg-secondary animate-ping shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                            </button>
                        </nav>

                        {/* PODIO DE COLABORADORES (AJUSTE ESTÉTICO FINAL) */}
                        {contributorPodium.length > 0 && (
                            <div className="px-2 space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                    <Trophy size={12} className="text-yellow-500" />
                                    <span>{t('lobby.squadLeaders')}</span>
                                </div>
                                <div className="flex items-end justify-center gap-3 bg-gray-900/30 rounded-2xl p-6 border border-gray-800/60 shadow-inner min-h-[140px]">
                                    {[1, 0, 2].map(idx => {
                                        const item = contributorPodium[idx];
                                        if (!item) return <div key={idx} className="w-16 opacity-0" />;
                                        
                                        const isFirst = idx === 0;
                                        const rankColor = isFirst ? '#fbbf24' : (idx === 1 ? '#94a3b8' : '#b45309');
                                        const pedestalHeight = isFirst ? 'h-12' : (idx === 1 ? 'h-8' : 'h-6');

                                         return (
                                            <div 
                                                key={item.member!.id} 
                                                onClick={() => {
                                                    if (!item.member!.id.startsWith('guest_')) {
                                                        navigate(`/showcase/${item.member!.id}`);
                                                    }
                                                }}
                                                className="flex flex-col items-center group relative cursor-pointer"
                                                title={!item.member!.id.startsWith('guest_') ? t('friends.viewShowcase') : undefined}
                                            >
                                                {/* Avatar sobre la barra */}
                                                <div className="relative mb-[-2px] z-10 transition-transform group-hover:translate-y-[-2px] duration-300">
                                                    <img 
                                                        src={item.member!.avatarUrl} 
                                                        className="w-12 h-12 rounded-full border-2 shadow-2xl group-hover:scale-105 transition-transform" 
                                                        style={{borderColor: rankColor}} 
                                                    />
                                                    <div 
                                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg border border-background"
                                                        style={{backgroundColor: rankColor}}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                                {/* Barra Ancha (Pedestal Geométrico) */}
                                                <div 
                                                    className={`w-16 ${pedestalHeight} rounded-t-md transition-all shadow-lg flex flex-col items-center justify-center border-t-2`}
                                                    style={{
                                                        background: `linear-gradient(to bottom, ${rankColor}44, ${rankColor}11)`,
                                                        borderColor: rankColor
                                                    }}
                                                >
                                                    <span className="text-[10px] font-black text-white drop-shadow-md opacity-80">{item.score}</span>
                                                </div>
                                                <span className="text-[7px] font-black text-gray-500 mt-2 uppercase truncate max-w-[64px] text-center opacity-60 group-hover:opacity-100 group-hover:text-primary transition-colors">{item.member!.nickname || item.member!.alias}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="px-2 flex items-center justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                <span>{t('lobby.squadMembers')}</span>
                                <span className="text-[9px] text-gray-500 font-bold">
                                    {sortedMembers.filter(m => checkIsMemberOnline(m.id, m.isOnline)).length} {t('lobby.onlineCount')}
                                </span>
                            </div>
                            {sortedMembers.map(m => {
                                const isOnline = checkIsMemberOnline(m.id, m.isOnline);
                                const isRegistered = !m.id.startsWith('guest_');

                                return (
                                    <div 
                                        key={m.id} 
                                        onClick={() => {
                                            if (isRegistered) {
                                                navigate(`/showcase/${m.id}`);
                                            }
                                        }}
                                        title={isRegistered ? t('friends.viewShowcase') : undefined}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all group ${
                                            isRegistered ? 'cursor-pointer hover:border-primary/50' : ''
                                        } ${
                                            !isOnline 
                                                ? 'bg-black/10 border-gray-800/40 opacity-50' 
                                                : m.isReady 
                                                    ? 'bg-green-500/10 border-green-500/30' 
                                                    : 'bg-black/20 border-gray-800'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <img 
                                                src={m.avatarUrl} 
                                                className={`w-8 h-8 rounded-full border ${
                                                    !isOnline 
                                                        ? 'border-gray-800 grayscale opacity-60' 
                                                        : m.isReady 
                                                            ? 'border-green-500' 
                                                            : 'border-gray-700'
                                                }`} 
                                                alt={m.nickname || m.alias}
                                            />
                                            <div 
                                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface ${
                                                    isOnline 
                                                        ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]' 
                                                        : 'bg-gray-600'
                                                }`} 
                                                title={isOnline ? t('common.online') : t('common.offline')}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                                            <p className={`text-xs font-bold truncate group-hover:text-primary transition-colors ${
                                                !isOnline 
                                                    ? 'text-gray-500' 
                                                    : m.isReady 
                                                        ? 'text-green-500' 
                                                        : 'text-gray-300'
                                            }`}>
                                                {m.nickname || m.alias}
                                            </p>
                                            {isRegistered && (
                                                <Trophy size={11} className="text-gray-600 group-hover:text-yellow-400 transition-colors shrink-0" />
                                            )}
                                        </div>
                                        {isOnline ? (
                                            m.isReady && <CheckCircle2 size={13} className="text-green-500 animate-pulse shrink-0" />
                                        ) : (
                                            <span className="text-[7px] font-black text-gray-600 uppercase tracking-wider bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 shrink-0">
                                                {t('common.offline')}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-800 space-y-2">
                        {currentUser.isGuest && (
                            <button 
                                onClick={() => openLoginModal()} 
                                className="w-full py-3 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm mb-2"
                            >
                                <LogIn size={13} /> {t('auth.login')}
                            </button>
                        )}
                        <button onClick={handleReady} className={`w-full py-4 rounded-xl text-xs font-black tracking-widest transition-all mb-3 ${isUserReady ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-gray-800 text-gray-500'}`}>
                            {isUserReady ? t('lobby.ready') : t('lobby.setReady')}
                        </button>
                        <button onClick={handleLeave} className="w-full py-2 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black uppercase text-gray-400">{t('lobby.leave')}</button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-background relative">
                <header className="h-14 sm:h-16 border-b border-gray-800 flex items-center justify-between px-3 sm:px-6 bg-surface/50 backdrop-blur-xl sticky top-0 z-30 gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg shrink-0 text-gray-300"><Menu size={20}/></button>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-lg font-black text-white truncate max-w-[120px] xs:max-w-[160px] sm:max-w-xs md:max-w-md">{room.name}</h2>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-[9px] sm:text-[10px] font-mono font-black text-primary/80">#{room.code}</span>
                                <button onClick={handleCopyCode} className="p-1 sm:p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all"><Copy size={12}/></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        <button 
                            onClick={() => soundService.toggleMute()} 
                            className="p-2 sm:p-2.5 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all shrink-0 active:scale-95"
                            title={isMuted ? t('common.soundUnmute') : t('common.soundMute')}
                        >
                            {isMuted ? <VolumeX size={18} className="text-red-400"/> : <Volume2 size={18} className="text-emerald-400"/>}
                        </button>
                        {currentUser.isGuest && (
                            <button 
                                onClick={() => openLoginModal()} 
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-white/10 active:scale-95 shrink-0"
                                title={t('auth.login')}
                            >
                                <LogIn size={13}/>
                                <span className="hidden sm:inline">{t('auth.login')}</span>
                            </button>
                        )}
                        {view === 'LOBBY' && (
                            <button 
                                onClick={() => { 
                                    soundService.playPop(); 
                                    if (currentUser.isGuest) {
                                        openLoginModal('auth.proposeReason');
                                    } else {
                                        setIsGameModalOpen(true); 
                                    }
                                }} 
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 shrink-0"
                            >
                                <Plus size={16}/> <span className="hidden sm:inline">{t('lobby.addGame')}</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {view === 'LOBBY' ? (
                        <div className="space-y-8 max-w-7xl mx-auto w-full pb-32">
                            {/* BANNER INFORMATIVO PARA INVITADOS */}
                            {currentUser.isGuest && showGuestBanner && (
                                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/20 rounded-xl text-primary shrink-0">
                                            <Sparkles size={16}/>
                                        </div>
                                        <p className="text-xs font-bold text-gray-300">
                                            {t('lobby.guestBannerText')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button 
                                            onClick={() => openLoginModal()} 
                                            className="px-4 py-2 bg-primary hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                                        >
                                            {t('auth.login')}
                                        </button>
                                        <button 
                                            onClick={() => setShowGuestBanner(false)} 
                                            className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors"
                                            title={t('lobby.hide')}
                                        >
                                            <X size={14}/>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* SISTEMA DE FILTROS REAL */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
                                <div className="flex p-1 bg-black/40 border border-gray-800 rounded-xl w-fit">
                                    <button onClick={() => setActiveFilter('ALL')} className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${activeFilter === 'ALL' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>{t('lobby.filterAll')}</button>
                                    <button onClick={() => setActiveFilter('VOTED')} className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${activeFilter === 'VOTED' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>{t('lobby.filterVoted')}</button>
                                    <button onClick={() => setActiveFilter('RECENT')} className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${activeFilter === 'RECENT' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>{t('lobby.filterRecent')}</button>
                                </div>
                                <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-2">{room.gameQueue.length} {t('lobby.gamesInQueue')}</div>
                            </div>
                            
                            {/* GRID DE JUEGOS SIN PODIO REPETITIVO */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
                                {filteredGames.map(g => (
                                    <GameCard key={g.id} game={g} currentUserId={currentUser.id} isGuest={currentUser.isGuest} onVote={handleVote} onOpenDetails={setSelectedGame} isVotingEnabled={true} />
                                ))}
                                {room.gameQueue.length === 0 && (
                                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-gray-700 bg-surface/10 border-2 border-dashed border-gray-800 rounded-[3rem]">
                                        <div className="p-5 bg-gray-900/50 rounded-full mb-4 border border-gray-800 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                                            <img src="/favicon.svg" alt="" className="w-12 h-12 opacity-30 drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
                                        </div>
                                        <p className="font-black text-xs uppercase tracking-[0.3em]">{t('lobby.queueEmpty')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                             {!room.readySession || room.readySession.status === 'idle' ? (
                                <div className="text-center space-y-10">
                                    <div className="space-y-4">
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mx-auto">
                                            <Sparkles size={48} className="text-primary"/>
                                        </div>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t('lobby.readyCommandTitle')}</h3>
                                        <p className="text-gray-500 font-bold max-w-md mx-auto text-sm leading-relaxed italic">{t('lobby.readyCommandSub')}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
                                        <button onClick={() => handleStartActivity('roulette')} className="group p-8 bg-surface border-2 border-gray-800 rounded-[2.5rem] hover:border-primary/50 transition-all text-left space-y-4 shadow-xl">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Dices size={28}/></div>
                                            <div>
                                                <h4 className="font-black text-lg text-white uppercase italic tracking-tighter">{t('lobby.roulette')}</h4>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{t('lobby.rouletteSub')}</p>
                                            </div>
                                        </button>
                                        <button onClick={() => handleStartActivity('voting')} className="group p-8 bg-surface border-2 border-gray-800 rounded-[2.5rem] hover:border-secondary/50 transition-all text-left space-y-4 shadow-xl">
                                            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"><Vote size={28}/></div>
                                            <div>
                                                <h4 className="font-black text-lg text-white uppercase italic tracking-tighter">{t('lobby.voting')}</h4>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{t('lobby.votingSub')}</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                             ) : (
                                <div className="w-full bg-surface border border-gray-800 rounded-[3rem] p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
                                                {room.readySession.type === 'roulette' ? <Dices className="text-primary"/> : <Vote className="text-secondary"/>}
                                            </div>
                                            <h3 className="text-xl font-black italic uppercase text-white">{room.readySession.type === 'roulette' ? t('lobby.roulette') : t('lobby.voting')}</h3>
                                        </div>
                                        <button onClick={() => resetReadyActivity(room.code)} className="p-3 hover:bg-gray-800 rounded-xl transition-all"><RefreshCcw size={20}/></button>
                                    </div>
                                    
                                    {room.readySession.status === 'collecting' && (
                                        <div className="space-y-10">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('lobby.proposals')}</h4>
                                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                        {room.gameQueue.map(g => {
                                                            const isSuggested = suggestions[currentUser.id]?.gameId === g.id;
                                                            return (
                                                                <button key={g.id} onClick={() => handleReadySuggestion(g)} className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left text-xs font-black ${isSuggested ? 'bg-primary/20 border-primary text-white' : 'bg-black/20 border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                                                                    {g.title} {isSuggested && <CheckCircle2 size={16} className="text-primary"/>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('lobby.onStage')} ({Object.keys(suggestions).length})</h4>
                                                    <div className="space-y-2">
                                                        {Object.values(suggestions).map((s: any) => (
                                                            <div key={s.userName + s.gameId} className="p-4 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between text-[11px] font-black italic">
                                                                <span className="text-primary uppercase">{s.userName}</span>
                                                                <span className="text-gray-400">{s.gameTitle}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={handleAdvancePhase} disabled={isSpinning || Object.keys(suggestions).length < 2} className="w-full py-6 bg-white text-black font-black uppercase rounded-[2rem] flex items-center justify-center gap-3 shadow-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                                                {isSpinning ? <Loader2 className="animate-spin" /> : <PlayCircle size={20}/>}
                                                {t('lobby.processActivity')}
                                            </button>
                                        </div>
                                    )}

                                    {room.readySession.status === 'results' && (
                                        <div className="text-center py-12 space-y-8">
                                            <div className="relative inline-block">
                                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                                <Trophy size={80} className="text-yellow-500 mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] relative z-10"/>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">{t('lobby.finalResult')}</p>
                                                <h4 className="text-4xl font-black italic uppercase text-white drop-shadow-xl tracking-tighter">
                                                    {Array.isArray(room.readySession.winner) ? t('lobby.technicalTie') : (room.gameQueue.find(g => g.id === room.readySession?.winner)?.title || t('lobby.chosenByDestiny'))}
                                                </h4>
                                            </div>
                                            <button onClick={() => resetReadyActivity(room.code)} className="px-12 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">{t('lobby.restart')}</button>
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>
                    )}
                </div>

                <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end gap-4">
                    {isChatOpen && (
                        <div className="w-[calc(100vw-3rem)] sm:w-[400px] bg-surface/95 backdrop-blur-2xl border border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[500px] md:h-[600px] animate-in slide-in-from-bottom-10">
                            <Chat messages={room.chatHistory} currentUser={currentUser} onSendMessage={handleSendMsg} onReceiveMessage={() => {}} />
                        </div>
                    )}
                    <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-background ${isChatOpen ? 'bg-gray-900 text-white' : 'bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}>
                        {isChatOpen ? <X size={28}/> : <MessageCircle size={28}/>}
                    </button>
                </div>
            </main>

            {selectedGame && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
                    <div className="bg-surface border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95">
                        <button onClick={() => setSelectedGame(null)} className="absolute top-6 right-6 z-[60] p-3 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all border border-white/10 shadow-lg"><X size={24}/></button>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="relative w-full h-[220px] md:h-[320px] bg-gray-900">
                                <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-3xl scale-125" style={{ backgroundImage: `url(${selectedGame.imageUrl})` }}/>
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img src={selectedGame.imageUrl} className="h-full w-auto object-contain max-w-full drop-shadow-2xl py-6" alt={selectedGame.title}/>
                                </div>
                                <div className="absolute bottom-6 left-8">
                                    <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">{selectedGame.title}</h3>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-primary font-black uppercase text-[9px] bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{t(`genre.${selectedGame.genre}` as TranslationKey)}</span>
                                        <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg border border-gray-800 shadow-inner">
                                            {selectedGame.platforms.map(p => <PlatformIcon key={p} p={p} />)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row">
                                <div className="flex-1 p-6 md:p-8 space-y-8">
                                    <div className="space-y-3">
                                        <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Info size={12}/> {t('lobby.summary')}</h4>
                                        <p className="text-gray-300 text-sm italic leading-relaxed bg-black/30 p-6 rounded-2xl border border-gray-800/50">"{selectedGame.description || t('lobby.noDesc')}"</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12}/> {t('lobby.comments')}</h4>
                                        <div className="space-y-3">
                                            {Object.values(selectedGame.comments || {}).length === 0 ? (
                                                <div className="p-8 border border-dashed border-gray-800 rounded-2xl text-center">
                                                    <p className="text-[9px] text-gray-700 italic font-black uppercase tracking-widest">{t('lobby.noComments')}</p>
                                                </div>
                                            ) : (
                                                Object.values(selectedGame.comments || {}).map(c => (
                                                    <div key={c.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50 group/comment">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[9px] font-black text-primary uppercase italic">{c.userName}</span>
                                                            <span className="text-[8px] text-gray-700 font-bold">{new Date(c.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-300 leading-relaxed italic">"{c.text}"</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {currentUser.isGuest ? (
                                            <div 
                                                onClick={() => openLoginModal('auth.commentReason')}
                                                className="p-4 bg-black/40 border border-gray-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all group"
                                            >
                                                <span className="text-xs text-gray-500 font-bold group-hover:text-gray-300 transition-colors">{t('auth.commentPlaceholder')}</span>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-wider group-hover:underline">{t('auth.login')}</span>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 pt-2">
                                                <input value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary font-bold placeholder:text-gray-700" placeholder={t('lobby.addComment')}/>
                                                <button onClick={handleAddComment} className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-violet-600 transition-all"><Send size={18}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full lg:w-52 p-6 md:p-8 lg:border-l border-gray-800 space-y-6 bg-gray-900/10 shrink-0">
                                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{t('lobby.techInfo')}</h4>
                                    <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-3">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{t('lobby.proposedBy')}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-black text-[10px] text-primary italic">#</div>
                                            <span className="text-[11px] font-black text-white italic truncate" title={getProposerName(selectedGame.proposedBy)}>
                                                {getProposerName(selectedGame.proposedBy)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-3">
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{t('lobby.platforms')}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGame.platforms.map(p => (
                                                <div key={p} className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded-lg text-[9px] font-black text-gray-400">
                                                    <PlatformIcon p={p}/> {p}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center gap-4 shrink-0">
                            {view === 'LOBBY' && (
                                <button 
                                    onClick={() => handleVote(selectedGame.id)} 
                                    className={`flex-1 min-w-[120px] py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl ${
                                        currentUser.isGuest
                                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                            : hasUserVotedGame(selectedGame.votedBy, currentUser.id)
                                                ? 'bg-primary text-white shadow-primary/30'
                                                : 'bg-white text-black hover:bg-gray-200 shadow-xl'
                                    }`}
                                    title={currentUser.isGuest ? t('lobby.guestVoteRestricted') : undefined}
                                >
                                    {currentUser.isGuest ? (
                                        <>
                                            <Lock size={18} />
                                            {t('lobby.loginToVote')}
                                        </>
                                    ) : (
                                        <>
                                            <ThumbsUp size={18} className={hasUserVotedGame(selectedGame.votedBy, currentUser.id) ? 'fill-current' : ''}/>
                                            {hasUserVotedGame(selectedGame.votedBy, currentUser.id) ? t('lobby.voted') : t('lobby.vote')}
                                        </>
                                    )}
                                </button>
                            )}

                            {!currentUser.isGuest && (currentUser.isAdmin || selectedGame.proposedBy === currentUser.id) && view === 'LOBBY' && (
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(selectedGame)} className="p-4 bg-surface border border-gray-800 text-gray-400 hover:text-white rounded-2xl transition-all hover:bg-gray-800 shadow-xl" title={t('common.edit')}>
                                        <Edit3 size={18}/>
                                    </button>
                                    <button onClick={() => handleDeleteGame(selectedGame.id)} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-xl" title={t('common.delete')}>
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            )}

                            {selectedGame.link && (
                                <a href={selectedGame.link} target="_blank" rel="noreferrer" className="p-4 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all shadow-xl" title={t('lobby.viewStore')}>
                                    <ExternalLink size={18}/>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isGameModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <div className="bg-surface border border-gray-700 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/40">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">{editingGameId ? t('lobby.editProposal') : t('lobby.modalTitle')}</h3>
                            <button onClick={closeModal} className="p-2.5 hover:bg-gray-800 rounded-xl text-gray-500 hover:text-white transition-all"><X size={20}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div className="space-y-1 relative">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('lobby.gameTitle')}</label>
                                    <span className="text-[8px] font-black text-primary/80 uppercase tracking-widest flex items-center gap-1">
                                        <Sparkles size={10}/> {t('lobby.autocompleteHint')}
                                    </span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newGameTitle} 
                                        onChange={e => handleTitleChange(e.target.value)} 
                                        onFocus={() => { if (autocompleteSuggestions.length > 0) setShowSuggestions(true); }}
                                        className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-sm font-black focus:border-primary outline-none transition-all placeholder:text-gray-700 pr-10" 
                                        placeholder={t('lobby.autocompletePlace')}
                                    />
                                    {isSearchingAutocomplete && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="animate-spin text-primary"/>
                                        </div>
                                    )}
                                </div>

                                {showSuggestions && autocompleteSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-surface/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
                                        <div className="p-2 bg-gray-900/80 border-b border-gray-800 flex justify-between items-center px-3">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('lobby.suggestionsFound')}</span>
                                            <button type="button" onClick={() => setShowSuggestions(false)} className="text-gray-500 hover:text-white"><X size={12}/></button>
                                        </div>
                                        {autocompleteSuggestions.map((item, idx) => (
                                            <div
                                                key={item.title + idx}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="flex items-center gap-3 p-3 hover:bg-primary/20 border-b border-gray-800/40 last:border-none cursor-pointer transition-all group"
                                            >
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-12 h-8 object-cover rounded-lg bg-gray-900 shrink-0 border border-gray-800 group-hover:border-primary/50 transition-colors"
                                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="font-black text-xs text-white group-hover:text-primary transition-colors truncate">{item.title}</h5>
                                                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">{item.genre}</span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 truncate mt-0.5">{item.description}</p>
                                                </div>
                                                <div className="shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-black uppercase tracking-wider bg-primary/20 px-2 py-1 rounded-lg">{t('lobby.autofill')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('lobby.genre')}</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {visibleGenres.map(g => (
                                        <button 
                                            key={g} 
                                            onClick={() => setNewGameGenre(g)} 
                                            className={`px-2 py-2 rounded-lg text-[8px] font-black uppercase transition-all border ${newGameGenre === g ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' : 'bg-black/40 text-gray-500 border-gray-800'}`}
                                        >
                                            {t(`genre.${g}` as TranslationKey)}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setShowAllGenres(!showAllGenres)}
                                        className={`px-2 py-2 rounded-lg text-[8px] font-black uppercase transition-all border flex items-center justify-center gap-1 ${showAllGenres ? 'bg-gray-800 text-white border-gray-700' : 'bg-black/40 text-gray-500 border-gray-800'}`}
                                    >
                                        {showAllGenres ? <ChevronUp size={10}/> : <MoreHorizontal size={10}/>}
                                        {showAllGenres ? t('common.showLess') : t('common.showMore')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('lobby.platforms')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(Platform).map(p => (
                                        <button 
                                            key={p} 
                                            onClick={() => togglePlatform(p)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black transition-all border ${newGamePlatforms.includes(p) ? 'bg-secondary/20 text-secondary border-secondary shadow-lg shadow-secondary/10' : 'bg-black/40 text-gray-500 border-gray-800'}`}
                                        >
                                            <PlatformIcon p={p}/> {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('lobby.coverImage')}</label>
                                    <input type="text" value={newGameImageUrl} onChange={e => setNewGameImageUrl(e.target.value)} className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-primary transition-all placeholder:text-gray-800" placeholder="https://...jpg"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('lobby.gameLink')}</label>
                                    <input type="text" value={newGameLink} onChange={e => setNewGameLink(e.target.value)} className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-primary transition-all placeholder:text-gray-800" placeholder={t('lobby.gameLinkPlace')}/>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('lobby.gameDesc')}</label>
                                <textarea value={newGameDesc} onChange={e => setNewGameDesc(e.target.value)} className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-[10px] h-20 font-bold outline-none focus:border-primary transition-all resize-none placeholder:text-gray-800" placeholder={t('lobby.gameDescPlace')}/>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-900/60 flex gap-3 border-t border-gray-800">
                            <button onClick={closeModal} className="flex-1 py-3 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-all">{t('common.cancel')}</button>
                            <button onClick={handleSaveGame} disabled={isUploading || !newGameTitle} className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all">
                                {isUploading ? <Loader2 className="animate-spin mx-auto" size={16}/> : (editingGameId ? t('common.update') : t('lobby.publish'))}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lobby;
