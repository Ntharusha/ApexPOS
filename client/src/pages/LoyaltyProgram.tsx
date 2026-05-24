import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Award, Star, Users, TrendingUp, Gift, Search, Crown, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';

const LoyaltyProgram = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

    const fetchCustomers = async () => {
        try {
            const res = await api.get<any[]>('/customers');
            setCustomers(res || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch loyalty customers', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const stats = [
        { title: 'Total Members', value: customers.length.toLocaleString(), icon: <Users size={24} className="text-blue-500" />, trend: '+12% this month' },
        { title: 'Points Issued', value: customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0).toLocaleString(), icon: <Star size={24} className="text-yellow-500" />, trend: '+8% this month' },
        { title: 'Points Redeemed', value: '840K', icon: <Gift size={24} className="text-emerald-500" />, trend: '+15% this month' },
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
                <button 
                    onClick={() => setIsCampaignModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/20"
                >
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
                                        <td className="py-4 font-mono font-bold text-yellow-500">{(c.loyaltyPoints || 0).toLocaleString()}</td>
                                        <td className="py-4 text-xs text-text-muted">{'Recently'}</td>
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
            {/* Create Campaign Modal */}
            <CampaignModal 
                isOpen={isCampaignModalOpen} 
                onClose={() => setIsCampaignModalOpen(false)} 
            />
        </div>
    );
};

const CampaignModal = ({ isOpen, onClose }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl p-8"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white">Create Marketing Campaign</h2>
                        <p className="text-primary font-bold text-sm">Boost customer retention with targeted offers</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Campaign Type</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary focus:outline-none">
                            <option>Email Blast (15% Off Discount)</option>
                            <option>SMS Promotion (Double Points Weekend)</option>
                            <option>Push Notification (New Menu Item)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Target Audience</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-4 rounded-2xl bg-primary text-white font-black text-xs uppercase border border-primary">All Members</button>
                            <button className="p-4 rounded-2xl bg-white/5 text-gray-400 font-black text-xs uppercase border border-white/10">Inactive (30+ days)</button>
                            <button className="p-4 rounded-2xl bg-white/5 text-gray-400 font-black text-xs uppercase border border-white/10">Platinum Tier</button>
                            <button className="p-4 rounded-2xl bg-white/5 text-gray-400 font-black text-xs uppercase border border-white/10">Recent High Spenders</button>
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-yellow-500">Estimated Reach: <span className="font-black">4,289 Customers</span></p>
                    </div>

                    <button className="w-full bg-yellow-500 text-yellow-900 py-5 rounded-3xl font-black text-lg hover:opacity-90 shadow-xl shadow-yellow-500/20 transition-all flex items-center justify-center gap-3">
                        Launch Campaign <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoyaltyProgram;
