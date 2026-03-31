import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Lock, Mail, ArrowRight, Sun, Moon, Hash, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type LoginMode = 'password' | 'pin';

const Login = () => {
    const [mode, setMode] = useState<LoginMode>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, theme, setTheme } = useStore();

    /* ── Password Login (Web / Manager) ──────────────────────────── */
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                navigate('/');
            } else {
                // Fallback demo credentials
                if (email === 'admin' && password === 'admin') {
                    login({ name: 'Demo Admin', role: 'super_admin' });
                    navigate('/');
                } else {
                    setError(data.message || 'Invalid credentials');
                }
            }
        } catch {
            // No server — allow demo credentials
            if (email === 'admin' && password === 'admin') {
                login({ name: 'Demo Admin', role: 'super_admin' });
                navigate('/');
            } else {
                setError('Cannot connect to server. Use admin / admin for demo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    /* ── PIN Login (Cashier Terminal) ─────────────────────────────── */
    const handlePinLogin = async (digit: string) => {
        const newPin = pin + digit;
        if (newPin.length > 6) return;
        setPin(newPin);
        setError('');

        if (newPin.length === 4) {
            setIsLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/auth/pin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: newPin }),
                });
                const data = await res.json();
                if (res.ok) {
                    login(data.user, data.token);
                    navigate('/');
                } else {
                    setError(data.message || 'Invalid PIN');
                    setPin('');
                }
            } catch {
                setError('Server unavailable. Use email login for demo.');
                setPin('');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const inputCls = `w-full ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'} border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text placeholder-text-muted transition-all font-medium`;

    return (
        <div className={`min-h-screen w-full flex items-center justify-center ${theme === 'light' ? 'bg-slate-50' : 'bg-[#0a0f1a]'} relative overflow-hidden transition-colors duration-500`}>
            {/* Animated background blobs */}
            <div className={`absolute top-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full ${theme === 'light' ? 'bg-blue-300/30' : 'bg-primary/15'} blur-[120px]`} />
            <div className={`absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full ${theme === 'light' ? 'bg-violet-200/20' : 'bg-violet-900/20'} blur-[140px]`} />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-20">
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-white shadow-md border border-slate-100' : 'bg-white/10 backdrop-blur-md border border-white/10'} hover:scale-105 transition-all text-text`}>
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`w-full max-w-md relative z-10 mx-4`}
            >
                {/* Branding */}
                <div className="text-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-violet-600 mb-5 shadow-2xl shadow-primary/30"
                    >
                        <Zap size={36} className="text-white" />
                    </motion.div>
                    <h1 className={`text-5xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                        ApexPOS
                    </h1>
                    <p className="text-text-muted font-medium mt-2 text-sm">CeylonPOS Enterprise Platform</p>
                </div>

                {/* Card */}
                <div className={`rounded-[2rem] border overflow-hidden shadow-2xl ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-surface/20 backdrop-blur-2xl border-white/10'}`}>
                    {/* Mode Tabs */}
                    <div className={`flex border-b ${theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-white/3'}`}>
                        {([
                            { id: 'password', icon: Mail, label: 'Email Login' },
                            { id: 'pin', icon: Hash, label: 'PIN Login' },
                        ] as const).map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setMode(tab.id); setError(''); setPin(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black uppercase tracking-widest transition-all ${mode === tab.id
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-text-muted hover:text-text'
                                    }`}
                            >
                                <tab.icon size={15} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {mode === 'password' ? (
                                /* ── Email + Password Form ── */
                                <motion.form key="password" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handlePasswordLogin} className="space-y-5">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className={inputCls}
                                            placeholder="Email or username"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className={inputCls}
                                            placeholder="Password"
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {error && (
                                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm font-bold">
                                                <AlertCircle size={16} className="shrink-0" /> {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button type="submit" disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-black py-4 rounded-2xl hover:opacity-90 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70 mt-2">
                                        {isLoading
                                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <><ShieldCheck size={20} /> Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                        }
                                    </button>

                                    <p className="text-center text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60 pt-2">
                                        Demo: admin / admin
                                    </p>
                                </motion.form>
                            ) : (
                                /* ── PIN Keypad ── */
                                <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6">
                                    {/* PIN Display */}
                                    <div className="flex justify-center gap-3 py-2">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ scale: pin.length > i ? 1.15 : 1 }}
                                                className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i
                                                    ? 'bg-primary border-primary shadow-lg shadow-primary/40'
                                                    : `${theme === 'light' ? 'border-slate-200' : 'border-white/20'}`
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Numpad */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                            <motion.button
                                                key={n}
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => handlePinLogin(n.toString())}
                                                disabled={isLoading}
                                                className={`py-5 text-2xl font-black rounded-2xl transition-all ${theme === 'light'
                                                    ? 'bg-slate-50 border border-slate-100 hover:bg-primary/5 hover:border-primary/20 text-slate-700'
                                                    : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white'
                                                    } disabled:opacity-40`}
                                            >
                                                {n}
                                            </motion.button>
                                        ))}
                                        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setPin('')}
                                            className={`py-5 text-xs font-black rounded-2xl uppercase tracking-widest ${theme === 'light' ? 'bg-red-50 text-red-500 border border-red-100 hover:bg-red-100' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}`}>
                                            Clear
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.92 }} onClick={() => handlePinLogin('0')} disabled={isLoading}
                                            className={`py-5 text-2xl font-black rounded-2xl transition-all ${theme === 'light' ? 'bg-slate-50 border border-slate-100 hover:bg-primary/5 text-slate-700' : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white'} disabled:opacity-40`}>
                                            0
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setPin(p => p.slice(0, -1))}
                                            className={`py-5 text-sm font-black rounded-2xl uppercase tracking-wider ${theme === 'light' ? 'bg-slate-50 border border-slate-100 text-slate-500' : 'bg-white/5 border border-white/5 text-gray-400'}`}>
                                            ⌫
                                        </motion.button>
                                    </div>

                                    <AnimatePresence>
                                        {error && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm font-bold">
                                                <AlertCircle size={16} className="shrink-0" /> {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {isLoading && (
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-text-muted/40 mt-6 font-bold uppercase tracking-widest">
                    CeylonPOS v2.0 · Sri Lanka VAT/SSCL Compliant · Powered by Antigravity
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
