import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, CheckCircle2, AlertCircle, Percent, DollarSign, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import api from '../api/axios';

interface SystemSettings {
    businessName: string;
    vatRate: number;
    ssclRate: number;
    vatEnabled: boolean;
    ssclEnabled: boolean;
    ssclRetailRatio: number;
    currency: string;
}

const Settings = () => {
    const { theme, token } = useStore();
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await api.get<SystemSettings>('/settings');
            setSettings(data);
        } catch (e) {
            console.error(e);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.patch('/settings', settings);
            setSuccess('Settings updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const inputCls = `w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-3.5 text-text font-bold outline-none focus:border-primary transition-all text-sm`;
    const labelCls = 'text-[10px] font-black uppercase tracking-[0.15em] text-text-muted ml-1 mb-1.5 block';

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-text">System Settings</h1>
                    <p className="text-text-muted text-sm mt-1">Configure global tax rates and business information</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {error && (
                <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 font-bold">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {success && (
                <div className="flex gap-2 items-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-500 font-bold">
                    <CheckCircle2 size={20} /> {success}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <SettingsIcon size={20} className="text-blue-500" />
                        </div>
                        <h2 className="text-lg font-black text-text">General Config</h2>
                    </div>

                    <div>
                        <label className={labelCls}>Business Name</label>
                        <input
                            className={inputCls}
                            value={settings?.businessName}
                            onChange={e => setSettings(s => s ? { ...s, businessName: e.target.value } : null)}
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Base Currency</label>
                        <input
                            className={inputCls}
                            value={settings?.currency}
                            onChange={e => setSettings(s => s ? { ...s, currency: e.target.value } : null)}
                        />
                    </div>
                </motion.div>

                {/* Tax Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8 space-y-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                            <Percent size={20} className="text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-black text-text">Tax Configuration (SL)</h2>
                    </div>

                    <div className="space-y-6">
                        {/* VAT Toggle & Rate */}
                        <div className={`p-5 rounded-3xl border transition-all ${settings?.vatEnabled ? 'border-primary/20 bg-primary/5' : 'border-text/10 bg-text/5 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-black text-sm text-text">VAT (Value Added Tax)</span>
                                <button
                                    onClick={() => setSettings(s => s ? { ...s, vatEnabled: !s.vatEnabled } : null)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings?.vatEnabled ? 'bg-primary' : 'bg-text/20'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.vatEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className={labelCls}>Current Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            disabled={!settings?.vatEnabled}
                                            className={inputCls}
                                            value={(settings?.vatRate || 0) * 100}
                                            onChange={e => setSettings(s => s ? { ...s, vatRate: Number(e.target.value) / 100 } : null)}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted font-black">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SSCL Toggle & Rate */}
                        <div className={`p-5 rounded-3xl border transition-all ${settings?.ssclEnabled ? 'border-violet-500/20 bg-violet-500/5' : 'border-text/10 bg-text/5 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-black text-sm text-text">SSCL (Social Security)</span>
                                <button
                                    onClick={() => setSettings(s => s ? { ...s, ssclEnabled: !s.ssclEnabled } : null)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings?.ssclEnabled ? 'bg-violet-500' : 'bg-text/20'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.ssclEnabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={!settings?.ssclEnabled}
                                            className={inputCls}
                                            value={(settings?.ssclRate || 0) * 100}
                                            onChange={e => setSettings(s => s ? { ...s, ssclRate: Number(e.target.value) / 100 } : null)}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted font-black">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Retail Ratio</label>
                                    <input
                                        type="number"
                                        step="0.05"
                                        disabled={!settings?.ssclEnabled}
                                        className={inputCls}
                                        value={settings?.ssclRetailRatio}
                                        onChange={e => setSettings(s => s ? { ...s, ssclRetailRatio: Number(e.target.value) } : null)}
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-text-muted font-bold mt-3 ml-1 italic">
                                * SSCL usually applies at 2.5% on 50% of turnover for retailers.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Warning card if both disabled */}
            {settings && !settings.vatEnabled && !settings.ssclEnabled && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center gap-6"
                >
                    <div className="p-4 bg-amber-500/20 rounded-3xl shrink-0">
                        <Ban size={32} className="text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-amber-500">Tax-Free Mode Active</h3>
                        <p className="text-text-muted font-medium mt-1">
                            VAT and SSCL are currently disabled. All new sales will be processed without tax calculations.
                            This is suitable for businesses below the registration threshold.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Settings;
