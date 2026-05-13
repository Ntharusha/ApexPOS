import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, UserCheck, TrendingUp, Search, Receipt, X, Plus, Phone, Hash, ChevronDown, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Installment {
    _id: string;
    date: string;
    amount: number;
    paid: boolean;
}

interface HPAccount {
    _id: string;
    customerName: string;
    customerNic: string;
    customerPhone: string;
    productName: string;
    totalAmount: number;
    downPayment: number;
    installments: Installment[];
    status: string;
}

// ─── Auto-Generate Installment Schedule ────────────────────────────────────────
function generateInstallments(total: number, downPayment: number, count: number, frequency: 'monthly' | 'weekly'): { date: string; amount: number; paid: boolean }[] {
    const remaining = total - downPayment;
    const baseAmount = Math.floor(remaining / count);
    const remainder = remaining - baseAmount * count;

    const installments = [];
    const start = new Date();

    for (let i = 0; i < count; i++) {
        const date = new Date(start);
        if (frequency === 'monthly') {
            date.setMonth(date.getMonth() + i + 1);
        } else {
            date.setDate(date.getDate() + (i + 1) * 7);
        }
        installments.push({
            date: date.toISOString().split('T')[0],
            amount: i === count - 1 ? baseAmount + remainder : baseAmount,
            paid: false,
        });
    }
    return installments;
}

// ─── New HP Account Modal ──────────────────────────────────────────────────────
interface NewHPModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NewHPModal: React.FC<NewHPModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const theme = useStore(s => s.theme);
    const [form, setForm] = useState({
        customerName: '', customerNic: '', customerPhone: '',
        productName: '', totalAmount: '', downPayment: '',
        installmentCount: '12', frequency: 'monthly' as 'monthly' | 'weekly',
    });
    const [preview, setPreview] = useState<{ date: string; amount: number; paid: boolean }[]>([]);
    const [step, setStep] = useState<1 | 2>(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const total = Number(form.totalAmount) || 0;
    const down = Number(form.downPayment) || 0;
    const count = Number(form.installmentCount) || 1;
    const remaining = Math.max(0, total - down);
    const monthlyAmount = count > 0 ? Math.ceil(remaining / count) : 0;

    useEffect(() => {
        if (total > 0 && down >= 0 && count > 0 && down <= total) {
            setPreview(generateInstallments(total, down, count, form.frequency));
        }
    }, [form.totalAmount, form.downPayment, form.installmentCount, form.frequency]);

    const handleNext = () => {
        setError('');
        if (!form.customerName || !form.productName || !form.totalAmount) {
            setError('Please fill all required fields.'); return;
        }
        if (down > total) { setError('Down payment cannot exceed total amount.'); return; }
        setStep(2);
    };

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const res = await fetch('http://localhost:5000/api/hp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: form.customerName,
                    customerNic: form.customerNic,
                    customerPhone: form.customerPhone,
                    productName: form.productName,
                    totalAmount: total,
                    downPayment: down,
                    installments: preview,
                    status: 'Active',
                }),
            });
            if (res.ok) { onSuccess(); onClose(); resetForm(); }
            else { const d = await res.json(); setError(d.message || 'Failed to save'); }
        } catch (e: any) {
            setError(e.message);
        } finally { setSaving(false); }
    };

    const resetForm = () => {
        setForm({ customerName: '', customerNic: '', customerPhone: '', productName: '', totalAmount: '', downPayment: '', installmentCount: '12', frequency: 'monthly' });
        setPreview([]); setStep(1); setError('');
    };

    const inputCls = `w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-4 text-text font-bold outline-none focus:border-primary transition-all text-sm`;
    const labelCls = 'text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1 mb-1.5 block';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        className={`${theme === 'light' ? 'bg-white' : 'bg-[#0d1117]'} border border-text/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 border-b border-text/10 bg-text/3">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <CreditCard size={24} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-text tracking-tight">New HP Account</h2>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                                        Step {step} of 2 — {step === 1 ? 'Account Details' : 'Installment Preview'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { onClose(); resetForm(); }} className="p-2.5 rounded-2xl hover:bg-text/5 text-text-muted hover:text-text transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex gap-0 border-b border-text/10">
                            {[1, 2].map(s => (
                                <div key={s} className={`flex-1 h-1 transition-all ${step >= s ? 'bg-primary' : 'bg-text/10'}`} />
                            ))}
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-red-400 text-sm font-bold">
                                    <AlertCircle size={18} className="shrink-0" /> {error}
                                </motion.div>
                            )}

                            {step === 1 ? (
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Customer Info */}
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                            <UserCheck size={14} /> Customer Information
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelCls}>Full Name *</label>
                                        <input className={inputCls} placeholder="John Perera" value={form.customerName}
                                            onChange={e => setForm({ ...form, customerName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>NIC Number</label>
                                        <input className={inputCls} placeholder="199012345678" value={form.customerNic}
                                            onChange={e => setForm({ ...form, customerNic: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Phone Number</label>
                                        <input className={inputCls} placeholder="077 123 4567" value={form.customerPhone}
                                            onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
                                    </div>

                                    {/* Product Info */}
                                    <div className="col-span-2 mt-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                            <Hash size={14} /> Product & Financials
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelCls}>Product / Item Name *</label>
                                        <input className={inputCls} placeholder="Samsung Galaxy A54 128GB" value={form.productName}
                                            onChange={e => setForm({ ...form, productName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Total Amount (LKR) *</label>
                                        <input type="number" className={inputCls} placeholder="150000" value={form.totalAmount}
                                            onChange={e => setForm({ ...form, totalAmount: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Down Payment (LKR)</label>
                                        <input type="number" className={inputCls} placeholder="30000" value={form.downPayment}
                                            onChange={e => setForm({ ...form, downPayment: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>No. of Installments</label>
                                        <select className={inputCls} value={form.installmentCount}
                                            onChange={e => setForm({ ...form, installmentCount: e.target.value })}>
                                            {[3, 6, 9, 12, 18, 24, 36].map(n => (
                                                <option key={n} value={n}>{n} installments</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Payment Frequency</label>
                                        <select className={inputCls} value={form.frequency}
                                            onChange={e => setForm({ ...form, frequency: e.target.value as any })}>
                                            <option value="monthly">Monthly</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>

                                    {/* Summary Preview */}
                                    {total > 0 && (
                                        <div className={`col-span-2 ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} rounded-2xl p-5 space-y-2`}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Quick Summary</p>
                                            {[
                                                { label: 'Total Amount', value: `LKR ${total.toLocaleString()}`, color: 'text-text' },
                                                { label: 'Down Payment', value: `LKR ${down.toLocaleString()}`, color: 'text-emerald-500' },
                                                { label: 'Balance', value: `LKR ${remaining.toLocaleString()}`, color: 'text-red-500' },
                                                { label: `Per ${form.frequency === 'monthly' ? 'Month' : 'Week'}`, value: `LKR ${monthlyAmount.toLocaleString()}`, color: 'text-primary' },
                                            ].map(r => (
                                                <div key={r.label} className="flex justify-between text-sm">
                                                    <span className="text-text-muted font-bold">{r.label}</span>
                                                    <span className={`font-black font-mono ${r.color}`}>{r.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Step 2: Installment Preview Table */
                                <div className="space-y-6">
                                    <div className={`${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} rounded-2xl p-5`}>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            {[
                                                { label: 'Customer', val: form.customerName },
                                                { label: 'Product', val: form.productName },
                                                { label: 'Total Amount', val: `LKR ${total.toLocaleString()}` },
                                                { label: 'Down Payment', val: `LKR ${down.toLocaleString()}` },
                                                { label: 'Balance', val: `LKR ${remaining.toLocaleString()}` },
                                                { label: 'Installments', val: `${count} × ${form.frequency}` },
                                            ].map(r => (
                                                <div key={r.label} className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{r.label}</p>
                                                    <p className="text-sm font-black text-text">{r.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 flex items-center gap-2">
                                            <Calendar size={14} /> Auto-Generated Schedule ({preview.length} installments)
                                        </p>
                                        <div className="max-h-[35vh] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                            {preview.map((inst, idx) => (
                                                <div key={idx} className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} rounded-2xl border border-text/5 group hover:border-primary/20 transition-all`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-text text-sm">{new Date(inst.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">
                                                                {form.frequency === 'monthly' ? `Month ${idx + 1}` : `Week ${idx + 1}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-black font-mono text-primary text-base">
                                                        LKR {inst.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-8 border-t border-text/10 flex justify-between items-center">
                            <button
                                onClick={() => step === 1 ? (onClose(), resetForm()) : setStep(1)}
                                className="px-8 py-4 rounded-2xl text-text-muted font-black uppercase tracking-widest hover:bg-text/5 transition-all text-sm"
                            >
                                {step === 1 ? 'Cancel' : '← Back'}
                            </button>
                            {step === 1 ? (
                                <button onClick={handleNext} className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all">
                                    Preview Schedule →
                                </button>
                            ) : (
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                    <CheckCircle2 size={18} />
                                    {saving ? 'Saving...' : 'Create HP Account'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// ─── HP Account Delete ──────────────────────────────────────────────────────────
async function deleteHPAccount(id: string): Promise<boolean> {
    try {
        const res = await fetch(`http://localhost:5000/api/hp/${id}`, { method: 'DELETE' });
        return res.ok;
    } catch { return false; }
}

// ─── Main HirePurchase Page ────────────────────────────────────────────────────
const HirePurchase = () => {
    const [hpAccounts, setHpAccounts] = useState<HPAccount[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed'>('All');
    const theme = useStore(state => state.theme);

    useEffect(() => { fetchHPAccounts(); }, []);

    const fetchHPAccounts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/hp');
            const data = await res.json();
            setHpAccounts(data);
        } catch (error) { console.error('Failed to fetch HP accounts', error); }
    };

    const handleCollect = async (accountId: string, installmentId: string, amount: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/hp/${accountId}/collect`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ installmentId, amount })
            });
            if (res.ok) fetchHPAccounts();
        } catch (error) { console.error('Error collecting payment', error); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this HP account? This cannot be undone.')) return;
        const ok = await deleteHPAccount(id);
        if (ok) fetchHPAccounts();
        else alert('Failed to delete account');
    };

    const filteredAccounts = hpAccounts.filter(acc => {
        const matchesSearch =
            acc.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            acc.productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || acc.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalActive = hpAccounts.filter(a => a.status === 'Active').length;
    const totalBalance = hpAccounts.filter(a => a.status === 'Active').reduce((sum, acc) => {
        const paid = acc.installments.filter(i => i.paid).reduce((s, i) => s + i.amount, 0) + acc.downPayment;
        return sum + (acc.totalAmount - paid);
    }, 0);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text">Hire Purchase Ledger</h1>
                    <p className="text-text-muted text-sm mt-1">{totalActive} active accounts · LKR {totalBalance.toLocaleString()} outstanding</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {/* Status Filter */}
                    <div className="flex gap-1 p-1 rounded-xl bg-text/5 border border-text/10">
                        {(['All', 'Active', 'Completed'] as const).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filterStatus === s ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input type="text" placeholder="Search accounts..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-60 ${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all`} />
                    </div>
                    <button onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:opacity-90 transition-all text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Plus size={16} /> New Account
                    </button>
                </div>
            </div>

            {/* Accounts Table */}
            <div className="glass-card flex flex-col overflow-hidden">
                {filteredAccounts.length === 0 ? (
                    <div className="p-20 text-center text-text-muted">
                        <CreditCard size={48} strokeWidth={1.5} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">No accounts found.</p>
                        <button onClick={() => setIsModalOpen(true)} className="mt-4 text-primary font-black text-sm hover:underline">
                            + Create first HP account
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b border-text/10 text-text-muted text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'}`}>
                                    <th className="p-5">Account & Customer</th>
                                    <th className="p-5">Product</th>
                                    <th className="p-5">Financials</th>
                                    <th className="p-5">Progress</th>
                                    <th className="p-5">Next Installment</th>
                                    <th className="p-5">Status</th>
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
                                                {acc.customerPhone && <div className="text-[10px] text-text-muted mt-0.5">{acc.customerPhone}</div>}
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-text text-sm">{acc.productName}</div>
                                                <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">
                                                    {acc.installments.length} installments
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-mono text-text-muted text-xs">Total: LKR {acc.totalAmount.toLocaleString()}</div>
                                                <div className="font-mono text-xs text-emerald-500">Down: LKR {acc.downPayment.toLocaleString()}</div>
                                                <div className="font-mono font-black text-red-500 text-sm mt-1">Balance: LKR {balance.toLocaleString()}</div>
                                            </td>
                                            <td className="p-5 min-w-[180px]">
                                                <div className="flex justify-between items-end mb-1.5">
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                                        {acc.installments.filter(i => i.paid).length}/{acc.installments.length} paid
                                                    </span>
                                                    <span className="text-[10px] font-black text-text-muted">{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className={`h-2 ${theme === 'light' ? 'bg-slate-100' : 'bg-surface'} rounded-full overflow-hidden`}>
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-emerald-500 rounded-full"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-text font-bold text-xs">
                                                    <Calendar size={14} className="text-primary" />
                                                    {nextInstallment
                                                        ? new Date(nextInstallment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : '—'}
                                                </div>
                                                {nextInstallment && (
                                                    <div className="text-[10px] text-primary font-mono mt-0.5">
                                                        LKR {nextInstallment.amount.toLocaleString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${acc.status === 'Completed'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                    {acc.status}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {nextInstallment && (
                                                        <button
                                                            onClick={() => handleCollect(acc._id, nextInstallment._id, nextInstallment.amount)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                                                        >
                                                            <Receipt size={12} /> Collect
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(acc._id)}
                                                        className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New HP Account Modal */}
            <NewHPModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchHPAccounts}
            />
        </div>
    );
};

export default HirePurchase;
