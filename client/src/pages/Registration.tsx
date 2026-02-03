import React, { useState, useEffect } from 'react';
import { User, Users, Briefcase, Truck, Plus, Edit2, Trash2, X, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Registration Hub
            </h1>

            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'customers' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Users size={20} /> Customers
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'staff' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Briefcase size={20} /> Staff
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'suppliers' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Truck size={20} /> Suppliers
                </button>
            </div>

            <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold capitalize">{activeTab} Directory</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-background px-4 py-2 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-2"
                    >
                        <Plus size={20} /> Add New
                    </button>
                </div>

                {getCurrentData().length === 0 ? (
                    <div className="bg-surface/30 rounded-lg p-10 flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>No {activeTab} records found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-3 text-gray-400 font-medium">Name</th>
                                    <th className="text-left p-3 text-gray-400 font-medium">Contact</th>
                                    {activeTab === 'staff' && <th className="text-left p-3 text-gray-400 font-medium">Role</th>}
                                    {activeTab === 'staff' && <th className="text-left p-3 text-gray-400 font-medium">Salary</th>}
                                    {activeTab === 'customers' && <th className="text-left p-3 text-gray-400 font-medium">Purchases</th>}
                                    {activeTab === 'suppliers' && <th className="text-left p-3 text-gray-400 font-medium">Company</th>}
                                    <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                                    <th className="text-left p-3 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getCurrentData().map((item: any) => (
                                    <tr key={item._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium text-white">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-300">{item.phone}</td>
                                        {activeTab === 'staff' && <td className="p-3"><span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">{item.role}</span></td>}
                                        {activeTab === 'staff' && <td className="p-3 text-gray-300">LKR {item.salary?.toLocaleString()}</td>}
                                        {activeTab === 'customers' && <td className="p-3 text-gray-300">LKR {item.totalPurchases?.toLocaleString()}</td>}
                                        {activeTab === 'suppliers' && <td className="p-3 text-gray-300">{item.company}</td>}
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${item.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <h2 className="text-xl font-bold text-white">Add New {activeTab.slice(0, -1)}</h2>
                                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                {activeTab === 'staff' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Name</label>
                                                <input required type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Email</label>
                                                <input required type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Phone</label>
                                                <input required type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">NIC</label>
                                                <input type="text" value={staffForm.nic} onChange={(e) => setStaffForm({ ...staffForm, nic: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Role</label>
                                                <select required value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none">
                                                    <option value="Admin">Admin</option>
                                                    <option value="Cashier">Cashier</option>
                                                    <option value="Technician">Technician</option>
                                                    <option value="Manager">Manager</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Salary (LKR)</label>
                                                <input required type="number" value={staffForm.salary} onChange={(e) => setStaffForm({ ...staffForm, salary: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Address</label>
                                            <textarea value={staffForm.address} onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" rows={2} />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'customers' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Name</label>
                                                <input required type="text" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Phone</label>
                                                <input required type="tel" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Email</label>
                                                <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">NIC</label>
                                                <input type="text" value={customerForm.nic} onChange={(e) => setCustomerForm({ ...customerForm, nic: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Address</label>
                                            <textarea value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" rows={2} />
                                        </div>
                                    </>
                                )}

                                {activeTab === 'suppliers' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Name</label>
                                                <input required type="text" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Company</label>
                                                <input type="text" value={supplierForm.company} onChange={(e) => setSupplierForm({ ...supplierForm, company: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Phone</label>
                                                <input required type="tel" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Email</label>
                                                <input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Address</label>
                                            <textarea value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" rows={2} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Payment Terms</label>
                                            <input type="text" value={supplierForm.paymentTerms} onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none" placeholder="e.g., Net 30" />
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                    <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-colors">
                                        Create
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
