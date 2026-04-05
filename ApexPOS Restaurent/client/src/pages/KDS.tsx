import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:5000');

interface OrderItem {
    _id: string;
    name: string;
    quantity: number;
    notes?: string;
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

    useEffect(() => {
        // Fetch initial KDS orders
        fetch('http://localhost:5000/api/qr/kds/orders')
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(err => console.error(err));

        socket.on('new_kds_order', (newOrder: Order) => {
            setOrders(prev => [...prev.filter(o => o._id !== newOrder._id), newOrder]);
        });

        socket.on('kds_order_updated', (updatedOrder: Order) => {
            if (updatedOrder.status === 'Completed' || updatedOrder.status === 'Cancelled') {
                setOrders(prev => prev.filter(o => o._id !== updatedOrder._id));
            } else {
                setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
            }
        });

        return () => {
            socket.off('new_kds_order');
            socket.off('kds_order_updated');
        };
    }, []);

    const updateItemStatus = async (orderId: string, itemId: string, currentStatus: string) => {
        let newStatus = 'Preparing';
        if (currentStatus === 'Preparing') newStatus = 'Ready';
        if (currentStatus === 'Ready') return; // Cannot revert back from ready for now

        await fetch(`http://localhost:5000/api/qr/kds/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, itemStatus: newStatus })
        });
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        await fetch(`http://localhost:5000/api/qr/kds/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Kitchen Display System</h1>
                <div className="text-gray-400">Live Updates</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                <AnimatePresence>
                    {orders.map(order => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 flex flex-col"
                        >
                            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
                                <h2 className="text-xl font-bold bg-gray-700 px-3 py-1 rounded">
                                    Table {order.tableId?.tableNumber || 'N/A'}
                                </h2>
                                <span className={`text-sm font-semibold px-2 py-1 rounded ${order.orderType === 'QR-Order' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
                                    {order.orderType}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                {order.items.map(item => (
                                    <div 
                                        key={item._id} 
                                        onClick={() => updateItemStatus(order._id, item._id, item.status)}
                                        className={`p-3 rounded cursor-pointer transition-colors ${
                                            item.status === 'Ready' ? 'bg-green-900/50 border border-green-500/50' : 
                                            item.status === 'Preparing' ? 'bg-yellow-900/50 border border-yellow-500/50' : 
                                            'bg-gray-700 hover:bg-gray-600'
                                        }`}
                                    >
                                        <div className="flex justify-between font-medium">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span className="text-xs opacity-75 mt-1">{item.status}</span>
                                        </div>
                                        {item.notes && <div className="text-sm text-gray-400 mt-1 flex items-start"><span className="mr-1">💬</span>{item.notes}</div>}
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => updateOrderStatus(order._id, 'Ready')}
                                className={`w-full py-3 rounded-lg font-bold transition-transform hover:scale-[1.02] active:scale-95 ${
                                    order.status === 'Ready' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                                }`}
                            >
                                {order.status === 'Ready' ? 'Mark Completed' : 'Mark All Ready'}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {orders.length === 0 && (
                    <div className="col-span-full h-64 flex items-center justify-center text-gray-500 text-2xl font-semibold">
                        No active orders. Kitchen is clear! 👨‍🍳
                    </div>
                )}
            </div>
        </div>
    );
};

export default KDS;
