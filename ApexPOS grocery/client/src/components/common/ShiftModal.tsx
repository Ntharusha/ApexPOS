import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Lock, Unlock, Banknote, AlertCircle, X, CheckCircle2, History } from 'lucide-react';
import { useStore } from '../../store/useStore';
import api from '../../api/axios';

interface ShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose }) => {
    const { user, theme, currentShift, setShift } = useStore();
    const [openingFloat, setOpeningFloat] = useState<number>(0);
    const [actualCash, setActualCash] = useState<number>(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isClosing = !!currentShift;

    const handleOpenShift = async () => {
        if (openingFloat < 0) return setError('Float cannot be negative');
        setLoading(true);
        setError('');
        try {
            const res = await api.post<any>('/shifts/open', {
                openingFloat,
                cashierId: user?.id,
                cashierName: user?.name,
                branchId: user?.branch_id || 'HQ'
            });
            setShift(res);

            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to open shift');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseShift = async () => {
        if (actualCash < 0) return setError('Actual cash count cannot be negative');
        setLoading(true);
        setError('');
        try {
            const res = await api.patch<any>(`/shifts/${currentShift?._id}/close`, {
                actualCash,
                notes
            });
            setShift(null);
            onClose();
            // Show variance summary? 
            alert(`Shift Closed.\nExpected Cash: LKR ${res.expectedCash.toLocaleString()}\nActual Cash: LKR ${res.actualCash.toLocaleString()}\nVariance: LKR ${res.variance.toLocaleString()}`);

        } catch (err: any) {
            setError(err.message || 'Failed to close shift');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = `w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-4 text-xl font-black text-text outline-none focus:border-primary transition-all text-center`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className={`${theme === 'light' ? 'bg-white' : 'bg-[#0b0f15]'} border border-text/10 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-text/10 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl shadow-lg ${isClosing ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {isClosing ? <Lock size={24} /> : <Unlock size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-text tracking-tight uppercase">
                                        {isClosing ? 'End Shift' : 'Start Shift'}
                                    </h2>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                                        Cashier: {user?.name} · {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-text/5 text-text-muted hover:text-text transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            {error && (
                                <div className="flex gap-2 items-center bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm font-bold">
                                    <AlertCircle size={20} className="shrink-0" /> {error}
                                </div>
                            )}

                            {!isClosing ? (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Opening Float (LKR)</label>
                                        <div className="relative group">
                                            <Banknote className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={24} />
                                            <input
                                                type="number"
                                                className={inputCls}
                                                placeholder="0.00"
                                                value={openingFloat || ''}
                                                onChange={e => setOpeningFloat(Number(e.target.value))}
                                                autoFocus
                                            />
                                        </div>
                                        <p className="text-[10px] text-text-muted/60 font-medium">Initial cash amount in the drawer</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[500, 1000, 2000, 5000].map(val => (
                                            <button key={val} onClick={() => setOpeningFloat(val)}
                                                className="py-3.5 rounded-xl border border-text/10 font-black text-xs hover:bg-primary/10 hover:border-primary/30 transition-all">
                                                LKR {val.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Shift Started At</p>
                                        <p className="text-xl font-black text-emerald-500 mt-1">
                                            {/* @ts-ignore */}
                                            {new Date(currentShift.startTime || Date.now()).toLocaleTimeString()}
                                        </p>
                                        <div className="h-[1px] bg-emerald-500/10 my-4" />
                                        <div className="flex justify-between text-xs font-bold text-text/60 px-4">
                                            <span>Opening Float:</span>
                                            <span>LKR {currentShift?.openingFloat?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Actual Cash in Drawer (LKR)</label>
                                        <input
                                            type="number"
                                            className={inputCls}
                                            placeholder="0.00"
                                            value={actualCash || ''}
                                            onChange={e => setActualCash(Number(e.target.value))}
                                            autoFocus
                                        />
                                        <p className="text-[10px] text-text-muted/60 font-medium">Count physical cash and enter total here</p>
                                    </div>

                                    <textarea
                                        className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'} border border-text/10 rounded-2xl px-5 py-4 text-sm font-medium text-text outline-none focus:border-primary transition-all resize-none`}
                                        rows={3}
                                        placeholder="Add notes (optional)..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-0">
                            <button
                                onClick={isClosing ? handleCloseShift : handleOpenShift}
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 ${isClosing
                                    ? 'bg-red-500 text-white shadow-red-500/30'
                                    : 'bg-primary text-white shadow-primary/30'
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        {isClosing ? 'Finalize & Close Shift' : 'Initialize Shift'}
                                    </>
                                )}
                            </button>
                            <p className="text-[9px] text-center text-text-muted font-bold uppercase tracking-widest mt-5">
                                CeylonPOS · Secure Cash Management System
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ShiftModal;
