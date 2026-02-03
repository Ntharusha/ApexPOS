import React, { useState, useEffect } from 'react';
import { MapPin, Phone, User, Package, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeliveryItem {
    _id?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: { productName: string; quantity: number }[];
    totalAmount: number;
    status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
    trackingNumber?: string;
    deliveryDate?: Date;
    notes?: string;
}

const Delivery = () => {
    const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<DeliveryItem>({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        items: [{ productName: '', quantity: 1 }],
        totalAmount: 0,
        status: 'Pending'
    });

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/deliveries');
            const data = await res.json();
            setDeliveries(data);
        } catch (error) {
            console.error('Failed to fetch deliveries', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/deliveries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchDeliveries();
                setIsModalOpen(false);
                setFormData({
                    customerName: '',
                    customerPhone: '',
                    customerAddress: '',
                    items: [{ productName: '', quantity: 1 }],
                    totalAmount: 0,
                    status: 'Pending'
                });
            }
        } catch (error) {
            console.error('Error creating delivery', error);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await fetch(`http://localhost:5000/api/deliveries/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchDeliveries();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const getDeliveriesByStatus = (status: string) => {
        return deliveries.filter(d => d.status === status);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Delivery Tracking
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/80 text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                    <Plus size={20} /> New Delivery
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['Pending', 'In Transit', 'Delivered', 'Cancelled'].map((status) => (
                    <div key={status} className="glass-card p-4 min-h-[500px] flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <h3 className="font-bold text-gray-200">{status}</h3>
                            <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-400">
                                {getDeliveriesByStatus(status).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3">
                            {getDeliveriesByStatus(status).map(delivery => (
                                <motion.div
                                    layoutId={`delivery-${delivery._id}`}
                                    key={delivery._id}
                                    className="bg-surface border border-white/5 p-4 rounded-xl shadow-lg hover:border-primary/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-white">{delivery.customerName}</h4>
                                        <span className="text-xs text-gray-500">
                                            {new Date(delivery.deliveryDate || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-400">
                                        <div className="flex items-start gap-2">
                                            <MapPin size={14} className="mt-0.5 text-primary" />
                                            <span className="text-xs leading-tight">{delivery.customerAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-secondary" />
                                            <span className="text-xs">{delivery.customerPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-amber-400" />
                                            <span className="text-xs">LKR {delivery.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {status !== 'Delivered' && status !== 'Cancelled' && (
                                        <div className="mt-3 flex gap-2">
                                            {status === 'Pending' && (
                                                <button
                                                    onClick={() => updateStatus(delivery._id!, 'In Transit')}
                                                    className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    Start Delivery
                                                </button>
                                            )}
                                            {status === 'In Transit' && (
                                                <button
                                                    onClick={() => updateStatus(delivery._id!, 'Delivered')}
                                                    className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Delivery Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <h2 className="text-xl font-bold text-white">New Delivery</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Customer Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Phone</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Address</label>
                                    <textarea
                                        required
                                        value={formData.customerAddress}
                                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Total Amount (LKR)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        Create Delivery
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Delivery;
