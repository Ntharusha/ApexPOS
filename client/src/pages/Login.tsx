import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const login = useStore(state => state.login);

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
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 rounded-3xl bg-surface/30 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2">
                        ApexPOS
                    </h1>
                    <p className="text-gray-400 text-sm">Enterprise Point of Sale System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-surface/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 text-white placeholder-gray-600 transition-all focus:bg-surface/80"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-surface/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary/50 text-white placeholder-gray-600 transition-all focus:bg-surface/80"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-background font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs">
                        Default Credentials: <span className="font-mono text-gray-400">admin / admin</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
