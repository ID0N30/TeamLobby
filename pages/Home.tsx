
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Gamepad2, LogOut, ShieldCheck, Plus, Clock, Loader2, Ban, 
    Languages, Settings, Lock, Globe, Users, Trophy, ChevronRight, ThumbsUp,
    Volume2, VolumeX, LogIn
} from 'lucide-react';
import { User, RoomSummary, Room } from '../types';
import { createRoom, joinRoom, getActiveGuestCount, getUserRooms, getFeaturedRooms, subscribeToSettings } from '../services/roomService';
import { soundService } from '../services/soundService';
import { useLanguage } from '../services/i18n';
import { useAlert } from '../components/CustomModal';
import { useAuthModal } from '../components/LoginModal';

interface HomeProps {
    currentUser: User;
    onLogout: () => Promise<void>;
}

const Home: React.FC<HomeProps> = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();
    const { showAlert } = useAlert();
    const { openLoginModal } = useAuthModal();
    const [joinCode, setJoinCode] = useState('');
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [isRoomPrivate, setIsRoomPrivate] = useState(false);
    const [newRoomPassword, setNewRoomPassword] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    const [history, setHistory] = useState<RoomSummary[]>([]);
    const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
    const [communityHubCode, setCommunityHubCode] = useState("UC2PI");
    const [isMuted, setIsMuted] = useState(soundService.isMuted());

    useEffect(() => {
        const unsubMute = soundService.onMuteChange(setIsMuted);
        return () => unsubMute();
    }, []);

    useEffect(() => {
        if (!currentUser.isGuest) {
            getUserRooms(currentUser.id).then(setHistory);
        }
        
        getFeaturedRooms(4).then(rooms => {
            setFeaturedRooms(rooms);
            setIsLoadingFeatured(false);
        });

        const unsubSettings = subscribeToSettings((settings) => {
            if (settings && settings.communityHubCode) {
                setCommunityHubCode(settings.communityHubCode);
            }
        });

        return () => unsubSettings();
    }, [currentUser]);

    const handleLogout = async () => {
        await onLogout();
    };

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return showAlert({ message: t('home.enterRoomNameError'), type: 'error' });
        if (isRoomPrivate && !newRoomPassword) return showAlert({ message: t('home.enterPasswordError'), type: 'error' });
        
        setIsCreatingRoom(true);
        try {
            const code = await createRoom(currentUser, newRoomName, isRoomPrivate ? newRoomPassword : undefined);
            setShowCreateModal(false);
            navigate(`/room/${code}`);
        } catch(e: any) {
            console.error('[Home] Error al crear sala:', e);
            showAlert({ message: e?.message || t('common.error'), type: 'error' });
        } finally {
            setIsCreatingRoom(false);
        }
    };

    const handleJoinRoom = async (code: string, password?: string, isCommunityHub: boolean = false) => {
        const targetCode = (code || '').trim().toUpperCase();
        if (!targetCode) return;
        
        let attemptPassword = password;
        if (!attemptPassword) {
            const histItem = history.find(h => h.code === targetCode);
            if (histItem && histItem.savedPassword) {
                attemptPassword = histItem.savedPassword;
            }
        }

        setIsJoiningRoom(true);
        try {
            let userToJoin = currentUser;

            if (currentUser.isGuest) {
                const guestCount = await getActiveGuestCount(targetCode).catch(() => 0);
                const guestNumber = guestCount + 1;
                const numberedAlias = `${t('common.guest')} ${guestNumber}`;
                userToJoin = { ...currentUser, alias: numberedAlias };
                sessionStorage.setItem("guestAlias", numberedAlias);
            }

            const result = await joinRoom(targetCode, userToJoin, attemptPassword, isCommunityHub || targetCode === "UC2PI");
            if (result.success) {
                navigate(`/room/${targetCode}`);
            } else if (result.message === "Invalid Password") {
                showAlert({
                    title: t('home.privateLobbyTitle'),
                    message: attemptPassword 
                        ? t('home.passwordInvalidMsg') 
                        : t('home.passwordProtectedMsg'),
                    type: 'prompt',
                    confirmText: t('common.access'),
                    onConfirm: (val) => handleJoinRoom(targetCode, val, isCommunityHub)
                });
            } else {
                showAlert({ message: t('lobby.roomNotExist') || 'La sala no existe o ha expirado', type: 'error' });
            }
        } catch (e: any) {
            console.error('[Home] Error al unirse a sala:', e);
            showAlert({ message: e?.message || t('common.error'), type: 'error' });
        } finally {
            setIsJoiningRoom(false);
        }
    };

    if (currentUser.isBanned) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-danger p-6 text-center">
            <Ban size={64} className="mb-4" />
            <h1 className="text-3xl font-black mb-2 uppercase italic">{t('home.accessDenied')}</h1>
            <p className="text-gray-500 mb-8 font-bold">{t('home.restrictedAccount')}</p>
            <button onClick={handleLogout} className="px-10 py-4 bg-gray-900 border border-gray-800 text-white rounded-xl font-black uppercase tracking-widest">{t('home.signOut')}</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-gray-100 flex flex-col p-3 sm:p-4 md:p-8 relative overflow-x-hidden custom-scrollbar">
            <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/5 rounded-full blur-[100px] md:blur-[180px] pointer-events-none" />
            
            <header className="flex justify-between items-center mb-6 sm:mb-10 z-10 max-w-6xl mx-auto w-full bg-surface/30 backdrop-blur-xl p-2.5 sm:p-4 md:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-800/50 shadow-2xl gap-2">
                <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
                    {/* Banner horizontal oficial: visible en pantallas medianas y grandes (md+) */}
                    <img 
                        src="/teamlobby-banner.png" 
                        alt="TeamLobby" 
                        className="h-8 md:h-9 w-auto object-contain hidden md:block drop-shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:brightness-110 transition-all" 
                    />
                    {/* En pantallas móviles (< md): Icono de mando neón optimizado mobile-first */}
                    <div className="md:hidden flex items-center gap-2">
                        <img 
                            src="/favicon.svg" 
                            alt="TeamLobby" 
                            className="w-8 h-8 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-transform shrink-0" 
                        />
                        {/* El texto sólo se muestra si hay suficiente espacio horizontal (sm a md) */}
                        <span className="hidden sm:inline text-lg font-black italic tracking-tighter uppercase text-white">
                            TeamLobby
                        </span>
                    </div>
                </Link>
                
                <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-4 shrink-0">
                    <button 
                        onClick={() => soundService.toggleMute()} 
                        className="p-2 sm:p-2.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all shrink-0 active:scale-95"
                        title={isMuted ? t('common.soundUnmute') : t('common.soundMute')}
                    >
                        {isMuted ? <VolumeX size={18} className="text-red-400 sm:w-5 sm:h-5"/> : <Volume2 size={18} className="text-emerald-400 sm:w-5 sm:h-5"/>}
                    </button>

                    <button 
                        onClick={() => { soundService.playPop(); setLanguage(language === 'en' ? 'es' : 'en'); }} 
                        className="p-2 sm:p-2.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all shrink-0 active:scale-95"
                    >
                        <Languages size={18} className="sm:w-5 sm:h-5"/>
                    </button>
                    
                    {currentUser.isAdmin && (
                        <button 
                            onClick={() => navigate('/admin')} 
                            className="p-2 sm:p-2.5 bg-yellow-600/10 text-yellow-500 border border-yellow-600/30 rounded-xl hover:bg-yellow-600 hover:text-white transition-all shrink-0 active:scale-95"
                        >
                            <ShieldCheck size={18} className="sm:w-5 sm:h-5"/>
                        </button>
                    )}

                    {!currentUser.isGuest && (
                        <button 
                            onClick={() => navigate(`/showcase/${currentUser.id}`)} 
                            className="p-2 sm:p-2.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded-xl hover:bg-yellow-500 hover:text-black transition-all shrink-0 active:scale-95"
                            title={t('showcase.myShowcase')}
                        >
                            <Trophy size={18} className="sm:w-5 sm:h-5"/>
                        </button>
                    )}

                    {currentUser.isGuest && (
                        <button 
                            onClick={() => openLoginModal()} 
                            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-white text-black hover:bg-gray-200 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-white/10 active:scale-95 shrink-0"
                            title={t('auth.login')}
                        >
                            <LogIn size={14}/>
                            <span className="hidden sm:inline">{t('auth.login')}</span>
                        </button>
                    )}

                    <div className="flex items-center gap-1.5 sm:gap-3 bg-black/40 border border-gray-800 p-1 sm:p-1.5 pr-2 sm:pr-4 rounded-xl sm:rounded-2xl group transition-all hover:border-primary/50 shrink-0">
                        <div onClick={() => navigate('/profile')} className="cursor-pointer relative shrink-0">
                            <img src={currentUser.avatarUrl} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-800 border-2 border-transparent group-hover:border-primary transition-all" />
                            <div className="absolute -bottom-1 -right-1 bg-primary p-0.5 sm:p-1 rounded-md text-white shadow-lg"><Settings size={8}/></div>
                        </div>
                        <div className="text-sm hidden md:block cursor-pointer" onClick={() => navigate('/profile')}>
                            <p className="font-black leading-none group-hover:text-primary transition-colors">{currentUser.nickname || currentUser.alias}</p>
                            <p className="text-[10px] font-black text-gray-600 uppercase mt-1 tracking-widest">{currentUser.isGuest ? t('common.guest') : t('common.member')}</p>
                        </div>
                        <div className="w-px h-6 bg-gray-800 mx-2 hidden md:block"></div>
                        <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition-colors p-1 shrink-0"><LogOut size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
                <div className="lg:col-span-8 space-y-10">
                    <div 
                        onClick={() => handleJoinRoom(communityHubCode, undefined, true)}
                        className="relative bg-surface border-2 border-primary/20 hover:border-primary/60 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group cursor-pointer shadow-[0_0_50px_rgba(139,92,246,0.05)] transition-all duration-500"
                    >
                        <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-10 group-hover:opacity-25 transition-all duration-700 -rotate-12 group-hover:rotate-0 group-hover:scale-105">
                            <img src="/web-app-manifest-512x512.png" alt="" className="w-80 h-80 object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('home.globalExperience')}</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{t('home.communityLobby')}</h2>
                            <p className="text-gray-500 font-bold text-base mt-4 max-w-lg leading-relaxed italic">
                                {t('home.communityDesc')}
                            </p>
                            
                            <div className="mt-10 flex items-center gap-6">
                                <button className="bg-primary hover:bg-violet-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95">
                                    {t('home.joinNow')} <ChevronRight size={18}/>
                                </button>
                                <div className="hidden sm:flex items-center gap-2 text-gray-600 font-black text-[10px] uppercase tracking-widest">
                                    <Users size={14}/> {t('home.activeDiscovery')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black flex items-center gap-2 text-gray-600 uppercase tracking-[0.3em]">
                                <Trophy size={14} className="text-yellow-600"/> {t('home.featuredSquads')}
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {isLoadingFeatured ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="h-32 bg-surface animate-pulse rounded-[1.5rem] border border-gray-800" />
                                ))
                            ) : featuredRooms.length > 0 ? (
                                featuredRooms.map(room => {
                                    const nonSelfVotes = (room as any).popularityScore - ((room.members?.length || 0) * 5);
                                    return (
                                        <div 
                                            key={room.code}
                                            onClick={() => handleJoinRoom(room.code)}
                                            className="group bg-surface/40 border border-gray-800/60 p-6 rounded-[2rem] hover:border-primary/40 hover:bg-surface/60 transition-all cursor-pointer flex justify-between items-center relative overflow-hidden shadow-sm"
                                        >
                                            <div className="min-w-0 flex items-center gap-5">
                                                <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center text-gray-700 border border-gray-800 font-black italic text-lg group-hover:text-primary transition-colors">
                                                    #
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-white truncate text-base group-hover:text-primary transition-colors uppercase italic tracking-tight">{room.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest">Lobby: {room.code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0 z-10 gap-2">
                                                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full">
                                                    <Users size={10} className="text-gray-500"/>
                                                    <span className="text-[9px] font-black text-gray-400">{room.members?.length || 0}</span>
                                                </div>
                                                {nonSelfVotes > 0 && (
                                                     <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                                                        <ThumbsUp size={10} className="text-primary"/>
                                                        <span className="text-[9px] font-black text-primary">+{nonSelfVotes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-16 border-2 border-dashed border-gray-800/40 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-700 italic bg-surface/5">
                                    <Globe size={40} className="mb-4 opacity-5" />
                                    {t('home.noPublicSquads')}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-surface border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Plus size={100}/></div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{t('home.getStarted')}</h2>
                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">{t('home.subHeader')}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t('home.joinWithCode')}</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder={t('home.enterCode')} 
                                            value={joinCode} 
                                            onChange={(e) => setJoinCode(e.target.value)} 
                                            className="flex-1 bg-black/60 border border-gray-800 rounded-2xl px-4 py-4 text-center tracking-[0.3em] font-black text-lg uppercase focus:border-primary outline-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleJoinRoom(joinCode)} 
                                    disabled={isJoiningRoom || !joinCode} 
                                    className={`w-full py-4 rounded-2xl transition-all font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 border ${joinCode ? 'bg-white text-black hover:bg-gray-200 shadow-xl' : 'bg-gray-900 text-gray-700 border-gray-800 cursor-not-allowed'}`}
                                >
                                    {isJoiningRoom ? <Loader2 className="animate-spin" /> : t('home.joinBtn')}
                                </button>
                            </div>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="px-3 bg-surface text-gray-600">{t('common.or')}</span></div>
                            </div>

                            {!currentUser.isGuest ? (
                                <button onClick={() => setShowCreateModal(true)} className="w-full bg-primary hover:bg-violet-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 text-xs tracking-widest uppercase">
                                    <Plus size={20} /> {t('home.createBtn')}
                                </button>
                            ) : (
                                <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl text-center text-gray-500 text-[10px] font-black uppercase tracking-widest italic">{t('home.guestMode')}</div>
                            )}
                        </div>
                    </div>

                    {/* Tarjeta Destacada: Galería Gamer */}
                    <div 
                        onClick={() => {
                            if (currentUser.isGuest) {
                                openLoginModal('auth.login');
                            } else {
                                navigate(`/showcase/${currentUser.id}`);
                            }
                        }}
                        className="bg-gradient-to-br from-yellow-500/10 via-surface to-surface border border-yellow-500/20 hover:border-yellow-500/50 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer transition-all active:scale-98"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400">
                                <Trophy size={18} fill="currentColor"/>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Nuevo</span>
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                            {t('showcase.title')}
                        </h3>
                        <p className="text-gray-400 text-xs font-medium mt-1 leading-relaxed">
                            {t('showcase.subtitle')}. Registra dificultades, platinos y reta a tus amigos.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase text-yellow-400 tracking-wider">
                            <span>{t('showcase.myShowcase')}</span> <ChevronRight size={14} />
                        </div>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black flex items-center gap-2 text-gray-500 uppercase tracking-widest"><Clock size={16}/> {t('home.recent')}</h3>
                        </div>
                        
                        {history.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {history.map(hist => (
                                    <div 
                                        key={hist.code} 
                                        onClick={() => handleJoinRoom(hist.code)} 
                                        className="group bg-surface/50 border border-gray-800 p-4 rounded-2xl hover:border-primary/50 hover:bg-surface transition-all cursor-pointer flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-black/40 rounded-xl flex items-center justify-center text-primary border border-gray-800 font-black italic text-xs">#</div>
                                            <div className="min-w-0">
                                                <p className="font-black text-xs text-white truncate group-hover:text-primary transition-colors">{hist.name}</p>
                                                <p className="text-[9px] text-gray-600 font-mono uppercase mt-0.5">ROOM: {hist.code}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-black text-gray-700">{new Date(hist.lastVisited).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-32 border-2 border-dashed border-gray-800/50 rounded-2xl flex flex-col items-center justify-center text-gray-700 text-center p-4 bg-surface/10">
                                <p className="font-black text-[9px] uppercase tracking-widest">{t('home.noHistory')}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-surface border border-gray-700 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{t('home.modalTitle')}</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('home.modalSubtitle')}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t('home.roomName')}</label>
                                <input type="text" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" placeholder={t('home.roomNamePlace')}/>
                            </div>
                            
                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isRoomPrivate ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {isRoomPrivate ? <Lock size={18}/> : <ShieldCheck size={18}/>}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{isRoomPrivate ? t('home.private') : t('home.public')}</span>
                                </div>
                                <div onClick={() => setIsRoomPrivate(!isRoomPrivate)} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${isRoomPrivate ? 'bg-red-500' : 'bg-gray-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full transition-all absolute top-1 ${isRoomPrivate ? 'right-1' : 'left-1'}`}/>
                                </div>
                            </div>

                            {isRoomPrivate && (
                                 <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t('home.secretKey')}</label>
                                    <input type="password" value={newRoomPassword} onChange={e => setNewRoomPassword(e.target.value)} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary transition-all" placeholder={t('home.passwordPlace')}/>
                                 </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 rounded-2xl font-black text-xs text-gray-500 uppercase tracking-widest hover:bg-gray-800 transition-colors">{t('common.cancel')}</button>
                            <button onClick={handleCreateRoom} disabled={isCreatingRoom || !newRoomName} className="flex-1 py-4 rounded-2xl font-black text-xs bg-primary text-white uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                                {isCreatingRoom ? t('home.creating') : t('home.create')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
