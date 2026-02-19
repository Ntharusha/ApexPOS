import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, Wrench, Truck, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';

const Dashboard = () => {
    const [stats, setStats] = useState({
        dailySales: 0,
        pendingRepairs: 0,
        lowStock: 0,
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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text mb-2">
                Dashboard
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Daily Sales', value: `LKR ${stats.dailySales.toLocaleString()}`, color: 'from-blue-500 to-cyan-400', icon: <DollarSign /> },
                    { title: 'Low Stock', value: stats.lowStock, color: 'from-red-500 to-pink-400', icon: <Package /> },
                    { title: 'Pending Repairs', value: stats.pendingRepairs, color: 'from-amber-500 to-orange-400', icon: <Wrench /> },
                    { title: 'Active Deliveries', value: stats.activeDeliveries, color: 'from-violet-500 to-purple-400', icon: <Truck /> },
                ].map((card, index) => (
                    <div key={index} className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300" role="button" tabIndex={0} aria-label={`${card.title}: ${card.value}`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 blur-2xl rounded-bl-3xl transition-opacity group-hover:opacity-20`} aria-hidden="true"></div>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                                {React.cloneElement(card.icon as any, { className: 'w-6 h-6 text-white' })}
                            </div>
                            <div>
                                <p className="text-text-muted text-sm font-medium">{card.title}</p>
                                <h3 className="text-2xl font-bold mt-1 text-text">{card.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <h3 className="text-xl font-semibold mb-4 text-text">Sales Trend (Last 7 Days)</h3>
                    {salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#334155'} />
                                <XAxis
                                    dataKey="date"
                                    stroke={theme === 'light' ? '#64748b' : '#94a3b8'}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke={theme === 'light' ? '#64748b' : '#94a3b8'}
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border, #334155)',
                                        borderRadius: '12px',
                                        color: 'var(--text)',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: 'var(--text)' }}
                                    formatter={(value: any) => [`LKR ${value.toLocaleString()}`, 'Sales']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke={theme === 'light' ? '#2563eb' : '#38bdf8'}
                                    strokeWidth={3}
                                    dot={{ fill: theme === 'light' ? '#2563eb' : '#38bdf8', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[320px] text-text-muted">
                            Loading chart data...
                        </div>
                    )}
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-text">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface/50 border border-transparent hover:border-text/5 transition-colors">
                                <div className={`w-10 h-10 rounded-full ${theme === 'light' ? 'bg-blue-50' : 'bg-white/5'} flex items-center justify-center`}>
                                    {React.createElement(Activity, { className: `w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-cyan-300'}` })}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-text font-medium">{activity.message}</p>
                                    <p className="text-xs text-text-muted">
                                        {new Date(activity.time).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-text-muted py-8">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
