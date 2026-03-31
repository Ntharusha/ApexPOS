import React, { useState, useEffect } from 'react';
import { User, Users, Briefcase, Truck, Plus, Trash2, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Staff {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    role: 'Admin' | 'Cashier' | 'Technician' | 'Manager';
    salary: number;
    address: string;
    nic: string;
    status: 'Active' | 'Inactive';
}

interface Customer {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    nic: string;
    totalPurchases: number;
    loyaltyPoints: number;
    status: 'Active' | 'Inactive';
}

interface Supplier {
    _id?: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    productsSupplied: string[];
    paymentTerms: string;
    status: 'Active' | 'Inactive';
}

const Registration = () => {
    const [activeTab, setActiveTab] = useState<'customers' | 'staff' | 'suppliers'>('customers');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useStore(state => state.theme);

    const [staff, setStaff] = useState<Staff[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [staffForm, setStaffForm] = useState<Staff>({
        name: '', email: '', phone: '', role: 'Cashier', salary: 0, address: '', nic: '', status: 'Active'
    });
    const [customerForm, setCustomerForm] = useState<Customer>({
        name: '', email: '', phone: '', address: '', nic: '', totalPurchases: 0, loyaltyPoints: 0, status: 'Active'
    });
    const [supplierForm, setSupplierForm] = useState<Supplier>({
        name: '', company: '', email: '', phone: '', address: '', productsSupplied: [], paymentTerms: '', status: 'Active'
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'staff') {
                const res = await fetch('http://localhost:5000/api/registration/staff');
                const data = await res.json();
                setStaff(data);
            } else if (activeTab === 'customers') {
                const res = await fetch('http://localhost:5000/api/registration/customers');
                const data = await res.json();
                setCustomers(data);
            } else if (activeTab === 'suppliers') {
                const res = await fetch('http://localhost:5000/api/registration/suppliers');
                const data = await res.json();
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const endpoint = `http://localhost:5000/api/registration/${activeTab}`;
            const body = activeTab === 'staff' ? staffForm : activeTab === 'customers' ? customerForm : supplierForm;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchData();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating record', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await fetch(`http://localhost:5000/api/registration/${activeTab}/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting record', error);
        }
    };

    const resetForm = () => {
        setStaffForm({ name: '', email: '', phone: '', role: 'Cashier', salary: 0, address: '', nic: '', status: 'Active' });
        setCustomerForm({ name: '', email: '', phone: '', address: '', nic: '', totalPurchases: 0, loyaltyPoints: 0, status: 'Active' });
        setSupplierForm({ name: '', company: '', email: '', phone: '', address: '', productsSupplied: [], paymentTerms: '', status: 'Active' });
    };

    const getCurrentData = () => {
        if (activeTab === 'staff') return staff;
        if (activeTab === 'customers') return customers;
        return suppliers;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">
                Registration Hub
            </h1>

            <div className={`p-1 ${theme === 'light' ? 'bg-slate-100' : 'bg-surface'} rounded-2xl inline-flex gap-1`}>
                {[
                    { id: 'customers', icon: Users, label: 'Customers' },
                    { id: 'staff', icon: Briefcase, label: 'Staff members' },
                    { id: 'suppliers', icon: Truck, label: 'Suppliers' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-text-muted hover:text-text hover:bg-text/5'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass-card flex flex-col overflow-hidden">
                <div className="p-6 border-b border-text/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-text/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            {activeTab === 'customers' ? <Users size={22} /> : activeTab === 'staff' ? <Briefcase size={22} /> : <Truck size={22} />}
                        </div>
                        <h2 className="text-xl font-black text-text tracking-tight uppercase">{activeTab} Directory</h2>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-xl font-black hover:opacity-90 flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        <Plus size={20} /> New Entry
                    </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    {getCurrentData().length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-text-muted/40 italic gap-4">
                            <User size={64} strokeWidth={1} className="opacity-20" />
                            <p className="font-bold">No {activeTab} records found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`text-text-muted text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-slate-50' : ''}`}>
                                    <th className="p-5">Information</th>
                                    <th className="p-5">Contact Details</th>
                                    {activeTab === 'staff' && <th className="p-5">Role & Position</th>}
                                    {activeTab === 'staff' && <th className="p-5">Monthly Salary</th>}
                                    {activeTab === 'customers' && <th className="p-5">Lifetime Value</th>}
                                    {activeTab === 'suppliers' && <th className="p-5">Company / Entity</th>}
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-text/5">
                                {getCurrentData().map((item: any) => (
                                    <tr key={item._id} className="hover:bg-text/5 transition-colors group">
                                        <td className="p-5">
                                            <div>
                                                <p className="font-black text-text leading-tight group-hover:text-primary transition-colors">{item.name}</p>
                                                <p className="text-[11px] text-text-muted mt-0.5 font-bold uppercase tracking-wider">{item.nic || 'No NIC'}</p>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-sm font-bold text-text font-mono leading-none">{item.phone}</p>
                                            <p className="text-xs text-text-muted mt-1.5">{item.email}</p>
                                        </td>
                                        {activeTab === 'staff' && (
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                                    {item.role}
                                                </span>
                                            </td>
                                        )}
                                        {activeTab === 'staff' && <td className="p-5 font-black text-text font-mono">LKR {item.salary?.toLocaleString()}</td>}
                                        {activeTab === 'customers' && <td className="p-5 font-black text-primary font-mono">LKR {item.totalPurchases?.toLocaleString()}</td>}
                                        {activeTab === 'suppliers' && <td className="p-5 font-bold text-text uppercase tracking-tight">{item.company}</td>}
                                        <td className="p-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal - Unified for all types */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className={`${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl`}
                        >
                            <div className="p-8 border-b border-text/10 flex justify-between items-center bg-text/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Plus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-text tracking-tight uppercase leading-none">New {activeTab.slice(0, -1)} Registration</h2>
                                        <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-widest italic">Personal & Professional Records</p>
                                    </div>
                                </div>
                                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-2.5 rounded-2xl hover:bg-text/5 text-text-muted hover:text-text transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                {activeTab === 'staff' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Full Name</label>
                                            <input required type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50`} placeholder="As written on NIC" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Email Address</label>
                                            <input required type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50`} placeholder="work@email.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Mobile Contact</label>
                                            <input required type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50`} placeholder="07XXXXXXXX" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Designation / Role</label>
                                            <select required value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}>
                                                <option value="Admin">System Administrator</option>
                                                <option value="Cashier">Point of Sale Cashier</option>
                                                <option value="Technician">Repair Technician</option>
                                                <option value="Manager">Operations Manager</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Salary (LKR)</label>
                                            <input required type="number" value={staffForm.salary} onChange={(e) => setStaffForm({ ...staffForm, salary: Number(e.target.value) })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-black font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'customers' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Customer Full Name</label>
                                            <input required type="text" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Phone Number</label>
                                            <input required type="tel" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-black font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Email (Optional)</label>
                                            <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50`} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Permanent Address</label>
                                            <textarea value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-24`} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'suppliers' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Supplier Name</label>
                                            <input required type="text" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Company / Entity</label>
                                            <input type="text" value={supplierForm.company} onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Payment Method Terms</label>
                                            <input type="text" value={supplierForm.paymentTerms} onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })} className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-[1.25rem] px-6 py-4 text-text font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} placeholder="e.g. Net 30, Cash on Delivery" />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8 flex justify-end gap-4">
                                    <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-8 py-4 rounded-2xl text-text-muted font-black uppercase tracking-widest hover:bg-text/5 transition-all text-sm">
                                        Discard
                                    </button>
                                    <button type="submit" className="px-12 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all text-sm">
                                        Finalize Registration
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

export default Registration;
