import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Package, Plus, X, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

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
    const theme = useStore(state => state.theme);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Transit': return 'blue';
            case 'Delivered': return 'emerald';
            case 'Cancelled': return 'red';
            default: return 'amber';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text">
                    Delivery Tracking
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                    <Plus size={22} /> New Delivery
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                {['Pending', 'In Transit', 'Delivered', 'Cancelled'].map((status) => (
                    <div key={status} className="glass-card flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-text/10 flex items-center justify-between bg-text/5">
                            <h3 className="font-black text-xs uppercase tracking-widest text-text">{status}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-text/10 text-text-muted text-[10px] font-black">
                                {getDeliveriesByStatus(status).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                            {getDeliveriesByStatus(status).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-text-muted/30 italic text-xs">
                                    No {status.toLowerCase()} jobs
                                </div>
                            ) : (
                                getDeliveriesByStatus(status).map(delivery => (
                                    <motion.div
                                        layoutId={`delivery-${delivery._id}`}
                                        key={delivery._id}
                                        className={`${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/5 p-4 rounded-2xl shadow-sm hover:border-primary/30 transition-all group`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-black text-sm text-text leading-tight group-hover:text-primary transition-colors">{delivery.customerName}</h4>
                                            <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                                                {new Date(delivery.deliveryDate || Date.now()).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            <div className="flex items-start gap-2.5">
                                                <MapPin size={14} className="mt-0.5 text-primary shrink-0" />
                                                <span className="text-[11px] leading-relaxed text-text font-medium">{delivery.customerAddress}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Phone size={14} className="text-secondary shrink-0" />
                                                <span className="text-[11px] text-text-muted font-bold font-mono">{delivery.customerPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Package size={14} className="text-amber-500 shrink-0" />
                                                <span className="text-[11px] text-primary font-black">LKR {delivery.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {status !== 'Delivered' && status !== 'Cancelled' && (
                                            <div className="mt-4 pt-4 border-t border-text/5 flex gap-2">
                                                {status === 'Pending' && (
                                                    <button
                                                        onClick={() => updateStatus(delivery._id!, 'In Transit')}
                                                        className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                                    >
                                                        Start Journey
                                                    </button>
                                                )}
                                                {status === 'In Transit' && (
                                                    <button
                                                        onClick={() => updateStatus(delivery._id!, 'Delivered')}
                                                        className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Delivery Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl`}
                        >
                            <div className="p-6 border-b border-text/10 flex justify-between items-center bg-text/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <Plus size={20} />
                                    </div>
                                    <h2 className="text-xl font-black text-text tracking-tight uppercase">New Delivery Entry</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text p-2 rounded-xl hover:bg-text/5 transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Customer Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-text-muted`}
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-text-muted font-mono`}
                                            placeholder="07xxxxxxxx"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Delivery Address</label>
                                    <textarea
                                        required
                                        value={formData.customerAddress}
                                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                                        className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-text-muted h-28`}
                                        placeholder="Full delivery address details..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Total Payable (LKR)</label>
                                    <div className="relative">
                                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            required
                                            type="number"
                                            value={formData.totalAmount}
                                            onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl pl-12 pr-5 py-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono font-bold`}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3.5 rounded-2xl text-text-muted font-bold hover:bg-text/5 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-3.5 rounded-2xl bg-primary text-white font-black hover:opacity-90 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] text-sm"
                                    >
                                        Create Delivery Task
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
