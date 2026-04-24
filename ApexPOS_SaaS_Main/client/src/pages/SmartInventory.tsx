import React, { useState } from 'react';
import { AlertTriangle, Tag, Calendar, TrendingDown, Bell, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SmartInventory = () => {
    const expiringBatches = [
        { id: 'BAT-8821', product: 'Fresh Milk 1L', qty: 45, daysLeft: 2, location: 'Aisle 4 - Dairy', lossRisk: 'LKR 15,750' },
        { id: 'BAT-8824', product: 'Organic Tomatoes', qty: 12, daysLeft: 1, location: 'Produce Sec B', lossRisk: 'LKR 4,200' },
        { id: 'BAT-8901', product: 'Whole Wheat Bread', qty: 28, daysLeft: 3, location: 'Bakery Shelf', lossRisk: 'LKR 8,400' },
        { id: 'BAT-8711', product: 'Greek Yogurt', qty: 34, daysLeft: 5, location: 'Aisle 4 - Dairy', lossRisk: 'LKR 11,900' },
    ];

    const [actioned, setActioned] = useState<string[]>([]);

    const handleClearance = (id: string) => {
        setActioned([...actioned, id]);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-3">
                        <AlertTriangle size={36} className="text-amber-500" />
                        AI Expiry & Shrinkage Control
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs">
                        Predictive Loss Prevention & Batch Management
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex flex-col justify-center">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Total Risk Value</span>
                        <span className="text-xl font-black text-red-400 font-mono">LKR 40,250</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {expiringBatches.map((batch) => {
                    const isActioned = actioned.includes(batch.id);
                    return (
                        <motion.div 
                            key={batch.id} 
                            layout
                            className={`glass-card p-6 border-2 transition-all ${isActioned ? 'border-emerald-500/30 bg-emerald-500/5' : batch.daysLeft <= 2 ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-amber-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-text">{batch.product}</h3>
                                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <Tag size={12}/> {batch.id} • {batch.location}
                                    </p>
                                </div>
                                {!isActioned && (
                                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${batch.daysLeft <= 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-500'}`}>
                                        {batch.daysLeft} Days Left
                                    </div>
                                )}
                            </div>

                            <div className="flex items-end justify-between mt-6">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Items at Risk</p>
                                    <p className="text-xl font-black text-text">{batch.qty} Units</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Potential Loss</p>
                                    <p className="text-xl font-black text-red-400 font-mono">{batch.lossRisk}</p>
                                </div>
                            </div>

                            {isActioned ? (
                                <div className="mt-6 p-3 bg-emerald-500/20 text-emerald-500 rounded-xl flex justify-center items-center gap-2 font-black text-sm uppercase tracking-widest">
                                    <CheckCircle2 size={18} /> 40% Clearance Applied to POS
                                </div>
                            ) : (
                                <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                                    <button 
                                        onClick={() => handleClearance(batch.id)}
                                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-amber-950 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                                    >
                                        <TrendingDown size={16} /> Auto-Discount 40%
                                    </button>
                                    <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl font-black transition-all">
                                        <Bell size={18} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default SmartInventory;
