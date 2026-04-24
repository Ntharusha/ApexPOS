import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KitchenDisplay = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [orders, setOrders] = useState([
        {
            id: 'KOT-1042',
            table: 'T-05',
            time: new Date(Date.now() - 1000 * 60 * 12), // 12 mins ago
            status: 'Preparing',
            items: [
                { name: 'Grilled Salmon', qty: 1, mods: ['No Onion', 'Extra Lemon'] },
                { name: 'Caesar Salad', qty: 1, mods: ['Dressing on side'] }
            ]
        },
        {
            id: 'KOT-1043',
            table: 'T-12',
            time: new Date(Date.now() - 1000 * 60 * 4), // 4 mins ago
            status: 'New',
            items: [
                { name: 'Wagyu Burger', qty: 2, mods: ['Medium Rare', 'No Pickles'] },
                { name: 'Truffle Fries', qty: 1, mods: [] }
            ]
        },
        {
            id: 'KOT-1044',
            table: 'T-02',
            time: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago (Urgent)
            status: 'Preparing',
            items: [
                { name: 'Seafood Risotto', qty: 2, mods: [] }
            ]
        }
    ]);

    const getElapsedTime = (time: Date) => {
        const diff = Math.floor((currentTime.getTime() - time.getTime()) / 60000);
        return diff;
    };

    const updateStatus = (id: string, newStatus: string) => {
        if (newStatus === 'Done') {
            setOrders(orders.filter(o => o.id !== id));
        } else {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        }
    };

    const getCardStyle = (minutes: number, status: string) => {
        if (status === 'New') return 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
        if (minutes > 20) return 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-red-500/5 pulse-red';
        if (minutes > 15) return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] bg-amber-500/5';
        return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-emerald-500/5';
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6">
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-3">
                        <ChefHat size={36} className="text-red-500" />
                        Kitchen Display System (KDS)
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs flex items-center gap-2">
                        <Clock size={14} className="text-red-500"/> Live Ticket Board
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black font-mono text-text tracking-tighter">
                        {currentTime.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-x-auto pb-4 custom-scrollbar">
                <AnimatePresence>
                    {orders.map((order) => {
                        const mins = getElapsedTime(order.time);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                                key={order.id}
                                className={`glass-card flex flex-col border-2 overflow-hidden transition-all ${getCardStyle(mins, order.status)} min-w-[300px] h-fit`}
                            >
                                {/* Header */}
                                <div className={`p-4 flex justify-between items-center border-b ${mins > 20 ? 'border-red-500/20 bg-red-500/10' : 'border-white/5 bg-background/50'}`}>
                                    <div>
                                        <h2 className="text-2xl font-black text-text">{order.table}</h2>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{order.id}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-2xl font-black font-mono tracking-tighter flex items-center gap-1 ${mins > 20 ? 'text-red-500' : mins > 15 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {mins > 20 && <AlertCircle size={20} className="animate-pulse" />}
                                            {mins}m
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-4 flex-1 space-y-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="bg-white/10 text-white font-black px-3 py-1 rounded-lg h-fit text-sm">
                                                {item.qty}x
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-text leading-tight">{item.name}</h3>
                                                {item.mods.length > 0 && (
                                                    <ul className="mt-1 space-y-1">
                                                        {item.mods.map((mod, j) => (
                                                            <li key={j} className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1 before:content-['-']">
                                                                {mod}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="p-4 border-t border-white/5 bg-background/30 flex gap-3">
                                    {order.status === 'New' ? (
                                        <button 
                                            onClick={() => updateStatus(order.id, 'Preparing')}
                                            className="w-full py-4 rounded-2xl bg-blue-500/20 text-blue-400 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-blue-500/50"
                                        >
                                            <Play size={16} /> Start Preparing
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => updateStatus(order.id, 'Done')}
                                            className="w-full py-4 rounded-2xl bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-emerald-500/50"
                                        >
                                            <CheckCircle2 size={16} /> Bump / Ready
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                
                {orders.length === 0 && (
                    <div className="col-span-full h-[400px] flex flex-col items-center justify-center text-text-muted opacity-50">
                        <ChefHat size={64} className="mb-4" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">No Active Orders</h2>
                        <p className="font-bold italic">Kitchen is clear.</p>
                    </div>
                )}
            </div>
            <style>{`
                .pulse-red { animation: pulseRed 2s infinite; }
                @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            `}</style>
        </div>
    );
};

export default KitchenDisplay;
