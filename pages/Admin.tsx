
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, Loader2,
  Shield, Trash2, Ban,
  Save, Globe
} from 'lucide-react';
import { User, UserSummary, Room } from '../types';
import { 
  subscribeToAllUsers, getAllRooms, toggleBanUser,
  deleteRoom, toggleMuteUser,
  subscribeToSettings, updateSettings
} from '../services/roomService';
import { useLanguage } from '../services/i18n';
import { useAlert } from '../components/CustomModal';

interface AdminProps {
    currentUser: User;
}

const Admin: React.FC<AdminProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { showAlert } = useAlert();
    
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'rooms' | 'settings'>('users');
    
    const [communityHubCode, setCommunityHubCode] = useState("");
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const allRooms = await getAllRooms();
            setRooms(allRooms);
        } catch (e) {
            console.error("Error loading admin data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubUsers = subscribeToAllUsers(setUsers);
        const unsubSettings = subscribeToSettings((settings) => {
            if (settings && settings.communityHubCode) {
                setCommunityHubCode(settings.communityHubCode);
            }
        });

        loadData();
        return () => {
            unsubUsers();
            unsubSettings();
        };
    }, []);

    const handleDeleteRoom = async (code: string) => {
        showAlert({
            title: t('admin.deleteRoomTitle'),
            message: `${t('admin.deleteRoomConfirm')}${code}?`,
            type: 'confirm',
            onConfirm: async () => {
                await deleteRoom(code);
                loadData();
            }
        });
    };

    const handleMuteToggle = async (u: UserSummary) => {
        await toggleMuteUser(u.id, !u.isMuted);
    };

    const handleSaveSettings = async () => {
        if (!communityHubCode.trim()) return;
        setIsSavingSettings(true);
        try {
            await updateSettings({ communityHubCode: communityHubCode.toUpperCase() });
            showAlert({ message: t('admin.settingsUpdated'), type: 'success' });
        } catch (e) {
            showAlert({ message: t('admin.updateError'), type: 'error' });
        } finally {
            setIsSavingSettings(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-3 bg-surface hover:bg-gray-800 rounded-xl transition-colors border border-gray-800">
                            <ArrowLeft size={20}/>
                        </button>
                        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic uppercase">
                            <ShieldCheck className="text-yellow-500" size={32}/> {t('admin.dashboard')}
                        </h1>
                    </div>
                    
                    <nav className="flex bg-surface p-1 rounded-2xl border border-gray-800 shadow-xl flex-wrap justify-center md:justify-end">
                        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{t('admin.users')}</button>
                        <button onClick={() => setActiveTab('rooms')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'rooms' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{t('admin.rooms')}</button>
                        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{t('admin.settings')}</button>
                    </nav>
                </header>

                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={48}/>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t('admin.syncing')}</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {activeTab === 'users' && (
                            <div className="bg-surface border border-gray-800 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-900/50 text-[10px] font-black uppercase text-gray-500 border-b border-gray-800">
                                            <th className="px-6 py-5">{t('admin.user')}</th>
                                            <th className="px-6 py-5">{t('admin.status')}</th>
                                            <th className="px-6 py-5 text-center">{t('admin.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors text-xs">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <img src={u.avatarUrl} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800" />
                                                    <span className="font-black text-white">{u.nickname || u.alias}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1">
                                                        {u.isAdmin && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded uppercase font-black">Admin</span>}
                                                        {u.isBanned && <span className="text-[8px] bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded uppercase font-black">Banned</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    <button
                                                        onClick={() => showAlert({ message: `Admin roles se gestionan en Firebase: admins/${u.id}: true`, type: 'info' })}
                                                        className={`p-2 rounded-xl border ${u.isAdmin ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                                                        title="Gestionado desde admins/{uid}"
                                                    >
                                                        <Shield size={16}/>
                                                    </button>
                                                    <button onClick={() => toggleBanUser(u.id, !u.isBanned)} className={`p-2 rounded-xl border ${u.isBanned ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'}`}><Ban size={16}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'rooms' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rooms.map(r => (
                                    <div key={r.code} className="bg-surface border border-gray-800 rounded-[2rem] p-6 space-y-4 hover:border-primary/40 transition-all shadow-xl">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-white uppercase italic">{r.name}</h3>
                                                <span className="text-[10px] font-mono text-primary font-black">#{r.code}</span>
                                            </div>
                                            <button onClick={() => handleDeleteRoom(r.code)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                        </div>
                                        <div className="flex gap-3 text-[10px] font-black text-gray-500 uppercase">
                                            <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-gray-800">{r.members?.length || 0} {t('admin.membersCount')}</span>
                                            <span className="bg-black/30 px-3 py-1.5 rounded-lg border border-gray-800">{r.gameQueue?.length || 0} {t('admin.gamesCount')}</span>
                                        </div>
                                        <button onClick={() => navigate(`/room/${r.code}`)} className="w-full py-3 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all">{t('admin.viewRoom')}</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="bg-surface border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20"><Globe size={24}/></div>
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Community Hub</h3>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase">{t('admin.communityHubDesc')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-1">{t('admin.roomCode')}</label>
                                        <input type="text" value={communityHubCode} onChange={e => setCommunityHubCode(e.target.value)} className="w-full bg-black border border-gray-800 rounded-2xl py-5 px-6 font-black text-lg tracking-[0.5em] text-center focus:border-primary outline-none text-primary" placeholder="E.G. UC2PI" />
                                    </div>
                                    <button onClick={handleSaveSettings} disabled={isSavingSettings || !communityHubCode.trim()} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 shadow-xl active:scale-95">
                                        {isSavingSettings ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} {t('admin.updateHub')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
