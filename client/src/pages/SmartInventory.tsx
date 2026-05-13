import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { AlertTriangle, Tag, Calendar, TrendingDown, Bell, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SmartInventory = () => {
    const [expiringProducts, setExpiringProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioned, setActioned] = useState<string[]>([]);

    const fetchExpiringProducts = async () => {
        try {
            const res = await api.get('/products');
            const allProducts = res.data || [];
            
            // Filter for products that have batches expiring soon (within 7 days)
            const soon = allProducts.flatMap((p: any) => 
                (p.batches || []).map((b: any) => ({
                    ...p,
                    batchId: b.batchNumber,
                    expiryDate: b.expiryDate,
                    batchQty: b.quantity,
                    batchPrice: p.price
                }))
            ).filter((p: any) => {
                const days = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return days <= 7 && days >= 0;
            });

            setExpiringProducts(soon);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch expiring stock', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpiringProducts();
    }, []);

    const getDaysLeft = (date: string) => {
        return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    };

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
                        <span className="text-xl font-black text-red-400 font-mono">
                            LKR {expiringProducts.reduce((sum, p) => sum + (p.batchQty * p.batchPrice), 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-text-muted italic">Analyzing inventory batches...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {expiringProducts.map((batch) => {
                        const isActioned = actioned.includes(batch.batchId);
                        const daysLeft = getDaysLeft(batch.expiryDate);
                        const lossRisk = batch.batchQty * batch.batchPrice;
                        
                        return (
                            <motion.div 
                                key={batch.batchId} 
                                layout
                                className={`glass-card p-6 border-2 transition-all ${isActioned ? 'border-emerald-500/30 bg-emerald-500/5' : daysLeft <= 2 ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-amber-500/30'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-text">{batch.name}</h3>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <Tag size={12}/> {batch.batchId} • {batch.category}
                                        </p>
                                    </div>
                                    {!isActioned && (
                                        <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${daysLeft <= 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-500'}`}>
                                            {daysLeft} Days Left
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end justify-between mt-6">
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Items at Risk</p>
                                        <p className="text-xl font-black text-text">{batch.batchQty} Units</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Potential Loss</p>
                                        <p className="text-xl font-black text-red-400 font-mono">LKR {lossRisk.toLocaleString()}</p>
                                    </div>
                                </div>

                                {isActioned ? (
                                    <div className="mt-6 p-3 bg-emerald-500/20 text-emerald-500 rounded-xl flex justify-center items-center gap-2 font-black text-sm uppercase tracking-widest">
                                        <CheckCircle2 size={18} /> 40% Clearance Applied to POS
                                    </div>
                                ) : (
                                    <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                                        <button 
                                            onClick={() => handleClearance(batch.batchId)}
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
            )}
        </div>
    );
};

export default SmartInventory;
