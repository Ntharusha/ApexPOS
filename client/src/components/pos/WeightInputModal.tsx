import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, CheckCircle2, ChevronRight } from 'lucide-react';

interface WeightInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onConfirm: (weight: number) => void;
}

const WeightInputModal: React.FC<WeightInputModalProps> = ({ isOpen, onClose, product, onConfirm }) => {
    const [weight, setWeight] = useState<string>('0.500');
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        if (isOpen) {
            setWeight('0.500'); // Reset to default 500g
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const w = parseFloat(weight);
        if (w > 0) {
            onConfirm(w);
            onClose();
        }
    };

    const addDigit = (digit: string) => {
        if (weight === '0.000') setWeight('0.00' + digit);
        else setWeight(prev => {
            const val = (parseFloat(prev + digit) / 10).toFixed(3);
            return val;
        });
    };

    // Simple keypad for weight
    const Keypad = () => (
        <div className="grid grid-cols-3 gap-3 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'C'].map((k) => (
                <button
                    key={k}
                    onClick={() => {
                        if (k === 'C') setWeight('0.000');
                        else if (k === '.') return; // Not handled simple way here
                        else addDigit(k.toString());
                    }}
                    className="h-16 rounded-2xl bg-white/5 border border-white/10 text-xl font-black text-white hover:bg-primary/20 hover:border-primary/50 transition-all active:scale-95"
                >
                    {k}
                </button>
            ))}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-[#0d1117] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-1">
                                        <Scale size={14} /> Smart Produce Scale
                                    </div>
                                    <h2 className="text-2xl font-black text-white">{product?.name}</h2>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Price: LKR {product?.price.toLocaleString()} / kg</p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Weight Display Visualizer */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 relative z-10">Measured Weight</span>
                                <div className="flex items-baseline gap-2 relative z-10">
                                    <span className="text-6xl font-black text-white font-mono tracking-tighter">{weight}</span>
                                    <span className="text-2xl font-black text-primary font-mono">kg</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-sm relative z-10">
                                    <span>Total: LKR {(product?.price * parseFloat(weight)).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Scale Slider Simulation */}
                            <input 
                                type="range" 
                                min="0.05" 
                                max="10" 
                                step="0.05" 
                                value={weight} 
                                onChange={(e) => setWeight(parseFloat(e.target.value).toFixed(3))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary mb-8"
                            />

                            <button
                                onClick={handleConfirm}
                                className="w-full bg-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] text-lg"
                            >
                                <CheckCircle2 size={24} /> Confirm & Add to Cart
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WeightInputModal;
