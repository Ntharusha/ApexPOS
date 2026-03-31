import React, { useState } from 'react';
import { Smartphone, Hash, Delete, Send } from 'lucide-react';
import { useStore } from '../store/useStore';

const providers = [
    { name: 'Dialog', color: 'bg-[#ff0000]', logo: '🔴' },
    { name: 'Mobitel', color: 'bg-[#008000]', logo: '🟢' },
    { name: 'Hutch', color: 'bg-[#ff6600]', logo: '🟠' },
    { name: 'Airtel', color: 'bg-[#ed1c24]', logo: '🔴' },
];

const Reload = () => {
    const [number, setNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [activeInput, setActiveInput] = useState<'number' | 'amount'>('number');
    const theme = useStore(state => state.theme);

    const handleNumPress = (num: string) => {
        if (amount.length >= 6) return; // Limit amount
        setAmount(prev => prev + num);
    }

    const handleNumInput = (num: string) => {
        if (number.length >= 10) return;
        setNumber(prev => prev + num);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h1 className="text-3xl font-bold text-text text-center">
                Mobile Reload Center
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {providers.map(p => (
                    <button
                        key={p.name}
                        onClick={() => setSelectedProvider(p.name)}
                        className={`group relative p-6 rounded-3xl font-black transition-all overflow-hidden border-2 ${selectedProvider === p.name
                            ? 'border-primary shadow-2xl shadow-primary/20 scale-105'
                            : 'border-transparent glass-card hover:border-text/10'
                            }`}
                    >
                        <div className={`absolute top-0 right-0 w-16 h-16 ${p.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform`}></div>
                        <div className="flex flex-col items-center gap-3 relative z-10">
                            <span className="text-3xl">{p.logo}</span>
                            <span className={`tracking-widest uppercase text-xs ${selectedProvider === p.name ? 'text-primary' : 'text-text-muted'}`}>{p.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Input Section */}
                <div className="glass-card p-10 space-y-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                            <Smartphone size={14} className="text-primary" /> Target Mobile Number
                        </label>
                        <div className={`w-full flex items-center ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-3xl px-6 py-5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all`}>
                            <span className="text-2xl font-black text-text-muted mr-3 select-none">+94</span>
                            <input
                                type="text"
                                value={number}
                                readOnly
                                className="w-full text-3xl font-black font-mono bg-transparent text-text outline-none tracking-[0.2em]"
                                placeholder="7XXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                            <Hash size={14} className="text-primary" /> Reload Amount (LKR)
                        </label>
                        <div className="flex gap-4">
                            <div className={`flex-1 flex items-center ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-3xl px-8 py-6 transition-all`}>
                                <span className="text-4xl font-black text-primary font-mono select-none mr-4">LKR</span>
                                <span className="text-5xl font-black font-mono text-text tracking-tighter">
                                    {amount || '0'}
                                </span>
                            </div>
                            <button
                                onClick={() => setAmount(prev => prev.slice(0, -1))}
                                className="w-24 flex items-center justify-center bg-red-500/10 text-red-500 rounded-3xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                            >
                                <Delete size={32} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            if (!selectedProvider || number.length < 9 || !amount) {
                                alert('Please select provider, enter valid number and amount');
                            } else {
                                try {
                                    const res = await fetch('http://localhost:5000/api/reloads', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            provider: selectedProvider,
                                            number,
                                            amount: Number(amount)
                                        })
                                    });
                                    if (res.ok) {
                                        alert(`Successfully reloaded LKR ${amount} to ${selectedProvider} ${number}`);
                                        setNumber('');
                                        setAmount('');
                                        setSelectedProvider(null);
                                    }
                                } catch (error) {
                                    console.error('Error processing reload', error);
                                    alert('Failed to process reload. Please try again.');
                                }
                            }
                        }}
                        className="w-full py-6 rounded-[2rem] bg-primary text-white font-black text-xl flex items-center justify-center gap-4 hover:opacity-90 shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all tracking-widest uppercase"
                    >
                        <Send size={24} /> Confirm & Reload
                    </button>
                </div>

                {/* Keypad Section */}
                <div className="glass-card p-10">
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => {
                                    if (activeInput === 'number') handleNumInput(num.toString());
                                    else handleNumPress(num.toString());
                                }}
                                className={`py-8 text-3xl font-black rounded-3xl transition-all active:scale-90 ${theme === 'light' ? 'bg-white border border-slate-100 hover:bg-primary/5 hover:border-primary/20' : 'bg-surface border border-white/5 hover:bg-white/10'}`}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setNumber('');
                                setAmount('');
                            }}
                            className={`py-8 text-xs font-black uppercase tracking-widest rounded-3xl transition-all active:scale-90 ${theme === 'light' ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'}`}
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                if (activeInput === 'number') handleNumInput('0');
                                else handleNumPress('0');
                            }}
                            className={`py-8 text-3xl font-black rounded-3xl transition-all active:scale-90 ${theme === 'light' ? 'bg-white border border-slate-100 hover:bg-primary/5 hover:border-primary/20' : 'bg-surface border border-white/5 hover:bg-white/10'}`}
                        >
                            0
                        </button>
                        <button
                            onClick={() => setActiveInput(activeInput === 'number' ? 'amount' : 'number')}
                            className={`py-8 text-[10px] font-black uppercase tracking-[0.2em] leading-tight rounded-3xl transition-all active:scale-90 ${theme === 'light' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-primary/20 text-primary border border-primary/30'}`}
                        >
                            Switch Input
                            <div className="text-[8px] opacity-60 mt-1 font-bold italic italic">{activeInput === 'number' ? 'Current: Phone' : 'Current: Amount'}</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reload;
