import React, { useState } from 'react';
import { Smartphone, RefreshCw, CheckCircle2, ChevronRight, DollarSign, Calculator, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TradeIn = () => {
    const [step, setStep] = useState(1);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [condition, setCondition] = useState<any>({});

    const brands = ['Apple', 'Samsung', 'Google', 'Xiaomi'];
    const models = {
        Apple: ['iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 13', 'iPhone 12'],
        Samsung: ['Galaxy S23 Ultra', 'Galaxy S22', 'Galaxy Z Fold 4'],
        Google: ['Pixel 7 Pro', 'Pixel 6a'],
        Xiaomi: ['13 Pro', '12T']
    };

    const conditionChecks = [
        { id: 'power', label: 'Powers On Normally' },
        { id: 'screen', label: 'Screen Intact (No Cracks/Bleeding)' },
        { id: 'body', label: 'Body Free of Major Dents' },
        { id: 'camera', label: 'Cameras Function Properly' },
        { id: 'icloud', label: 'iCloud/Google Account Removed' },
    ];

    const calculateValue = () => {
        let baseValue = 120000; // Mock base
        const failedChecks = Object.values(condition).filter(v => v === false).length;
        return baseValue - (failedChecks * 20000);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-text tracking-tight flex justify-center items-center gap-3">
                    <RefreshCw size={36} className="text-secondary" />
                    Device Trade-In Evaluator
                </h1>
                <p className="text-text-muted font-bold uppercase tracking-widest text-xs">
                    Automated Valuation & Diagnostics Wizard
                </p>
            </div>

            {/* Progress Bar */}
            <div className="flex justify-between items-center relative mb-12">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 -z-10 rounded-full" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-secondary -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }} />
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${step >= i ? 'bg-secondary text-white shadow-[0_0_20px_rgba(var(--color-secondary),0.5)]' : 'bg-background border-2 border-white/10 text-text-muted'}`}>
                        {i}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8 border-white/5">
                        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">1. Select Device</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block">Brand</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {brands.map(b => (
                                        <button key={b} onClick={() => { setSelectedBrand(b); setSelectedModel(''); }} className={`p-4 rounded-2xl font-bold transition-all border-2 ${selectedBrand === b ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/5 bg-white/5 hover:border-white/20 text-text'}`}>
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {selectedBrand && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block">Model</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {(models as any)[selectedBrand].map((m: string) => (
                                            <button key={m} onClick={() => setSelectedModel(m)} className={`p-4 rounded-2xl font-bold transition-all border-2 ${selectedModel === m ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/5 bg-white/5 hover:border-white/20 text-text'}`}>
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button disabled={!selectedModel} onClick={() => setStep(2)} className="bg-secondary text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 disabled:opacity-50 transition-all">
                                Continue <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8 border-white/5">
                        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                            <ShieldAlert size={24} className="text-secondary" />
                            2. 21-Point Inspection
                        </h2>
                        <div className="space-y-4">
                            {conditionChecks.map(check => (
                                <div key={check.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="font-bold text-text">{check.label}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCondition({...condition, [check.id]: true})} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${condition[check.id] === true ? 'bg-emerald-500 text-white border-emerald-500' : 'border-white/10 text-text-muted hover:border-emerald-500/50'}`}>Pass</button>
                                        <button onClick={() => setCondition({...condition, [check.id]: false})} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${condition[check.id] === false ? 'bg-red-500 text-white border-red-500' : 'border-white/10 text-text-muted hover:border-red-500/50'}`}>Fail</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(1)} className="text-text-muted hover:text-text px-8 py-3 rounded-2xl font-black transition-colors">Back</button>
                            <button disabled={Object.keys(condition).length < conditionChecks.length} onClick={() => setStep(3)} className="bg-secondary text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(var(--color-secondary),0.3)]">
                                Generate Valuation <Calculator size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 border-white/5 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                            <DollarSign size={48} className="text-white" />
                        </div>
                        <h2 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2">Estimated Trade-In Value</h2>
                        <div className="text-6xl font-black text-text font-mono tracking-tighter mb-4">
                            LKR {calculateValue().toLocaleString()}
                        </div>
                        <p className="text-text-muted max-w-md mx-auto mb-8 font-bold">
                            For a {selectedBrand} {selectedModel}. This offer is valid for 7 days. Customer must provide original ID for processing.
                        </p>
                        <div className="flex gap-4 w-full max-w-md">
                            <button className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-black transition-all hover:bg-white/20">
                                Save Quote
                            </button>
                            <button className="flex-1 bg-secondary text-white py-4 rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(var(--color-secondary),0.3)] flex items-center justify-center gap-2">
                                <CheckCircle2 size={20} /> Accept & Credit
                            </button>
                        </div>
                        <button onClick={() => { setStep(1); setSelectedBrand(''); setSelectedModel(''); setCondition({}); }} className="mt-8 text-xs font-black uppercase text-text-muted hover:text-text tracking-widest underline decoration-white/20 underline-offset-4">
                            Start New Evaluation
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TradeIn;
