import React, { useState } from 'react';
import { Award, Star, Users, TrendingUp, Gift, Search, Crown, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoyaltyProgram = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const stats = [
        { title: 'Total Members', value: '4,289', icon: <Users size={24} className="text-blue-500" />, trend: '+12% this month' },
        { title: 'Points Issued', value: '1.2M', icon: <Star size={24} className="text-yellow-500" />, trend: '+8% this month' },
        { title: 'Points Redeemed', value: '840K', icon: <Gift size={24} className="text-emerald-500" />, trend: '+15% this month' },
    ];

    const customers = [
        { id: 'C001', name: 'Amal Perera', points: 12500, tier: 'Platinum', lastVisit: '2 hours ago' },
        { id: 'C002', name: 'Nimali Silva', points: 8400, tier: 'Gold', lastVisit: '1 day ago' },
        { id: 'C003', name: 'Kasun Kalhara', points: 3200, tier: 'Silver', lastVisit: '3 days ago' },
        { id: 'C004', name: 'Devin Fernando', points: 1500, tier: 'Bronze', lastVisit: '5 days ago' },
    ];

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Platinum': return 'from-slate-300 to-slate-500 text-slate-800';
            case 'Gold': return 'from-yellow-300 to-yellow-600 text-yellow-900';
            case 'Silver': return 'from-gray-300 to-gray-500 text-gray-900';
            default: return 'from-amber-600 to-amber-800 text-white';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-3">
                        <Award size={36} className="text-yellow-500" />
                        Loyalty & Rewards
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs">
                        Customer Retention & Points Management
                    </p>
                </div>
                <button className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/20">
                    <Gift size={20} /> Create Campaign
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-6 border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-2xl">{stat.icon}</div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
                        </div>
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-text">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customers Table */}
                <div className="lg:col-span-2 glass-card p-6 border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-text uppercase tracking-tight">Top Members</h2>
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search member..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary text-text"
                            />
                            <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-text-muted">
                                    <th className="pb-3 pl-2">Customer</th>
                                    <th className="pb-3">Tier</th>
                                    <th className="pb-3">Points</th>
                                    <th className="pb-3">Last Visit</th>
                                    <th className="pb-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="py-4 pl-2">
                                            <div className="font-bold text-sm text-text">{c.name}</div>
                                            <div className="text-[10px] text-text-muted">{c.id}</div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${getTierColor(c.tier)}`}>
                                                {c.tier}
                                            </span>
                                        </td>
                                        <td className="py-4 font-mono font-bold text-yellow-500">{c.points.toLocaleString()}</td>
                                        <td className="py-4 text-xs text-text-muted">{c.lastVisit}</td>
                                        <td className="py-4">
                                            <button className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase flex items-center gap-1">
                                                View <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tiers Configuration */}
                <div className="glass-card p-6 border-white/5 flex flex-col">
                    <h2 className="text-lg font-black text-text uppercase tracking-tight mb-6 flex items-center gap-2">
                        <Crown size={20} className="text-yellow-500"/> Tier Benefits
                    </h2>
                    <div className="space-y-4 flex-1">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-20"><Crown size={80} /></div>
                            <h3 className="font-black text-lg">Platinum</h3>
                            <p className="text-xs font-bold opacity-80 mt-1">10,000+ Points</p>
                            <ul className="mt-3 text-sm font-bold space-y-1">
                                <li className="flex items-center gap-2"><ShieldCheck size={14}/> 10% Cash Back</li>
                                <li className="flex items-center gap-2"><ShieldCheck size={14}/> VIP Checkout Line</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-300 to-yellow-600 text-yellow-900 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-20"><Crown size={80} /></div>
                            <h3 className="font-black text-lg">Gold</h3>
                            <p className="text-xs font-bold opacity-80 mt-1">5,000 - 9,999 Points</p>
                            <ul className="mt-3 text-sm font-bold space-y-1">
                                <li className="flex items-center gap-2"><ShieldCheck size={14}/> 5% Cash Back</li>
                                <li className="flex items-center gap-2"><ShieldCheck size={14}/> Birthday Reward</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyProgram;
