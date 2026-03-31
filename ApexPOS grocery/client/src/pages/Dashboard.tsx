import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, Activity, ArrowUpRight, ShoppingBag, CheckSquare, Package, Truck } from 'lucide-react';
import { useStore } from '../store/useStore';

const Dashboard = () => {
    const [stats, setStats] = useState({
        dailySales: 0,
        weeklySales: 0,
        monthlySales: 0,
        pendingRepairs: 0,
        lowStockCount: 0,
        lowStockList: [],
        brandSummary: [],
        activeDeliveries: 0,
        expiringCount: 0,
        expiringList: []
    });

    const [loading, setLoading] = useState(true);
    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const theme = useStore(state => state.theme);

    const fetchStats = () => {
        fetch('http://localhost:5000/api/dashboard/stats')
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchStats();
        fetch('http://localhost:5000/api/dashboard/sales-trend').then(res => res.json()).then(setSalesTrend);
        fetch('http://localhost:5000/api/dashboard/recent-activity').then(res => res.json()).then(setRecentActivity);
        const socket = io('http://localhost:5000');
        socket.on('dashboardUpdate', fetchStats);
        return () => { socket.disconnect(); };
    }, []);

    if (loading) return <div className="p-10 text-center text-text-muted italic">Initializing Analytics...</div>;

    const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];
    const CHART_TEXT_COLOR = theme === 'light' ? '#64748b' : '#94a3b8';
    const CHART_GRID_COLOR = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

    return (
        <div className="space-y-6 pb-10 relative">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tight uppercase">Intelligence Dashboard</h1>
                    <p className="text-[10px] text-text-muted font-bold tracking-[0.2em] uppercase mt-1">Real-time Performance Metrics</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-4 py-2 glass rounded-xl text-[10px] font-black uppercase text-text flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live Status
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: "Today's Revenue", value: stats.dailySales, color: "from-emerald-500/20 to-emerald-600/5", icon: <DollarSign className="text-emerald-500"/> },
                    { title: "Weekly Forecast", value: stats.weeklySales, color: "from-indigo-500/20 to-indigo-600/5", icon: <ShoppingBag className="text-indigo-500"/> },
                    { title: "Monthly Growth", value: stats.monthlySales, color: "from-violet-500/20 to-violet-600/5", icon: <Activity className="text-violet-500"/> },
                ].map((card, i) => (
                    <div key={i} className={`glass-card p-8 bg-gradient-to-br ${card.color} border-white/5`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-background/50 rounded-2xl border border-white/5 shadow-inner">
                                {card.icon}
                            </div>
                            <ArrowUpRight size={16} className="text-text-muted opacity-30" />
                        </div>
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{card.title}</h3>
                        <p className="text-3xl font-black text-text font-mono tracking-tighter">LKR {card.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 h-[450px] flex flex-col">
                    <h2 className="text-lg font-black text-text uppercase tracking-tight mb-8">Sales Trajectory</h2>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_GRID_COLOR} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: CHART_TEXT_COLOR, fontSize: 10, fontWeight: 900}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: CHART_TEXT_COLOR, fontSize: 10, fontWeight: 900}} />
                                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}} />
                                <Line type="monotone" dataKey="sales" stroke="url(#paint0_linear)" strokeWidth={4} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 8, strokeWidth: 0}} />
                                <defs>
                                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="1" y2="0">
                                        <stop stopColor="#10b981" />
                                        <stop offset="1" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col">
                    <h2 className="text-lg font-black text-text uppercase tracking-tight mb-6">Inventory Mix</h2>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats.brandSummary}>
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: CHART_TEXT_COLOR, fontSize: 8, fontWeight: 900}} />
                                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', borderRadius: '1rem', border: 'none'}} />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                    {stats.brandSummary.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                            <span>Total Groups</span>
                            <span className="text-text">{stats.brandSummary.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Low Stock */}
                <div className="glass-card p-6 border-red-500/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                           <Package size={16}/> Stock Alerts
                        </h2>
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg">{stats.lowStockCount}</span>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {stats.lowStockList?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                <span className="text-[10px] font-black text-text uppercase truncate pr-2">{item.name}</span>
                                <span className="text-xs font-black text-red-500 font-mono italic">{item.stock}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logistics */}
                <div className="glass-card p-6">
                    <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Truck size={16}/> Logistics Feed
                    </h2>
                    <div className="flex flex-col items-center justify-center h-[200px] opacity-20 italic text-[10px] font-black uppercase tracking-widest">
                        {stats.activeDeliveries > 0 ? `${stats.activeDeliveries} Active Shipments` : 'No active fleet'}
                    </div>
                </div>

                {/* Expiry Sentinel */}
                <div className="glass-card p-6 border-primary/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <CheckSquare size={16}/> Expiry Sentinel
                        </h2>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-lg">{stats.expiringCount}</span>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {stats.expiringList?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background/50 border border-white/5">
                                <div className="flex flex-col min-w-0 pr-2">
                                    <span className="text-[10px] font-black text-text uppercase truncate">{item.name}</span>
                                    <span className="text-[8px] font-bold text-primary/50 uppercase tracking-tighter">Clearance Recommended</span>
                                </div>
                                <span className="text-[10px] font-black text-primary font-mono">{new Date(item.expiryDate).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
