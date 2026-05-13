import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Tag, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Expense {
    _id?: string;
    type: string;
    amount: number;
    date: string;
    category: string;
}

const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<Expense>({
        type: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'General'
    });
    const theme = useStore(state => state.theme);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/expenses');
            const data = await res.json();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                fetchExpenses();
                setIsModalOpen(false);
                setForm({ type: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'General' });
            }
        } catch (error) {
            console.error('Error adding expense', error);
        }
    };

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">
                Expense Tracker
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Expense Card */}
                <div className="glass-card p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={80} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-text-muted uppercase tracking-widest mb-2">Total Monthly Expenditure</p>
                        <h2 className="text-5xl font-black text-red-500 tracking-tighter">
                            <span className="text-xl mr-1">LKR</span>
                            {totalExpenses.toLocaleString()}
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-10 flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-90 shadow-xl shadow-red-500/20 transition-all font-black uppercase tracking-widest text-xs active:scale-95"
                    >
                        <Plus size={20} /> Log New Expense
                    </button>
                </div>

                {/* Recent Activity List */}
                <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-text/10 flex justify-between items-center bg-text/5">
                        <h3 className="text-lg font-black text-text tracking-tight uppercase">Detailed Expense Log</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-text/5 rounded-lg text-[10px] font-black uppercase text-text-muted">
                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-text/5">
                        {expenses.length === 0 ? (
                            <div className="p-20 text-center text-text-muted italic">No expenses recorded.</div>
                        ) : (
                            expenses.map(exp => (
                                <div key={exp._id} className="flex p-6 items-center gap-6 hover:bg-text/5 transition-all group">
                                    <div className={`w-14 h-14 rounded-2xl ${theme === 'light' ? 'bg-red-50' : 'bg-red-500/10'} flex items-center justify-center text-red-500 transition-transform group-hover:scale-110`}>
                                        <ArrowUpRight size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-text text-lg leading-tight">{exp.type}</h4>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-text-muted tracking-wider">
                                                <Calendar size={12} /> {new Date(exp.date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-text-muted tracking-wider">
                                                <Tag size={12} /> {exp.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-red-500 font-mono">- {exp.amount.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">LKR</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className={`${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl`}
                        >
                            <div className="p-8 border-b border-text/10 flex justify-between items-center bg-text/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                                        <Plus size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-text tracking-tight uppercase leading-none">Log New Expense</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2.5 rounded-2xl hover:bg-text/5 text-text-muted hover:text-text transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Expense Type / Description</label>
                                    <input required type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold outline-none transition-all`} placeholder="e.g. Electricity Bill" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Amount (LKR)</label>
                                        <input required type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-black font-mono outline-none transition-all`} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Category</label>
                                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-black outline-none transition-all`}>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Salary">Salary</option>
                                            <option value="Inventory">Inventory</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Date</label>
                                    <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold outline-none transition-all`} />
                                </div>

                                <div className="pt-8 flex justify-end gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl text-text-muted font-black uppercase tracking-widest hover:bg-text/5 transition-all text-sm">Discard</button>
                                    <button type="submit" className="px-12 py-4 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest shadow-xl shadow-red-500/25 hover:opacity-90 active:scale-95 transition-all text-sm">Save Expense</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Expenses;
