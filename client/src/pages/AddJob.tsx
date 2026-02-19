import React, { useState } from 'react';
import { Save, Printer, Smartphone, User, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const AddJob = () => {
    const navigate = useNavigate();
    const { theme } = useStore();
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        deviceBrand: '',
        deviceModel: '',
        imei: '',
        issueDescription: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.customerName || !formData.customerPhone || !formData.deviceModel) {
            alert('Please fill in required fields');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...formData,
                deviceModel: `${formData.deviceBrand} ${formData.deviceModel}`,
                status: 'Pending'
            };

            const res = await fetch('http://localhost:5000/api/repairs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Job Created Successfully');
                navigate('/repairs');
            } else {
                alert('Failed to create job');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text">
                    New Repair Job
                </h1>
                <button
                    onClick={() => navigate('/repairs')}
                    className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors"
                >
                    <History size={20} /> View All Jobs
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div className="glass-card p-8 space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b border-text/10 pb-4 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User size={22} />
                        </div>
                        <h3 className="font-black uppercase tracking-tight">Customer Information</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">Mobile Number</label>
                        <input
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            type="text"
                            placeholder="07XXXXXXXX"
                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all placeholder-text-muted`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">Customer Name</label>
                        <input
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            type="text"
                            placeholder="Full Name"
                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all placeholder-text-muted`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">Address (Optional)</label>
                        <textarea
                            name="customerAddress"
                            value={formData.customerAddress}
                            onChange={handleChange}
                            placeholder="Street, City..."
                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all h-28 placeholder-text-muted`}
                        />
                    </div>
                </div>

                {/* Device Details */}
                <div className="glass-card p-8 space-y-6">
                    <div className="flex items-center gap-3 text-primary border-b border-text/10 pb-4 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Smartphone size={22} />
                        </div>
                        <h3 className="font-black uppercase tracking-tight">Device Details</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted ml-1">Brand</label>
                            <input
                                name="deviceBrand"
                                value={formData.deviceBrand}
                                onChange={handleChange}
                                type="text"
                                placeholder="e.g. Samsung"
                                className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all placeholder-text-muted`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-muted ml-1">Model</label>
                            <input
                                name="deviceModel"
                                value={formData.deviceModel}
                                onChange={handleChange}
                                type="text"
                                placeholder="e.g. S23 Ultra"
                                className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all placeholder-text-muted`}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">IMEI / Serial No</label>
                        <input
                            name="imei"
                            value={formData.imei}
                            onChange={handleChange}
                            type="text"
                            placeholder="Unique identifier..."
                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all placeholder-text-muted font-mono`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-muted ml-1">Fault Description</label>
                        <textarea
                            name="issueDescription"
                            value={formData.issueDescription}
                            onChange={handleChange}
                            placeholder="What's wrong with the device?"
                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl px-5 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-text transition-all h-28 placeholder-text-muted`}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-text-muted text-sm font-bold italic">
                    All repair jobs are logged for warranty tracking purposes.
                </p>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/repairs')}
                        className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl border border-text/10 hover:bg-text/5 font-bold text-text-muted transition-all"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3 flex-1 md:flex-none">
                        <button className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl ${theme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-surface border border-primary/20 text-primary'} hover:bg-primary/10 transition-all font-bold`}>
                            <Printer size={20} />
                            Save & Print
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleSubmit}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3.5 rounded-2xl bg-primary text-white font-black hover:opacity-90 shadow-xl shadow-primary/25 transition-all disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'Processing...' : 'Create Job'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddJob;
