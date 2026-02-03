import React, { useState } from 'react';
import { Save, Printer, Smartphone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddJob = () => {
    const navigate = useNavigate();
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
        setLoading(true);
        try {
            const payload = {
                ...formData,
                deviceModel: `${formData.deviceBrand} ${formData.deviceModel}`, // Combine brand/model
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    New Repair Job
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary border-b border-white/10 pb-2 mb-4">
                        <User size={20} />
                        <h3 className="font-bold">Customer Details</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Mobile Number</label>
                        <input name="customerPhone" value={formData.customerPhone} onChange={handleChange} type="text" placeholder="07XXXXXXXX" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Customer Name</label>
                        <input name="customerName" value={formData.customerName} onChange={handleChange} type="text" placeholder="Full Name" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Address (Optional)</label>
                        <textarea name="customerAddress" value={formData.customerAddress} onChange={handleChange} placeholder="Address" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none h-20" />
                    </div>
                </div>

                {/* Device Details */}
                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary border-b border-white/10 pb-2 mb-4">
                        <Smartphone size={20} />
                        <h3 className="font-bold">Device Information</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Brand</label>
                            <input name="deviceBrand" value={formData.deviceBrand} onChange={handleChange} type="text" placeholder="e.g. Samsung" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Model</label>
                            <input name="deviceModel" value={formData.deviceModel} onChange={handleChange} type="text" placeholder="e.g. A12" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">IMEI / Serial No</label>
                        <input name="imei" value={formData.imei} onChange={handleChange} type="text" placeholder="Scan or Type IMEI" className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Fault Description</label>
                        <textarea name="issueDescription" value={formData.issueDescription} onChange={handleChange} placeholder="Describe the issue..." className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 focus:border-primary/50 focus:outline-none h-20" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="glass-card p-4 flex justify-end gap-4">
                <button
                    onClick={() => navigate('/repairs')}
                    className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-gray-300"
                >
                    Cancel
                </button>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-surface border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                        <Printer size={18} />
                        Save & Print
                    </button>
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? 'Creating...' : 'Create Job'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddJob;
