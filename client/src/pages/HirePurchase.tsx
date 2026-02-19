import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, UserCheck, TrendingUp, Search, Receipt, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface HPAccount {
    _id: string;
    customerName: string;
    productName: string;
    totalAmount: number;
    downPayment: number;
    installments: { _id: string; date: string; amount: number; paid: boolean }[];
    status: string;
}

const HirePurchase = () => {
    const [hpAccounts, setHpAccounts] = useState<HPAccount[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useStore(state => state.theme);

    useEffect(() => {
        fetchHPAccounts();
    }, []);

    const fetchHPAccounts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/hp');
            const data = await res.json();
            setHpAccounts(data);
        } catch (error) {
            console.error('Failed to fetch HP accounts', error);
        }
    };

    const handleCollect = async (accountId: string, installmentId: string, amount: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/hp/${accountId}/collect`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ installmentId, amount })
            });
            if (res.ok) {
                fetchHPAccounts();
            }
        } catch (error) {
            console.error('Error collecting payment', error);
        }
    };

    const filteredAccounts = hpAccounts.filter(acc =>
        acc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text">
                    Hire Purchase Ledger
                </h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Find Account..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full ${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all`}
                        />
                    </div>
                    <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:opacity-90 transition-all text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                        <TrendingUp size={18} /> New Account
                    </button>
                </div>
            </div>

            <div className="glass-card flex flex-col overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b border-text/10 text-text-muted text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'}`}>
                                <th className="p-5">Account & Customer</th>
                                <th className="p-5">Product Details</th>
                                <th className="p-5">Financial Summary</th>
                                <th className="p-5">Collection Progress</th>
                                <th className="p-5">Next Installment</th>
                                <th className="p-5">Current Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-text/5">
                            {filteredAccounts.map(acc => {
                                const paidAmount = acc.installments.filter(i => i.paid).reduce((a, b) => a + b.amount, 0) + acc.downPayment;
                                const balance = acc.totalAmount - paidAmount;
                                const progress = (paidAmount / acc.totalAmount) * 100;
                                const nextInstallment = acc.installments.find(i => !i.paid);

                                return (
                                    <tr key={acc._id} className="hover:bg-text/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="font-mono text-primary font-black text-xs mb-1">HP-{acc._id.slice(-4).toUpperCase()}</div>
                                            <div className="font-black text-text leading-tight group-hover:text-primary transition-colors">{acc.customerName}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-text text-sm">{acc.productName}</div>
                                            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">Electronics</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-mono text-text-muted text-xs">Total: {acc.totalAmount.toLocaleString()}</div>
                                            <div className="font-mono font-black text-red-500 text-sm mt-1">Due: {balance.toLocaleString()}</div>
                                        </td>
                                        <td className="p-5 min-w-[200px]">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Paid: {progress.toFixed(0)}%</span>
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">LKR {paidAmount.toLocaleString()}</span>
                                            </div>
                                            <div className={`h-2 ${theme === 'light' ? 'bg-slate-100' : 'bg-surface'} rounded-full overflow-hidden blur-[0.5px]`}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-emerald-500"
                                                />
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-text font-bold text-xs">
                                                <Calendar size={14} className="text-primary" />
                                                {nextInstallment ? new Date(nextInstallment.date).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${acc.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                {acc.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            {nextInstallment && (
                                                <button
                                                    onClick={() => handleCollect(acc._id, nextInstallment._id, nextInstallment.amount)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                                                >
                                                    <Receipt size={14} /> Collect
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HirePurchase;
