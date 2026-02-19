import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Lock, User, ArrowRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login, theme, setTheme } = useStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Mock Authentication Logic
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                login({ name: 'Admin User', role: 'admin' });
                navigate('/');
            } else {
                setError('Invalid credentials');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center ${theme === 'light' ? 'bg-slate-50' : 'bg-[#0f172a]'} relative overflow-hidden transition-colors duration-500`}>
            {/* Background Effects */}
            <div className={`absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full ${theme === 'light' ? 'bg-blue-200/40' : 'bg-primary/20'} blur-[100px] animate-pulse`}></div>
            <div className={`absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full ${theme === 'light' ? 'bg-indigo-100/30' : 'bg-secondary/10'} blur-[120px]`}></div>

            {/* Theme Toggle for Login Page */}
            <div className="absolute top-8 right-8 z-20">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-text"
                >
                    {theme === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-slate-700" />}
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`w-full max-w-md p-10 rounded-[32px] ${theme === 'light' ? 'bg-white shadow-2xl border-slate-100' : 'bg-surface/30 backdrop-blur-xl border-white/10 shadow-2xl'} border relative z-10 mx-4`}
            >
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-primary to-blue-600 mb-6 shadow-lg shadow-primary/20">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h1 className={`text-4xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-3 tracking-tight`}>
                        ApexPOS
                    </h1>
                    <p className="text-text-muted font-medium">Enterprise Management System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text placeholder-text-muted transition-all`}
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text placeholder-text-muted transition-all`}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:opacity-90 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign In <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-text-muted text-xs font-semibold uppercase tracking-widest opacity-60">
                        Default: admin / admin
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
