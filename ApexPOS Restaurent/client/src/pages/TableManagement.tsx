import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coffee, Users, History, CheckCircle2,
    AlertCircle, Plus, Search, UtensilsCrossed,
    Trash2, Printer, ChevronRight, X
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface Table {
    _id: string;
    tableNumber: string;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Reserved' | 'Bill Requested';
    currentOrder?: any;
}

const TableManagement = () => {
    const { theme, user } = useStore();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [showCreateTable, setShowCreateTable] = useState(false);
    const [newTableNo, setNewTableNo] = useState('');
    const [newCapacity, setNewCapacity] = useState(4);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/hospitality/tables');
            const data = await res.json();
            setTables(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch tables', error);
            setLoading(false);
        }
    };

    const handleCreateTable = async () => {
        if (!newTableNo) return;
        try {
            const res = await fetch('http://localhost:5000/api/hospitality/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableNumber: newTableNo, capacity: newCapacity })
            });
            if (res.ok) {
                fetchTables();
                setShowCreateTable(false);
                setNewTableNo('');
            }
        } catch (error) {
            console.error('Failed to create table', error);
        }
    };

    const getStatusColor = (status: Table['status']) => {
        switch (status) {
            case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Occupied': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Reserved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Bill Requested': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-3">
                        <UtensilsCrossed size={36} className="text-primary" />
                        Hospitality Dashboard
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs">
                        Floor Plan & Table Management · {tables.length} Total Tables
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreateTable(true)}
                        className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} /> Add Table
                    </button>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-text-muted italic">Loading tables...</div>
                ) : tables.map((table) => (
                    <motion.div
                        key={table._id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedTable(table)}
                        className={`glass-card p-6 cursor-pointer border-2 transition-all relative group ${selectedTable?._id === table._id ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${getStatusColor(table.status).split(' ')[0]}`}>
                                <Coffee size={24} className={getStatusColor(table.status).split(' ')[1]} />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(table.status)}`}>
                                {table.status}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-text">Table {table.tableNumber}</h3>
                            <div className="flex items-center gap-2 text-text-muted mt-1 text-sm font-bold">
                                <Users size={14} />
                                {table.capacity} Seats
                            </div>
                        </div>

                        {table.status === 'Occupied' && (
                            <div className="mt-4 pt-4 border-t border-text/5">
                                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest leading-none">In Service</p>
                                <p className="text-xs text-text-muted font-bold mt-1">Order #...{table.currentOrder?._id?.slice(-4) || 'OPEN'}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Table Details Modal */}
            <AnimatePresence>
                {selectedTable && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-white/10 flex justify-between items-start bg-white/5">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-white">Table {selectedTable.tableNumber}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(selectedTable.status)}`}>
                                            {selectedTable.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                                        Capacity: {selectedTable.capacity} Persons · ID: {selectedTable._id}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                {selectedTable.status === 'Available' ? (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-center">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <UtensilsCrossed size={32} className="text-emerald-500" />
                                            </div>
                                            <h4 className="text-xl font-black text-white">Ready for Guests</h4>
                                            <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">
                                                This table is currently free. Open a new order to start serving.
                                            </p>
                                        </div>
                                        <button
                                            className="w-full bg-primary text-white py-5 rounded-3xl font-black text-lg hover:opacity-90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Plus size={24} /> Open New Order
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Order Items List Placeholder */}
                                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Current Order Items</h4>
                                            <div className="space-y-3">
                                                <p className="text-gray-500 italic text-sm">No items added to order yet...</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button className="bg-white/5 hover:bg-white/10 text-white p-5 rounded-3xl font-black transition-all flex flex-col items-center gap-2 border border-white/10">
                                                <UtensilsCrossed size={20} className="text-primary" />
                                                <span className="text-xs uppercase tracking-widest">Update Items</span>
                                            </button>
                                            <button className="bg-white/5 hover:bg-white/10 text-white p-5 rounded-3xl font-black transition-all flex flex-col items-center gap-2 border border-white/10">
                                                <Printer size={20} className="text-blue-400" />
                                                <span className="text-xs uppercase tracking-widest">Print KOT</span>
                                            </button>
                                            <button className="bg-white/5 hover:bg-white/10 text-white p-5 rounded-3xl font-black transition-all flex flex-col items-center gap-2 border border-white/10">
                                                <Users size={20} className="text-amber-400" />
                                                <span className="text-xs uppercase tracking-widest">Move Table</span>
                                            </button>
                                            <button className="bg-primary text-white p-5 rounded-3xl font-black transition-all flex flex-col items-center gap-2 shadow-lg shadow-primary/20">
                                                <Printer size={20} />
                                                <span className="text-xs uppercase tracking-widest">Bill & Checkout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Table Modal */}
            <AnimatePresence>
                {showCreateTable && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-white mb-6">Add New Table</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Table Name/Number</label>
                                    <input
                                        type="text"
                                        value={newTableNo}
                                        onChange={(e) => setNewTableNo(e.target.value)}
                                        placeholder="e.g., T-05"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Seating Capacity</label>
                                    <input
                                        type="number"
                                        value={newCapacity}
                                        onChange={(e) => setNewCapacity(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowCreateTable(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTable}
                                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20"
                                >
                                    Create Table
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableManagement;
