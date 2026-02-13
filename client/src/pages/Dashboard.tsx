import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Dashboard
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Daily Sales', value: `LKR ${stats.dailySales.toLocaleString()}`, color: 'from-blue-500 to-cyan-400' },
                    { title: 'Low Stock Items', value: stats.lowStock, color: 'from-red-500 to-pink-400' },
                    { title: 'Pending Repairs', value: stats.pendingRepairs, color: 'from-amber-500 to-orange-400' },
                    { title: 'Active Deliveries', value: stats.activeDeliveries, color: 'from-violet-500 to-purple-400' },
                ].map((card, index) => (
                    <div key={index} className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 blur-2xl rounded-bl-3xl transition-opacity group-hover:opacity-20`}></div>
                        <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                        <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 min-h-[400px]">
                    <h3 className="text-xl font-semibold mb-4 text-gray-200">Sales Trend (Last 7 Days)</h3>
                    {salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                    formatter={(value: any) => [`LKR ${value.toLocaleString()}`, 'Sales']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#38bdf8"
                                    strokeWidth={3}
                                    dot={{ fill: '#38bdf8', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[320px] text-gray-500">
                            Loading chart data...
                        </div>
                    )}
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-200">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_#38bdf8]"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300">{activity.message}</p>
                                    <p className="text-xs text-gray-500">
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
                            <div className="text-center text-gray-500 py-8">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
