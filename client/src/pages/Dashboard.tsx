import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, Package, Wrench, Truck, Activity, ArrowUpRight, AlertCircle, ShoppingBag } from 'lucide-react';
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
        activeDeliveries: 0
    });

    const [loading, setLoading] = useState(true);
    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const theme = useStore(state => state.theme);

    const fetchStats = () => {
        fetch('http://localhost:5000/api/dashboard/stats')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Dashboard Fetch Error:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStats();

        // Fetch sales trend data
        fetch('http://localhost:5000/api/dashboard/sales-trend')
            .then(res => res.json())
            .then(data => setSalesTrend(data))
            .catch(err => console.error("Sales Trend Fetch Error:", err));

        // Fetch recent activity
        fetch('http://localhost:5000/api/dashboard/recent-activity')
            .then(res => res.json())
            .then(data => setRecentActivity(data))
            .catch(err => console.error("Recent Activity Fetch Error:", err));

        // Real-time updates via Socket.io
        const socket = io('http://localhost:5000');

        socket.on('dashboardUpdate', () => {
            console.log("Real-time update received!");
            fetchStats();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-text-muted">Loading dashboard...</div>;
    }

    const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tight uppercase">
                        Business Intelligence
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Real-time Performance Metrics</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1.5 glass text-[10px] font-black uppercase text-text rounded-lg flex items-center gap-2">
                        <Activity size={14} className="text-primary animate-pulse" /> Live System Status
                    </span>
                </div>
            </div>

            {/* Top Summary Cards - Sales Focused */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Today\'s Sales', value: stats.dailySales, color: 'from-blue-500 to-indigo-500', icon: <DollarSign />, label: 'LKR' },
                    { title: 'Weekly Sales', value: stats.weeklySales, color: 'from-emerald-500 to-teal-500', icon: <ShoppingBag />, label: 'LKR' },
                    { title: 'Monthly Sales', value: stats.monthlySales, color: 'from-amber-500 to-orange-500', icon: <Activity />, label: 'LKR' },
                ].map((card, index) => (
                    <div key={index} className="glass-card p-8 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 blur-3xl rounded-bl-full transition-opacity group-hover:opacity-20`}></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg shadow-black/10`}>
                                    {React.cloneElement(card.icon as any, { size: 24, className: 'text-white' })}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Performance</span>
                            </div>
                            <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-4xl font-black text-text tracking-tighter">
                                <span className="text-base mr-1 font-bold text-text-muted">{card.label}</span>
                                {card.value.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2 glass-card p-8 min-h-[450px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-text uppercase tracking-tight">Revenue Stream</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Last 7 Active Trading Days</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-text/5 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-[10px] font-bold text-text-muted uppercase">Live Feed</span>
                        </div>
                    </div>
                    {salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'light' ? '#e2e8f0' : '#334155'} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    stroke={theme === 'light' ? '#64748b' : '#94a3b8'}
                                    style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    stroke={theme === 'light' ? '#64748b' : '#94a3b8'}
                                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                                    tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border, #334155)',
                                        borderRadius: '16px',
                                        color: 'var(--text)',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'var(--text)', fontWeight: 'bold' }}
                                    formatter={(value: any) => [`LKR ${value.toLocaleString()}`, 'Total Sales']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke={theme === 'light' ? '#2563eb' : '#38bdf8'}
                                    strokeWidth={4}
                                    dot={{ fill: theme === 'light' ? '#2563eb' : '#38bdf8', r: 6, strokeWidth: 2, stroke: 'var(--surface)' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[320px] text-text-muted font-bold italic">
                            Synthesizing trend data...
                        </div>
                    )}
                </div>

                {/* Brand performance Bar Chart */}
                <div className="glass-card p-8">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-text uppercase tracking-tight">Market Share</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Brand-wise Summary (This Month)</p>
                    </div>
                    {stats.brandSummary.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.brandSummary} layout="vertical" margin={{ left: -20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', fill: 'var(--text)' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: 'none' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                        {stats.brandSummary.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-text-muted bg-text/5 rounded-3xl border border-dashed border-text/10">
                            <Activity size={40} className="mb-4 opacity-20" />
                            <p className="font-bold text-xs uppercase tracking-widest">No brand data yet</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Watchlist */}
                <div className="glass-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black text-text uppercase tracking-tight">Stock Depletion Watch</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Critical Inventory Levels (&lt; 5 units)</p>
                        </div>
                        <div className="px-3 py-1 bg-red-500/10 rounded-lg">
                            <span className="text-[10px] font-black text-red-500 uppercase">{stats.lowStockCount} Items</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {stats.lowStockList.length > 0 ? stats.lowStockList.map((product: any, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/5 hover:border-red-500/30 transition-all group`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text leading-tight group-hover:text-red-500 transition-colors uppercase">{product.name}</p>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{product.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-red-500 font-mono">{product.stock}</p>
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Remaining</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center justify-center text-emerald-500 bg-emerald-500/5 rounded-3xl border border-dashed border-emerald-500/20">
                                <CheckSquare size={32} className="mb-3" />
                                <p className="font-black text-xs uppercase tracking-widest">Inventory is healthy</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Combined Other Stats Card */}
                <div className="glass-card p-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-black text-text uppercase tracking-tight">Workflow Overview</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Operational Pipeline Status</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className={`p-6 rounded-[2rem] ${theme === 'light' ? 'bg-blue-50/50' : 'bg-blue-500/5'} border border-blue-500/10 flex flex-col items-center text-center`}>
                            <Wrench size={32} className="text-blue-500 mb-3" />
                            <h4 className="text-3xl font-black text-text tracking-tighter">{stats.pendingRepairs}</h4>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Pending Repairs</p>
                        </div>
                        <div className={`p-6 rounded-[2rem] ${theme === 'light' ? 'bg-purple-50/50' : 'bg-purple-500/5'} border border-purple-500/10 flex flex-col items-center text-center`}>
                            <Truck size={32} className="text-purple-500 mb-3" />
                            <h4 className="text-3xl font-black text-text tracking-tighter">{stats.activeDeliveries}</h4>
                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mt-1">Out for Delivery</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                            Activity Pulse <div className="h-1 flex-1 bg-text/5 rounded-full"></div>
                        </h4>
                        <div className="space-y-4">
                            {recentActivity.slice(0, 3).map((activity, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                                    <p className="text-xs font-bold text-text truncate flex-1">{activity.message}</p>
                                    <span className="text-[8px] font-black text-text-muted uppercase">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
