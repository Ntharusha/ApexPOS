import React, { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChefHat, Clock, AlertCircle, CheckCircle2, 
    Flame, Utensils, Timer, Coffee, 
    ChevronRight, Zap
} from 'lucide-react';

const socket = io('http://localhost:5000');

interface OrderItem {
    _id: string;
    name: string;
    quantity: number;
    notes?: string;
    course: 'Starter' | 'Main Course' | 'Dessert' | 'Beverage' | 'Side' | 'Other';
    status: 'Pending' | 'Sent' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
}

interface Order {
    _id: string;
    tableId: { _id: string; tableNumber: string };
    orderType: string;
    status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
    items: OrderItem[];
    createdAt: string;
}

const KDS = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        // Update timer every minute
        const timer = setInterval(() => setNow(Date.now()), 60000);
        
        fetch('http://localhost:5000/api/qr/kds/orders')
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(err => console.error(err));

        socket.on('new_kds_order', (newOrder: Order) => {
            setOrders(prev => {
                const filtered = prev.filter(o => o._id !== newOrder._id);
                return [...filtered, newOrder].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            });
        });

        socket.on('kds_order_updated', (updatedOrder: Order) => {
            if (updatedOrder.status === 'Completed' || updatedOrder.status === 'Cancelled') {
                setOrders(prev => prev.filter(o => o._id !== updatedOrder._id));
            } else {
                setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
            }
        });

        return () => {
            clearInterval(timer);
            socket.off('new_kds_order');
            socket.off('kds_order_updated');
        };
    }, []);

    const getDuration = (createdAt: string) => {
        const diff = Math.floor((now - new Date(createdAt).getTime()) / 60000);
        return diff;
    };

    const getStatusColor = (minutes: number) => {
        if (minutes > 20) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (minutes > 10) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    };

    const updateItemStatus = async (orderId: string, itemId: string, currentStatus: string) => {
        let newStatus = 'Preparing';
        if (currentStatus === 'Preparing') newStatus = 'Ready';
        if (currentStatus === 'Ready') newStatus = 'Served';

        try {
            await fetch(`http://localhost:5000/api/qr/kds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, itemStatus: newStatus })
            });
        } catch (err) {
            console.error("Status update failed", err);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await fetch(`http://localhost:5000/api/qr/kds/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (err) {
            console.error("Group update failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-white p-8">
            <header className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <ChefHat size={40} className="text-primary" />
                        Kitchen Command Centre
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">
                        Real-time Production Pipeline · {orders.length} Active Tickets
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">System Live</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 items-start">
                <AnimatePresence mode="popLayout">
                    {orders.map(order => {
                        const duration = getDuration(order.createdAt);
                        const statusStyles = getStatusColor(duration);
                        
                        // Group items by course
                        const groupedItems = order.items.reduce((acc: any, item) => {
                            const course = item.course || 'Other';
                            if (!acc[course]) acc[course] = [];
                            acc[course].push(item);
                            return acc;
                        }, {});

                        return (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="bg-[#161b22] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col min-h-[400px]"
                            >
                                {/* Ticket Header */}
                                <div className={`p-6 border-b border-white/5 flex justify-between items-start ${duration > 15 ? 'bg-red-500/5' : 'bg-white/[0.02]'}`}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl font-black">Table {order.tableId?.tableNumber || 'N/A'}</span>
                                            {order.orderType === 'QR-Order' && (
                                                <Zap size={14} className="text-primary" fill="currentColor" />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusStyles}`}>
                                                {duration}m Waiting
                                            </span>
                                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400">
                                                {order.orderType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                                        <Clock size={16} className="text-gray-500" />
                                    </div>
                                </div>

                                {/* Items by Course */}
                                <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar">
                                    {Object.entries(groupedItems).map(([course, items]: [any, any]) => (
                                        <div key={course} className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                {course}
                                            </h4>
                                            <div className="space-y-2">
                                                {items.map((item: any) => (
                                                    <div 
                                                        key={item._id}
                                                        onClick={() => updateItemStatus(order._id, item._id, item.status)}
                                                        className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${
                                                            item.status === 'Ready' 
                                                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                                                : item.status === 'Preparing' 
                                                                    ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20' 
                                                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className={`font-black text-sm ${item.status === 'Ready' ? 'text-emerald-500 line-through opacity-50' : 'text-white'}`}>
                                                                    {item.quantity}x {item.name}
                                                                </p>
                                                                {item.notes && (
                                                                    <p className="text-[10px] text-amber-400 mt-1 font-bold flex items-center gap-1">
                                                                        <AlertCircle size={10} /> {item.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className={`p-1.5 rounded-lg transition-colors ${
                                                                item.status === 'Ready' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500 group-hover:bg-primary/20 group-hover:text-primary'
                                                            }`}>
                                                                {item.status === 'Ready' ? <CheckCircle2 size={12} /> : <ChevronRight size={12} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="p-5 border-t border-white/5 bg-white/[0.01]">
                                    <button 
                                        onClick={() => updateOrderStatus(order._id, order.status === 'Ready' ? 'Completed' : 'Ready')}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${
                                            order.status === 'Ready' 
                                                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                                : 'bg-primary text-white shadow-primary/20'
                                        }`}
                                    >
                                        {order.status === 'Ready' ? (
                                            <>
                                                <CheckCircle2 size={18} /> Complete Order
                                            </>
                                        ) : (
                                            <>
                                                <Flame size={18} /> All Items Ready
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                
                {orders.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full h-[60vh] flex flex-col items-center justify-center text-gray-600 gap-6"
                    >
                        <div className="relative">
                            <ChefHat size={120} strokeWidth={1} className="opacity-10" />
                            <CheckCircle2 size={40} className="absolute bottom-2 right-2 text-emerald-500/40" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black uppercase tracking-widest">Kitchen is Clean</h3>
                            <p className="text-sm font-bold opacity-40 mt-1">Awaiting incoming tickets...</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            `}} />
        </div>
    );
};

export default KDS;
