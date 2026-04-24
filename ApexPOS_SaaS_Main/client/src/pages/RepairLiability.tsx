import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Camera, PenTool, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const RepairLiability = () => {
    const [signature, setSignature] = useState(false);
    const [issues, setIssues] = useState<{id: number, x: number, y: number, type: string}[]>([]);
    const [selectedType, setSelectedType] = useState('Scratch');

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setIssues([...issues, { id: Date.now(), x, y, type: selectedType }]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-text tracking-tight flex items-center gap-3">
                        <ShieldCheck size={36} className="text-secondary" />
                        Pre-Repair Liability Vault
                    </h1>
                    <p className="text-text-muted font-bold mt-1 uppercase tracking-widest text-xs">
                        Digital Condition Mapping & Customer Consent Contract
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Mapper */}
                <div className="lg:col-span-2 glass-card p-8 border-white/5 flex flex-col items-center">
                    <div className="w-full flex justify-between mb-6">
                        <h2 className="text-xl font-black text-text uppercase tracking-tight">Condition Wireframe</h2>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                            {['Scratch', 'Crack', 'Dent'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setSelectedType(t)}
                                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${selectedType === t ? 'bg-secondary text-white' : 'text-text-muted hover:text-text'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-64 h-[500px] border-4 border-white/20 rounded-[3rem] bg-black shadow-2xl overflow-hidden cursor-crosshair" onClick={handleImageClick}>
                        {/* Fake Phone Screen UI */}
                        <div className="absolute inset-2 border border-white/10 rounded-[2.5rem] bg-gray-900 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                            <Smartphone size={48} className="text-white/20 mb-4" />
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                Click anywhere on this diagram to mark physical damage before accepting the device.
                            </p>
                        </div>
                        
                        {/* Markers */}
                        {issues.map(issue => (
                            <div 
                                key={issue.id} 
                                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.8)] z-10 animate-bounce"
                                style={{ 
                                    left: `${issue.x}%`, 
                                    top: `${issue.y}%`,
                                    backgroundColor: issue.type === 'Scratch' ? '#f59e0b' : issue.type === 'Crack' ? '#ef4444' : '#6366f1' 
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-8 w-full flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <Camera size={20} className="text-text-muted" />
                            <span className="text-xs font-black text-text-muted uppercase tracking-widest">Attach Real Photos (Required)</span>
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all">
                            Upload
                        </button>
                    </div>
                </div>

                {/* Liability Contract */}
                <div className="glass-card p-8 border-white/5 flex flex-col">
                    <h2 className="text-xl font-black text-text uppercase tracking-tight mb-6 flex items-center gap-2">
                        <PenTool size={20} className="text-secondary"/> Customer Sign-Off
                    </h2>
                    
                    <div className="flex-1 bg-white/5 rounded-2xl p-6 border border-white/5 overflow-y-auto custom-scrollbar text-xs text-text-muted leading-relaxed font-medium space-y-4">
                        <p>I, the customer, acknowledge that the physical condition of the device has been accurately mapped out in this document.</p>
                        <p>I agree that the repair center is not liable for the pre-existing damage documented here, including but not limited to:</p>
                        <ul className="list-disc pl-4 space-y-1 font-bold text-white/70">
                            {issues.length === 0 ? <li>No damage documented.</li> : issues.map(i => (
                                <li key={i.id}>{i.type} at coordinates ({Math.round(i.x)}, {Math.round(i.y)})</li>
                            ))}
                        </ul>
                        <p>Furthermore, I understand that repairing certain devices carries inherent risks of data loss, and I confirm my data is backed up.</p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="h-32 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative group cursor-pointer" onClick={() => setSignature(true)}>
                            {!signature ? (
                                <span className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2 group-hover:text-text transition-colors">
                                    <PenTool size={16}/> Customer Signature Here
                                </span>
                            ) : (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_of_John_Hancock.svg" className="h-16 opacity-50 invert" alt="Signature" />
                            )}
                        </div>

                        <button 
                            disabled={!signature}
                            className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--color-secondary),0.3)] hover:opacity-90"
                        >
                            <CheckCircle2 size={18} /> Generate Immutable PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepairLiability;
