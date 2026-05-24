import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, Coffee, DollarSign, Users, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const TableTurnaround = () => {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTables = async () => {
        try {
            const res = await api.get<any[]>('/hospitality/tables');
            setTables(res || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch turnaround data', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const getDwellMins = (createdAt: string) => {
        if (!createdAt) return 0;
        const diff = Date.now() - new Date(createdAt).getTime();
        return Math.floor(diff / 60000);
    };

    const determineStatus = (dwell: number, hasOrder: boolean) => {
        if (!hasOrder) return 'Available';
        if (dwell > 90) return 'Critical';
        if (dwell > 60) return 'Warning';
        if (dwell > 15) return 'Dining';
        return 'Seated';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Critical': return 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] pulse-red';
            case 'Warning': return 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
            case 'Dining': return 'bg-blue-500/10 border-blue-500 text-blue-500';
            case 'Seated': return 'bg-emerald-500/10 border-emerald-500 text-emerald-500';
            default: return 'bg-white/5 border-white/10 text-text-muted';
        }
    };

    const getAction = (status: string) => {
        switch (status) {
            case 'Critical': return 'Present Bill / Offer Free Coffee to exit';
            case 'Warning': return 'Upsell Dessert / Check if done';
            case 'Dining': return 'Check on Mains / Refill Drinks';
            case 'Seated': return 'Take Order';
            default: return 'Clean Table';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-3">
                        <Activity size={36} className="text-blue-500" />
                        Turnaround Optimizer
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs">
                        Waitstaff Heatmap & Dwell Time Analytics
                    </p>
                </div>
                <div className="flex gap-6 items-center">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Avg Turnaround</p>
                        <p className="text-2xl font-black text-emerald-500">42 Mins</p>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Lost Revenue Risk</p>
                        <p className="text-2xl font-black text-red-500">LKR 12K</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => {
                    const dwell = getDwellMins(table.currentOrder?.createdAt);
                    const status = determineStatus(dwell, !!table.currentOrder);
                    const bill = table.currentOrder?.items?.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0) || 0;
                    
                    return (
                        <motion.div 
                            key={table._id}
                            layout
                            className={`glass-card p-6 border-2 transition-all relative overflow-hidden ${getStatusColor(status)}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-3xl font-black text-text">{table.tableNumber}</h3>
                                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <Users size={12}/> {table.capacity} Seats
                                    </p>
                                </div>
                                {dwell > 0 && (
                                    <div className="text-right">
                                        <div className={`text-3xl font-black font-mono tracking-tighter flex items-center gap-1 ${status === 'Critical' ? 'text-red-500' : status === 'Warning' ? 'text-amber-500' : 'text-text'}`}>
                                            {status === 'Critical' && <AlertCircle size={24} className="animate-pulse" />}
                                            {dwell}m
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Dwell Time</p>
                                    </div>
                                )}
                            </div>

                            {status !== 'Available' ? (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-xs font-black uppercase tracking-widest opacity-80">Phase</span>
                                            <span className="text-sm font-bold text-text">{dwell > 45 ? 'Main Course' : dwell > 15 ? 'Appetizers' : 'Ordering'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                                            <span className="text-xs font-black uppercase tracking-widest opacity-80">Bill So Far</span>
                                            <span className="text-sm font-bold font-mono text-text flex items-center"><DollarSign size={14}/> {bill.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-current/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Recommended Action</p>
                                        <button className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border bg-black/20 hover:bg-black/40 ${status === 'Critical' ? 'border-red-500/50 text-red-500' : status === 'Warning' ? 'border-amber-500/50 text-amber-500' : 'border-current/30 text-current'}`}>
                                            {getAction(status)} <ArrowRight size={14}/>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="h-32 flex flex-col items-center justify-center opacity-40">
                                    <Coffee size={48} className="mb-2" />
                                    <span className="text-xs font-black uppercase tracking-widest">Ready to Seat</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
            <style>{`
                .pulse-red { animation: pulseBorder 2s infinite; }
                @keyframes pulseBorder { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            `}</style>
        </div>
    );
};

export default TableTurnaround;
