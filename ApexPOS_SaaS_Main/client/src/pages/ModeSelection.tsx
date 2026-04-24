import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShoppingCart, Smartphone, Utensils } from 'lucide-react';

const ModeSelection = () => {
    const setPosMode = useStore((state) => state.setPosMode);
    const navigate = useNavigate();
    const logout = useStore((state) => state.logout);

    const handleSelect = (mode: 'grocery' | 'mobile' | 'restaurant') => {
        setPosMode(mode);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
            {/* Aurora Background Elements */}
            <div className="aurora-bg absolute inset-0 z-0 opacity-50 pointer-events-none">
                <div className="aurora-element top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary" />
                <div className="aurora-element bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary" />
                <div className="aurora-element top-[20%] right-[10%] w-[20%] h-[20%] bg-emerald-500/20" />
            </div>

            <div className="z-10 text-center mb-12">
                <h1 className="text-5xl font-black text-text tracking-tight uppercase mb-4">ApexPOS SaaS</h1>
                <p className="text-text-muted text-lg tracking-widest uppercase">Select your business type to continue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10 max-w-6xl w-full px-6">
                {/* Grocery POS Card */}
                <div 
                    onClick={() => handleSelect('grocery')}
                    className="glass-card p-10 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 transition-all duration-300 border-white/5 hover:border-primary/50 group bg-gradient-to-br hover:from-primary/10 hover:to-transparent"
                >
                    <div className="p-6 bg-primary/10 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <ShoppingCart size={48} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest mb-2">Grocery POS</h2>
                    <p className="text-text-muted text-center text-sm">Retail management, inventory tracking, and fast checkout for supermarkets.</p>
                </div>

                {/* Mobile Shop POS Card */}
                <div 
                    onClick={() => handleSelect('mobile')}
                    className="glass-card p-10 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 transition-all duration-300 border-white/5 hover:border-secondary/50 group bg-gradient-to-br hover:from-secondary/10 hover:to-transparent"
                >
                    <div className="p-6 bg-secondary/10 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <Smartphone size={48} className="text-secondary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest mb-2">Mobile Shop</h2>
                    <p className="text-text-muted text-center text-sm">Device management, repair tracking, reload sales, and hire purchasing.</p>
                </div>

                {/* Restaurant POS Card */}
                <div 
                    onClick={() => handleSelect('restaurant')}
                    className="glass-card p-10 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 transition-all duration-300 border-white/5 hover:border-emerald-500/50 group bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent"
                >
                    <div className="p-6 bg-emerald-500/10 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <Utensils size={48} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest mb-2">Restaurant</h2>
                    <p className="text-text-muted text-center text-sm">Table management, kitchen display, orders, and delivery tracking.</p>
                </div>
            </div>
            
            <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="mt-12 z-10 px-6 py-2 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors uppercase tracking-widest text-sm font-bold"
            >
                Logout
            </button>
        </div>
    );
};

export default ModeSelection;
