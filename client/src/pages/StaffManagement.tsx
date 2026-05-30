import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Hash, Mail, Phone, Shield, Trash2, Search, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface StaffMember {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    branch_id: string;
    nic?: string;
    status: string;
    createdAt: string;
}

const ROLES = ['super_admin', 'branch_admin', 'manager', 'cashier', 'accountant'];

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    super_admin: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    branch_admin: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    manager: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    cashier: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    accountant: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    Admin: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    Technician: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
};

interface NewStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string | null;
}

const NewStaffModal: React.FC<NewStaffModalProps> = ({ isOpen, onClose, onSuccess, token }) => {
    const theme = useStore(s => s.theme);
    const [form, setForm] = useState({ name: '', email: '', password: '', pin: '', role: 'cashier', branch_id: 'HQ', phone: '', nic: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const inputCls = `w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-3.5 text-text font-bold outline-none focus:border-primary transition-all text-sm`;
    const labelCls = 'text-[10px] font-black uppercase tracking-[0.15em] text-text-muted ml-1 mb-1.5 block';

    const handleSave = async () => {
        setError('');
        if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return; }
        if (form.pin && form.pin.length !== 4) { setError('PIN must be exactly 4 digits'); return; }

        setSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) { onSuccess(); onClose(); setForm({ name: '', email: '', password: '', pin: '', role: 'cashier', branch_id: 'HQ', phone: '', nic: '' }); }
            else setError(data.message || 'Failed to create staff');
        } catch (e: any) {
            setError(e.message);
        } finally { setSaving(false); }
    };

    const rc = roleColors[form.role] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        className={`${theme === 'light' ? 'bg-white' : 'bg-[#0d1117]'} border border-text/10 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-7 border-b border-text/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Users size={22} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text">New Staff Account</h2>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">CeylonPOS · Authentication Setup</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-text/5 text-text-muted hover:text-text transition-all">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-7 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
                            {error && (
                                <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-400 text-sm font-bold">
                                    <AlertCircle size={16} className="shrink-0" /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelCls}>Full Name *</label>
                                    <input className={inputCls} placeholder="Kasun Perera" value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Email Address *</label>
                                    <input type="email" className={inputCls} placeholder="kasun@store.lk" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} className={inputCls + ' pr-12'} placeholder="••••••••" value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })} />
                                        <button onClick={() => setShowPassword(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>4-Digit PIN (Cashier)</label>
                                    <input type="password" inputMode="numeric" maxLength={4} className={inputCls} placeholder="••••" value={form.pin}
                                        onChange={e => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                                    <p className="text-[9px] text-text-muted mt-1 ml-1">Optional: for fast cashier terminal login</p>
                                </div>
                                <div>
                                    <label className={labelCls}>Role *</label>
                                    <select className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                        {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Branch</label>
                                    <input className={inputCls} placeholder="HQ / Branch-01" value={form.branch_id}
                                        onChange={e => setForm({ ...form, branch_id: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>Phone</label>
                                    <input className={inputCls} placeholder="077 123 4567" value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelCls}>NIC</label>
                                    <input className={inputCls} placeholder="199012345678" value={form.nic}
                                        onChange={e => setForm({ ...form, nic: e.target.value })} />
                                </div>

                                {/* Role preview badge */}
                                {form.role && (
                                    <div className="col-span-2">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${rc.bg} ${rc.border}`}>
                                            <Shield size={14} className={rc.text} />
                                            <span className={`text-xs font-black uppercase tracking-widest ${rc.text}`}>
                                                {form.role.replace('_', ' ')} · Can {form.role === 'cashier' ? 'process sales, PIN login' : form.role === 'manager' ? 'view all reports, manage products' : 'access all modules'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-7 border-t border-text/10 flex justify-between items-center">
                            <button onClick={onClose} className="px-6 py-3.5 rounded-2xl text-text-muted font-black uppercase tracking-widest hover:bg-text/5 transition-all text-sm">Cancel</button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
                                <CheckCircle2 size={18} />
                                {saving ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// ─── Main Staff Page ───────────────────────────────────────────────────────────
const StaffManagement = () => {
    const theme = useStore(s => s.theme);
    const { token, user } = useStore();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterRole, setFilterRole] = useState('All');

    useEffect(() => { fetchStaff(); }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/registration', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) setStaff(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deactivate this staff account?')) return;
        try {
            await fetch(`http://localhost:5000/api/registration/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            fetchStaff();
        } catch (e) { console.error(e); }
    };

    const allRoles = ['All', ...Array.from(new Set(staff.map(s => s.role)))];

    const filtered = staff.filter(s => {
        const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'All' || s.role === filterRole;
        return matchSearch && matchRole;
    });

    const initials = (name: string) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text">Staff Management</h1>
                    <p className="text-text-muted text-sm mt-1">{staff.filter(s => s.status === 'Active').length} active staff · {staff.length} total</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {/* Role Filter */}
                    <div className="flex gap-1 p-1 rounded-xl bg-text/5 border border-text/10 overflow-x-auto">
                        {allRoles.map(r => (
                            <button key={r} onClick={() => setFilterRole(r)}
                                className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterRole === r ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input type="text" placeholder="Search staff..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`w-52 ${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-all`} />
                    </div>
                    <button onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:opacity-90 transition-all text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Plus size={16} /> New Staff
                    </button>
                </div>
            </div>

            {/* Staff Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40 text-text-muted">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-20 text-center text-text-muted">
                    <Users size={48} strokeWidth={1.5} className="mx-auto mb-4 opacity-30" />
                    <p className="font-bold">No staff found</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-primary font-black text-sm hover:underline">+ Add first staff member</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {filtered.map((member, idx) => {
                            const rc = roleColors[member.role] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
                            return (
                                <motion.div
                                    key={member._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="glass-card p-6 space-y-4 hover:border-primary/20 transition-all group"
                                >
                                    {/* Avatar + Name */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                                                {initials(member.name)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-text leading-tight group-hover:text-primary transition-colors">{member.name}</h3>
                                                <p className="text-xs text-text-muted font-bold mt-0.5">{member.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(member._id)}
                                            className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${rc.bg} ${rc.text} ${rc.border}`}>
                                                <Shield size={10} /> {member.role?.replace('_', ' ')}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {member.status}
                                            </span>
                                        </div>

                                        <div className={`${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} rounded-2xl p-3 space-y-1.5`}>
                                            {member.phone && (
                                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                                    <Phone size={12} className="text-primary" /> {member.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <Hash size={12} className="text-primary" /> Branch: {member.branch_id || 'HQ'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-text-muted">
                                                <Mail size={12} className="text-primary" />
                                                Joined: {new Date(member.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <NewStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchStaff} token={token} />
        </div>
    );
};

export default StaffManagement;
