import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, X, Star, TrendingUp, ShoppingBag,
    Clock, Award, Zap, ChevronRight, UserPlus, Phone,
    Crown, Sparkles, Heart
} from 'lucide-react';
import api from '../../api/axios';
import { useStore } from '../../store/useStore';

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface Customer {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    totalPurchases: number;
    loyaltyPoints: number;
    status: string;
}

interface Recommendation {
    _id: string;
    name: string;
    price: number;
    count: number;
    totalQty: number;
    lastOrdered: string;
}

interface CustomerStats {
    totalSpend: number;
    visitCount: number;
    avgOrderValue: number;
    lastVisit: string | null;
    firstVisit: string | null;
    tier: string;
    recentOrders: any[];
}

interface CustomerCRMPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCustomer: (customer: Customer | null) => void;
    selectedCustomer: Customer | null;
    onAddRecommendation: (productId: string, name: string, price: number) => void;
}

// ─── Tier Config ─────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; gradient: string }> = {
    New: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: <User size={14} />, gradient: 'from-gray-600 to-gray-400' },
    Bronze: { color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20', icon: <Award size={14} />, gradient: 'from-amber-700 to-amber-500' },
    Silver: { color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/20', icon: <Star size={14} />, gradient: 'from-slate-400 to-slate-200' },
    Gold: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: <Crown size={14} />, gradient: 'from-yellow-500 to-amber-300' },
    Platinum: { color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', icon: <Sparkles size={14} />, gradient: 'from-violet-500 to-fuchsia-400' },
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CustomerCRMPanel: React.FC<CustomerCRMPanelProps> = ({
    isOpen, onClose, onSelectCustomer, selectedCustomer, onAddRecommendation
}) => {
    const theme = useStore(state => state.theme);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [stats, setStats] = useState<CustomerStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

    // Fetch all customers
    useEffect(() => {
        if (isOpen) {
            api.get<Customer[]>('/registration/customers')
                .then(setCustomers)
                .catch(err => console.error('Failed to fetch customers', err));
        }
    }, [isOpen]);

    // Fetch recommendations + stats when customer is selected
    const fetchCustomerData = useCallback(async (customerId: string) => {
        setLoadingStats(true);
        setAddedItems(new Set());
        try {
            const [recs, customerStats] = await Promise.all([
                api.get<Recommendation[]>(`/registration/customers/${customerId}/recommendations`),
                api.get<CustomerStats>(`/registration/customers/${customerId}/stats`)
            ]);
            setRecommendations(recs);
            setStats(customerStats);
        } catch (err) {
            console.error('Failed to fetch customer data', err);
            setRecommendations([]);
            setStats(null);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCustomer?._id) {
            fetchCustomerData(selectedCustomer._id);
        } else {
            setRecommendations([]);
            setStats(null);
        }
    }, [selectedCustomer, fetchCustomerData]);

    const handleSelectCustomer = (customer: Customer) => {
        onSelectCustomer(customer);
    };

    const handleDeselectCustomer = () => {
        onSelectCustomer(null);
        setSearchTerm('');
    };

    const handleAddItem = (rec: Recommendation) => {
        onAddRecommendation(rec._id, rec.name, rec.price);
        setAddedItems(prev => new Set(prev).add(rec._id));
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const tierConfig = TIER_CONFIG[stats?.tier || 'New'] || TIER_CONFIG.New;

    const getTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        return `${Math.floor(days / 30)}mo ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: -480, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -480, opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`fixed left-0 top-0 bottom-0 z-[70] w-[460px] ${theme === 'light' ? 'bg-white' : 'bg-[#0d1117]'} border-r ${theme === 'light' ? 'border-slate-200' : 'border-white/10'} shadow-2xl flex flex-col overflow-hidden`}
                    >
                        {/* ─── Header ──────────────────────────────────────── */}
                        <div className={`p-6 border-b ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'} shrink-0`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-2xl ${theme === 'light' ? 'bg-violet-50' : 'bg-violet-500/10'}`}>
                                        <Heart size={20} className="text-violet-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-text tracking-tight">Smart CRM</h2>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Customer Intelligence</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`p-2.5 rounded-2xl ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-white/10'} text-text-muted hover:text-text transition-all`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search */}
                            {!selectedCustomer && (
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or phone..."
                                        className={`w-full ${theme === 'light' ? 'bg-white' : 'bg-white/5'} border ${theme === 'light' ? 'border-slate-200' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-text placeholder-text-muted transition-all text-sm font-medium`}
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* ─── Content ─────────────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {!selectedCustomer ? (
                                /* ── Customer List ───────────────────────── */
                                <div className="p-4 space-y-2">
                                    {/* Walk-in option */}
                                    <button
                                        onClick={onClose}
                                        className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'} flex items-center gap-3 transition-all group`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                                            <User size={18} className="text-text-muted" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-black text-text text-sm">Walk-in Customer</p>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">No profile linked</p>
                                        </div>
                                        <ChevronRight size={16} className="text-text-muted group-hover:text-text transition-colors" />
                                    </button>

                                    <div className="px-2 py-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                                            Registered Customers ({filteredCustomers.length})
                                        </p>
                                    </div>

                                    <AnimatePresence mode="popLayout">
                                        {filteredCustomers.map((customer, i) => (
                                            <motion.button
                                                key={customer._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: i * 0.03 }}
                                                onClick={() => handleSelectCustomer(customer)}
                                                className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50' : 'border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5'} flex items-center gap-3 transition-all group text-left`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-violet-100 to-indigo-100' : 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20'} flex items-center justify-center text-violet-500 font-black text-sm shrink-0`}>
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-text text-sm truncate group-hover:text-violet-500 transition-colors">{customer.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Phone size={10} className="text-text-muted" />
                                                        <span className="text-xs text-text-muted font-mono">{customer.phone}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-primary font-mono">
                                                        {customer.loyaltyPoints > 0 ? `${customer.loyaltyPoints} pts` : ''}
                                                    </p>
                                                </div>
                                                <ChevronRight size={16} className="text-text-muted group-hover:text-violet-500 transition-colors shrink-0" />
                                            </motion.button>
                                        ))}
                                    </AnimatePresence>

                                    {filteredCustomers.length === 0 && searchTerm && (
                                        <div className="flex flex-col items-center py-12 text-text-muted/40 gap-3">
                                            <Search size={40} strokeWidth={1.5} />
                                            <p className="text-sm font-bold">No customers found</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* ── Customer Profile ────────────────────── */
                                <div className="p-5 space-y-5">
                                    {/* Profile Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-5 rounded-3xl border ${theme === 'light' ? 'border-slate-200 bg-gradient-to-br from-violet-50 to-indigo-50' : 'border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-indigo-500/5'} relative overflow-hidden`}
                                    >
                                        {/* Decorative gradient orb */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
                                        
                                        <div className="flex items-start gap-4 relative">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                                                {selectedCustomer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-black text-text truncate leading-tight">{selectedCustomer.name}</h3>
                                                <p className="text-xs text-text-muted font-mono mt-0.5">{selectedCustomer.phone}</p>
                                                {stats && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tierConfig.bg} ${tierConfig.color} border ${tierConfig.border}`}>
                                                            {tierConfig.icon}
                                                            {stats.tier}
                                                        </span>
                                                        <span className="text-[10px] text-text-muted font-bold">
                                                            {selectedCustomer.loyaltyPoints} pts
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleDeselectCustomer}
                                                className={`p-2 rounded-xl ${theme === 'light' ? 'hover:bg-white' : 'hover:bg-white/10'} text-text-muted hover:text-red-400 transition-all`}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Stats Grid */}
                                    {loadingStats ? (
                                        <div className="flex items-center justify-center py-10">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full"
                                            />
                                        </div>
                                    ) : stats ? (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="grid grid-cols-2 gap-3"
                                            >
                                                {[
                                                    { label: 'Total Spend', value: `LKR ${Math.round(stats.totalSpend).toLocaleString()}`, icon: <TrendingUp size={16} />, color: 'text-emerald-500', bg: theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-500/10' },
                                                    { label: 'Avg Order', value: `LKR ${Math.round(stats.avgOrderValue).toLocaleString()}`, icon: <ShoppingBag size={16} />, color: 'text-blue-400', bg: theme === 'light' ? 'bg-blue-50' : 'bg-blue-500/10' },
                                                    { label: 'Total Visits', value: stats.visitCount.toString(), icon: <Star size={16} />, color: 'text-amber-400', bg: theme === 'light' ? 'bg-amber-50' : 'bg-amber-500/10' },
                                                    { label: 'Last Visit', value: getTimeAgo(stats.lastVisit), icon: <Clock size={16} />, color: 'text-violet-400', bg: theme === 'light' ? 'bg-violet-50' : 'bg-violet-500/10' },
                                                ].map((stat, i) => (
                                                    <motion.div
                                                        key={stat.label}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.15 + i * 0.05 }}
                                                        className={`p-4 rounded-2xl border ${theme === 'light' ? 'border-slate-200' : 'border-white/5'} ${stat.bg}`}
                                                    >
                                                        <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{stat.label}</p>
                                                        <p className="text-text font-black text-lg font-mono mt-0.5 leading-none">{stat.value}</p>
                                                    </motion.div>
                                                ))}
                                            </motion.div>

                                            {/* ── Usual Orders / Predictive Section ──── */}
                                            {recommendations.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`rounded-3xl border-2 ${theme === 'light' ? 'border-violet-200 bg-gradient-to-b from-violet-50 to-white' : 'border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent'} overflow-hidden`}
                                                >
                                                    <div className={`px-5 py-4 border-b ${theme === 'light' ? 'border-violet-100' : 'border-violet-500/10'} flex items-center gap-2.5`}>
                                                        <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-violet-100' : 'bg-violet-500/15'}`}>
                                                            <Zap size={16} className="text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-black text-text tracking-tight">Usual Orders</h4>
                                                            <p className="text-[10px] text-text-muted font-bold">One-tap to add their favorites</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-3 space-y-2">
                                                        <AnimatePresence>
                                                            {recommendations.map((rec, i) => {
                                                                const isAdded = addedItems.has(rec._id);
                                                                return (
                                                                    <motion.button
                                                                        key={rec._id}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.35 + i * 0.08, type: 'spring', stiffness: 200 }}
                                                                        onClick={() => !isAdded && handleAddItem(rec)}
                                                                        disabled={isAdded}
                                                                        className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all text-left group ${isAdded
                                                                            ? `${theme === 'light' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/20'}`
                                                                            : `${theme === 'light' ? 'bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100' : 'bg-white/[0.03] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5'}`
                                                                            }`}
                                                                    >
                                                                        {/* Rank */}
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${i === 0
                                                                            ? `${theme === 'light' ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-400/10 text-yellow-400'}`
                                                                            : i === 1
                                                                                ? `${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-400/10 text-slate-300'}`
                                                                                : `${theme === 'light' ? 'bg-amber-50 text-amber-600' : 'bg-amber-600/10 text-amber-600'}`
                                                                            }`}>
                                                                            #{i + 1}
                                                                        </div>

                                                                        {/* Details */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`font-bold text-sm truncate ${isAdded ? 'text-emerald-500' : 'text-text group-hover:text-violet-500'} transition-colors`}>
                                                                                {rec.name}
                                                                            </p>
                                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                                <span className="text-[10px] text-text-muted font-bold">
                                                                                    Ordered {rec.count}× ({rec.totalQty} units)
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Price + Action */}
                                                                        <div className="text-right shrink-0">
                                                                            <p className={`font-black font-mono text-sm ${isAdded ? 'text-emerald-500' : 'text-primary'}`}>
                                                                                {isAdded ? '✓ Added' : `LKR ${rec.price.toLocaleString()}`}
                                                                            </p>
                                                                        </div>

                                                                        {!isAdded && (
                                                                            <motion.div
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                className={`p-2 rounded-xl ${theme === 'light' ? 'bg-violet-100 text-violet-600 group-hover:bg-violet-500 group-hover:text-white' : 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white'} transition-all shrink-0`}
                                                                            >
                                                                                <Zap size={14} />
                                                                            </motion.div>
                                                                        )}
                                                                    </motion.button>
                                                                );
                                                            })}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {recommendations.length === 0 && stats.visitCount === 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`p-8 rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/5 bg-white/[0.02]'} flex flex-col items-center text-center gap-3`}
                                                >
                                                    <UserPlus size={36} className="text-text-muted/30" />
                                                    <p className="text-sm font-bold text-text-muted">First-time Customer</p>
                                                    <p className="text-xs text-text-muted/70">No purchase history yet. Complete this sale to start building their profile!</p>
                                                </motion.div>
                                            )}

                                            {/* ── Recent Orders ──────────────────────── */}
                                            {stats.recentOrders && stats.recentOrders.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-3 px-1">
                                                        Recent Transactions
                                                    </p>
                                                    <div className="space-y-2">
                                                        {stats.recentOrders.map((order: any, i: number) => (
                                                            <motion.div
                                                                key={order._id || i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.45 + i * 0.05 }}
                                                                className={`p-3.5 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-white/5 bg-white/[0.02]'} flex items-center gap-3`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-white/5'} flex items-center justify-center shrink-0`}>
                                                                    <ShoppingBag size={14} className="text-text-muted" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-text font-bold truncate">
                                                                        {order.items?.map((it: any) => it.name).join(', ') || 'Order'}
                                                                    </p>
                                                                    <p className="text-[10px] text-text-muted font-mono mt-0.5">
                                                                        {order.date ? new Date(order.date).toLocaleDateString() : ''}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs font-black text-text font-mono shrink-0">
                                                                    LKR {Math.round(order.grandTotal || 0).toLocaleString()}
                                                                </p>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* ─── Footer ──────────────────────────────────────── */}
                        {selectedCustomer && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-5 border-t ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'} shrink-0`}
                            >
                                <button
                                    onClick={onClose}
                                    className="w-full bg-violet-500 text-white font-black py-4 rounded-2xl hover:opacity-90 shadow-xl shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                >
                                    <Zap size={18} />
                                    Continue with {selectedCustomer.name.split(' ')[0]}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CustomerCRMPanel;
