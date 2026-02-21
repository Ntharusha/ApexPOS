import React, { useEffect, useState } from 'react';
import { Menu, Bell, LogOut, User, Wifi, WifiOff, ChevronDown, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ThemeToggle from '../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ShiftModal from '../common/ShiftModal';

const Header = () => {
    const { toggleSidebar, notifications, user, logout, theme, currentShift } = useStore();
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [shiftModalOpen, setShiftModalOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => { clearInterval(timer); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleColors: Record<string, string> = {
        super_admin: 'text-red-400',
        branch_admin: 'text-orange-400',
        manager: 'text-blue-400',
        cashier: 'text-emerald-400',
        accountant: 'text-purple-400',
        Admin: 'text-red-400',
        Technician: 'text-yellow-400',
    };
    const roleColor = roleColors[user?.role || ''] || 'text-primary';

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

    return (
        <header className="h-16 px-6 glass flex items-center justify-between sticky top-0 z-40 border-b border-white/5">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar}
                    className="p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-text transition-all">
                    <Menu size={20} />
                </button>

                {/* Sync Status */}
                <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isOnline
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                    {isOnline ? 'Online' : 'Offline'}
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <ThemeToggle />

                {/* Live Clock */}
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-mono text-primary text-sm font-black tracking-wider">
                        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>

                <div className="h-7 w-[1px] bg-white/10 mx-1" />

                {/* Notifications */}
                <button onClick={() => navigate('/notifications')}
                    className="relative p-2 hover:bg-white/5 rounded-xl text-text-muted hover:text-text transition-all">
                    <Bell size={20} />
                    {notifications > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-primary/40 animate-pulse">
                            {notifications}
                        </span>
                    )}
                </button>

                <div className="h-7 w-[1px] bg-white/10 mx-1" />

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(o => !o)}
                        className="flex items-center gap-2.5 hover:bg-white/5 rounded-2xl px-3 py-2 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-black text-text leading-tight">{user?.name || 'Admin'}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${roleColor}`}>
                                {user?.role || 'Admin'}
                            </p>
                        </div>
                        <ChevronDown size={14} className={`text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    className={`absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-surface border-white/10'}`}
                                >
                                    <div className="p-4 border-b border-text/10">
                                        <p className="font-black text-text text-sm">{user?.name}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${roleColor}`}>{user?.role}</p>
                                        {user?.branch_id && (
                                            <p className="text-[10px] text-text-muted mt-1">Branch: {user.branch_id}</p>
                                        )}
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => { setShiftModalOpen(true); setUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 text-text transition-all text-sm font-black"
                                        >
                                            <Clock size={16} className="text-primary" />
                                            {currentShift ? 'End Shift' : 'Start Shift'}
                                            {currentShift && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-sm font-black"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ShiftModal isOpen={shiftModalOpen} onClose={() => setShiftModalOpen(false)} />
        </header>
    );
};


export default Header;
