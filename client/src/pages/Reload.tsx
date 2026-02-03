import React, { useState } from 'react';
import { Smartphone, Hash, Delete } from 'lucide-react';

const providers = [
    { name: 'Dialog', color: 'bg-red-600' },
    { name: 'Mobitel', color: 'bg-green-600' },
    { name: 'Hutch', color: 'bg-orange-500' },
    { name: 'Airtel', color: 'bg-red-500' },
];

const Reload = () => {
    const [number, setNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    const handleNumPress = (num: string) => {
        setAmount(prev => prev + num);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-center">
                Mobile Reload
            </h1>

            <div className="grid grid-cols-4 gap-4">
                {providers.map(p => (
                    <button
                        key={p.name}
                        onClick={() => setSelectedProvider(p.name)}
                        className={`py-4 rounded-xl font-bold transition-all ${selectedProvider === p.name
                                ? `${p.color} scale-105 shadow-lg ring-2 ring-white/20`
                                : 'bg-surface border border-white/10 text-gray-400 hover:bg-white/5'
                            }`}
                    >
                        {p.name}
                    </button>
                ))}
            </div>

            <div className="glass-card p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center gap-2">
                        <Smartphone size={16} /> Mobile Number
                    </label>
                    <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="w-full text-2xl font-mono bg-surface/50 border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 focus:outline-none tracking-wider"
                        placeholder="07xxxxxxxx"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-400 flex items-center gap-2">
                        <Hash size={16} /> Amount
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 text-4xl font-mono bg-surface/50 border border-white/10 rounded-xl px-4 py-4 text-primary font-bold flex items-center">
                            LKR {amount || '0'}
                        </div>
                        <button onClick={() => setAmount(prev => prev.slice(0, -1))} className="w-16 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all">
                            <Delete size={24} />
                        </button>
                    </div>
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumPress(num.toString())}
                            className="py-4 text-2xl font-bold bg-surface border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all"
                        >
                            {num}
                        </button>
                    ))}
                    <button className="py-4 text-xl font-bold bg-surface border border-white/5 rounded-xl hover:bg-white/10 active:scale-95 transition-all">.</button>
                    <button onClick={() => handleNumPress('0')} className="py-4 text-2xl font-bold bg-surface border border-white/5 rounded-xl hover:bg-white/10 active:scale-95 transition-all">0</button>
                    <button
                        onClick={() => {
                            if (!selectedProvider || !number || !amount) alert('Please fill all fields');
                            else alert(`Reloading ${selectedProvider} ${number} with LKR ${amount}`);
                        }}
                        className="py-4 text-xl font-bold bg-primary text-background rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reload;
