import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Banknote, CreditCard, Smartphone, QrCode,
    Plus, Trash2, CheckCircle2, Printer, ChevronRight,
    AlertCircle, Wallet
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Receipt from '../common/Receipt';
import { CartItem } from '../../store/useStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentLine {
    id: string;
    method: 'Cash' | 'Card' | 'LankaQR' | 'eZCash' | 'Frimi' | 'mCash' | 'UPI';
    amount: number;
    reference?: string;
}

interface TaxSummary {
    subtotal: number;
    discount: number;
    vatAmount: number;
    ssclAmount: number;
    grandTotal: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    discount: number;
    tax: TaxSummary;
    cashierName: string;
    onSaleComplete: (payments: PaymentLine[]) => Promise<string | null>;
    onClear?: () => void;
    settings?: any;
}



// ─── Payment method config ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
    { id: 'Cash', label: 'Cash', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { id: 'Card', label: 'Card', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    { id: 'LankaQR', label: 'LankaQR', icon: QrCode, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { id: 'eZCash', label: 'eZ Cash', icon: Wallet, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { id: 'Frimi', label: 'Frimi', icon: Smartphone, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    { id: 'mCash', label: 'mCash', icon: Smartphone, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { id: 'UPI', label: 'UPI', icon: Smartphone, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
] as const;

// ─── LankaQR Mock Display ─────────────────────────────────────────────────────
const LankaQRDisplay: React.FC<{ amount: number }> = ({ amount }) => {
    const [confirmed, setConfirmed] = useState(false);
    return (
        <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
                animate={{ scale: confirmed ? [1, 1.05, 1] : [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`p-5 rounded-3xl border-2 ${confirmed ? 'border-emerald-500 bg-emerald-500/10' : 'border-purple-500/50 bg-purple-500/10'}`}
            >
                {/* Mock QR Grid */}
                {confirmed ? (
                    <CheckCircle2 size={80} className="text-emerald-500" />
                ) : (
                    <div className="grid grid-cols-7 gap-0.5 w-[112px] h-[112px]">
                        {Array.from({ length: 49 }).map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-[1px] ${[0, 1, 2, 3, 4, 5, 6, 7, 14, 21, 28, 35, 42, 43, 44, 45, 46, 47, 48, 6, 13, 20, 27, 34, 41, 10, 11, 12, 15, 22, 30, 17, 24, 31, 38].includes(i)
                                    ? 'bg-purple-500' : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
            <div className="text-center">
                <p className="text-2xl font-black text-text font-mono">LKR {amount.toLocaleString()}</p>
                {!confirmed ? (
                    <>
                        <p className="text-xs text-text-muted mt-1 animate-pulse">Awaiting customer scan...</p>
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-2">LANKAQR • EMV COMPLIANT</p>
                        <button
                            onClick={() => setConfirmed(true)}
                            className="mt-3 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-500/30 transition-all border border-purple-500/30"
                        >
                            Simulate Payment Received
                        </button>
                    </>
                ) : (
                    <p className="text-emerald-500 font-black text-sm mt-1 uppercase tracking-widest">✓ Payment Confirmed!</p>
                )}
            </div>
        </div>
    );
};

// ─── Main CheckoutModal ───────────────────────────────────────────────────────
const CheckoutModal: React.FC<CheckoutModalProps> = ({
    isOpen, onClose, cart, discount, tax, cashierName, onSaleComplete, onClear, settings
}) => {


    const [payments, setPayments] = useState<PaymentLine[]>([
        { id: '1', method: 'Cash', amount: tax.grandTotal, reference: '' }
    ]);
    const [selectedPayMethod, setSelectedPayMethod] = useState<PaymentLine['method']>('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [saleComplete, setSaleComplete] = useState(false);
    const [saleId, setSaleId] = useState<string | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({ contentRef: receiptRef });



    const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const remaining = Math.max(0, tax.grandTotal - totalPaid);
    const changeDue = totalPaid > tax.grandTotal ? totalPaid - tax.grandTotal : 0;
    const isFullyPaid = totalPaid >= tax.grandTotal;

    // Cash payment line - show change due
    const cashLines = payments.filter(p => p.method === 'Cash');
    const totalCash = cashLines.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const addPaymentLine = () => {
        const id = Date.now().toString();
        setPayments(prev => [...prev, {
            id,
            method: selectedPayMethod,
            amount: remaining > 0 ? remaining : 0,
            reference: ''
        }]);
    };

    const removePaymentLine = (id: string) => {
        if (payments.length === 1) return;
        setPayments(prev => prev.filter(p => p.id !== id));
    };

    const updatePayment = (id: string, field: 'amount' | 'method' | 'reference', value: string | number) => {
        setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleCompleteSale = async () => {
        if (!isFullyPaid) return;
        setIsProcessing(true);
        try {
            const id = await onSaleComplete(payments);
            if (id) {
                setSaleId(id);
                setSaleComplete(true);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintAndClose = () => {
        try { handlePrint(); } catch (e) { console.error('Print failed', e); }
        if (onClear) onClear();
        onClose();
        setSaleComplete(false);
        setSaleId(null);
        setPayments([{ id: '1', method: 'Cash', amount: tax.grandTotal, reference: '' }]);
    };


    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-[#0d1117] border border-white/10 rounded-[2rem] w-full max-w-5xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-7 border-b border-white/10 bg-white/3 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    {saleComplete ? '✅ Sale Completed' : 'Checkout'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5 font-mono uppercase tracking-widest">
                                    Cashier: {cashierName} · {new Date().toLocaleTimeString()}
                                </p>
                            </div>
                            {!saleComplete && (
                                <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Left: Order Summary */}
                            <div className="w-[45%] border-r border-white/10 flex flex-col overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Order Summary ({cart.length} items)</h3>
                                    <div className="space-y-2 overflow-y-auto max-h-[35vh] custom-scrollbar pr-2">
                                        {cart.map(item => (
                                            <div key={item._id} className="flex justify-between items-center text-sm py-2 border-b border-white/5">
                                                <div>
                                                    <span className="font-bold text-white">{item.name}</span>
                                                    <span className="text-gray-500 ml-2">×{item.quantity}</span>
                                                    {(item.tax_category === 'ZERO_RATED') && (
                                                        <span className="ml-2 text-[9px] bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5 font-black uppercase">ZR</span>
                                                    )}
                                                    {(item.tax_category === 'EXEMPT') && (
                                                        <span className="ml-2 text-[9px] bg-gray-500/20 text-gray-400 rounded-full px-2 py-0.5 font-black uppercase">Ex</span>
                                                    )}
                                                </div>
                                                <span className="font-mono font-bold text-white">
                                                    {(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tax Breakdown */}
                                <div className="p-6 space-y-2.5 flex-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Tax & Total Breakdown</h3>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="font-mono text-white">LKR {tax.subtotal.toLocaleString()}</span>
                                    </div>
                                    {tax.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-emerald-400">Discount</span>
                                            <span className="font-mono text-emerald-400">– LKR {tax.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {tax.vatAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-amber-400">VAT ({(settings?.vatRate * 100).toFixed(1)}%)</span>
                                            <span className="font-mono text-amber-400">+ LKR {tax.vatAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {tax.ssclAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-orange-400">SSCL ({(settings?.ssclRate * 100).toFixed(1)}%)</span>
                                            <span className="font-mono text-orange-400">+ LKR {tax.ssclAmount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <span className="text-white font-black text-xl">Grand Total</span>
                                        <span className="text-white font-black text-3xl font-mono tracking-tight">
                                            <span className="text-lg mr-1 text-gray-400">LKR</span>
                                            {tax.grandTotal.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Payment status bar */}
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-xs font-mono">
                                            <span className="text-gray-500">Paid: LKR {totalPaid.toLocaleString()}</span>
                                            <span className={remaining > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                                {remaining > 0 ? `Remaining: LKR ${remaining.toLocaleString()}` : `Change: LKR ${changeDue.toLocaleString()}`}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ width: `${Math.min(100, (totalPaid / tax.grandTotal) * 100)}%` }}
                                                transition={{ duration: 0.4 }}
                                                className={`h-full rounded-full ${isFullyPaid ? 'bg-emerald-500' : 'bg-primary'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Cash change due */}
                                    {changeDue > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mt-2"
                                        >
                                            <Banknote size={20} className="text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Change Due</p>
                                                <p className="text-2xl font-black font-mono text-emerald-400">LKR {changeDue.toLocaleString()}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Payment Methods */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {saleComplete ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 15 }}
                                        >
                                            <CheckCircle2 size={80} className="text-emerald-500" />
                                        </motion.div>
                                        <div className="text-center">
                                            <h3 className="text-3xl font-black text-white">Payment Received!</h3>
                                            {saleId && <p className="text-gray-400 font-mono mt-2">Ref: {saleId}</p>}
                                            {changeDue > 0 && (
                                                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                                                    <p className="text-sm text-emerald-400 font-bold">Return change to customer</p>
                                                    <p className="text-4xl font-black font-mono text-emerald-400 mt-1">LKR {changeDue.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handlePrintAndClose}
                                            className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 shadow-xl shadow-primary/30 transition-all active:scale-[0.98]"
                                        >
                                            <Printer size={20} /> Print Receipt & Close
                                        </button>
                                        <button onClick={onClose} className="text-gray-500 text-sm hover:text-gray-300 transition-colors font-bold">
                                            Skip Print & Close
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Payment Methods</h3>

                                        {/* Method Selector */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {PAYMENT_METHODS.map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setSelectedPayMethod(m.id as PaymentLine['method'])}
                                                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${selectedPayMethod === m.id
                                                        ? `${m.bg} ${m.border} ${m.color} scale-[1.03]`
                                                        : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <m.icon size={18} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">{m.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* LankaQR Display */}
                                        <AnimatePresence>
                                            {payments.some(p => p.method === 'LankaQR') && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-purple-500/5 border border-purple-500/20 rounded-2xl overflow-hidden"
                                                >
                                                    <LankaQRDisplay
                                                        amount={payments.filter(p => p.method === 'LankaQR').reduce((s, p) => s + p.amount, 0)}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Payment Lines */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payment Lines</h4>
                                                <button
                                                    onClick={addPaymentLine}
                                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all"
                                                >
                                                    <Plus size={14} /> Add {selectedPayMethod}
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {payments.map((payment, idx) => {
                                                    const methodConfig = PAYMENT_METHODS.find(m => m.id === payment.method);
                                                    return (
                                                        <motion.div
                                                            key={payment.id}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            className={`p-4 rounded-2xl border ${methodConfig?.border || 'border-white/10'} bg-white/3 flex gap-3 items-center`}
                                                        >
                                                            <div className={`p-2.5 rounded-xl ${methodConfig?.bg || 'bg-white/5'}`}>
                                                                {methodConfig && <methodConfig.icon size={18} className={methodConfig.color} />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${methodConfig?.color || 'text-gray-400'}`}>
                                                                    {payment.method}
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 flex-1">
                                                                        <span className="text-gray-500 text-xs font-bold">LKR</span>
                                                                        <input
                                                                            type="number"
                                                                            value={payment.amount || ''}
                                                                            onChange={e => updatePayment(payment.id, 'amount', Number(e.target.value))}
                                                                            className="w-full bg-transparent text-white font-mono font-black outline-none text-sm"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                    {(payment.method === 'Card' || payment.method === 'UPI') && (
                                                                        <input
                                                                            type="text"
                                                                            value={payment.reference || ''}
                                                                            onChange={e => updatePayment(payment.id, 'reference', e.target.value)}
                                                                            placeholder="Auth/Ref #"
                                                                            className="flex-1 bg-white/5 rounded-xl px-3 py-2 text-white text-xs font-mono outline-none border border-transparent focus:border-primary/50"
                                                                        />
                                                                    )}
                                                                </div>
                                                                {/* Cash change display inline */}
                                                                {payment.method === 'Cash' && Number(payment.amount) > tax.grandTotal && (
                                                                    <p className="text-emerald-400 text-[10px] font-black mt-1.5 uppercase tracking-widest">
                                                                        ↩ Change: LKR {(Number(payment.amount) - tax.grandTotal).toLocaleString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {payments.length > 1 && (
                                                                <button
                                                                    onClick={() => removePaymentLine(payment.id)}
                                                                    className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all shrink-0"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>

                                        {/* Validation warning */}
                                        {!isFullyPaid && (
                                            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
                                                <AlertCircle size={16} className="shrink-0" />
                                                <span className="text-xs font-bold">
                                                    LKR {remaining.toLocaleString()} still outstanding. Add more payment lines.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                {!saleComplete && (
                                    <div className="p-6 border-t border-white/10 shrink-0">
                                        <button
                                            onClick={handleCompleteSale}
                                            disabled={!isFullyPaid || isProcessing}
                                            className="w-full bg-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] text-lg"
                                        >
                                            {isProcessing ? (
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                                    <ChevronRight size={24} />
                                                </motion.div>
                                            ) : (
                                                <CheckCircle2 size={24} />
                                            )}
                                            {isProcessing ? 'Processing Sale...' : `Confirm Sale — LKR ${tax.grandTotal.toLocaleString()}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hidden Receipt for printing - Use off-screen instead of 'hidden' for better print reliability */}
                        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>

                            <Receipt
                                ref={receiptRef}
                                saleId={saleId || `INV-${Date.now()}`}
                                items={cart}
                                total={tax.grandTotal}
                                discount={tax.discount}
                                date={new Date().toLocaleString()}
                                vatAmount={tax.vatAmount}
                                ssclAmount={tax.ssclAmount}
                                grandTotal={tax.grandTotal}
                                payments={payments}
                                cashierName={cashierName}
                                settings={settings}
                            />

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
