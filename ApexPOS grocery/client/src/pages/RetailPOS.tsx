import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Tag, Zap } from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from '../components/pos/CheckoutModal';
import WeightInputModal from '../components/pos/WeightInputModal';
import api from '../api/axios';

const RetailPOS = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, user, currentShift } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [discount, setDiscount] = useState<number>(0);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
    const [weighingProduct, setWeighingProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(true);

    const PRODUCE_CATEGORIES = ['Vegetables', 'Fruits', 'Meat', 'Fish', 'Produce'];
    const { isOnline, offlineProducts, offlineCategories } = useStore();

    useEffect(() => {
        console.log('🛒 Current Cart State:', cart);
    }, [cart]);

    useEffect(() => {
        if (isOnline) {
            api.get<any[]>('/categories')
                .then(data => setCategories(['All', ...data.map(c => c.name)]))
                .catch(() => setCategories(['All', ...offlineCategories.map((c: any) => c.name)]));

            api.get<Product[]>('/products')
                .then(data => { setProducts(data); setLoading(false); })
                .catch(() => { setProducts(offlineProducts); setLoading(false); });

            api.get<any>('/settings').then(data => setSettings(data));
        } else {
            setCategories(['All', ...offlineCategories.map((c: any) => c.name)]);
            setProducts(offlineProducts);
            setLoading(false);
        }
    }, [isOnline, offlineProducts, offlineCategories]);

    const activeVatRate = settings?.vatEnabled ? (settings?.vatRate ?? 0.18) : 0;
    const activeSsclRate = settings?.ssclEnabled ? (settings?.ssclRate ?? 0.025) : 0;
    const ssclRatio = settings?.ssclRetailRatio ?? 0.5;

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const vatAmount = cart.reduce((vat, item) => {
        return (item.tax_category || 'STANDARD') === 'STANDARD' ? vat + (item.price * item.quantity * activeVatRate) : vat;
    }, 0);
    const ssclBase = (subtotal - discount) * ssclRatio;
    const ssclAmount = settings?.ssclEnabled ? (ssclBase * activeSsclRate) : 0;
    const grandTotal = Math.max(0, subtotal + vatAmount + ssclAmount - discount);

    const tax = {
        subtotal,
        discount,
        vatAmount,
        ssclAmount,
        grandTotal
    };

    const filteredProducts = products.filter(product => {
        const s = searchTerm.toLowerCase();
        const matchesSearch = (product.name?.toLowerCase().includes(s) || product.name_si?.toLowerCase().includes(s) || product.name_ta?.toLowerCase().includes(s) || product.barcode?.toLowerCase().includes(s));
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCompleteSale = async (payments: any[], customerId?: string, loyaltyDiscount?: number) => {
        if (user?.role === 'cashier' && !currentShift) {
            alert('Error: Start a shift first!');
            return null;
        }
        const saleData = {
            items: cart.map(item => ({ productId: item._id, name: item.name, price: item.price, quantity: item.quantity, tax_category: item.tax_category || 'STANDARD' })),
            discount, payments, cashierName: user?.name || 'Cashier', branchId: user?.branch_id || 'HQ', customerId, loyaltyDiscount,
            date: new Date().toISOString(),
        };

        try {
            const res = await api.post<any>('/sales', saleData);
            return res._id;
        } catch (error) {
            console.error("Sale failed", error);
            return `QUEUED-${Date.now()}`;
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 mt-2 relative">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="glass-card p-4 flex flex-col gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Scan barcode or search (EN/SI/TA)..."
                            className="w-full bg-background/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 items-center min-w-0">
                        <div className="flex-1 flex gap-2 overflow-x-auto pb-2 custom-scrollbar min-w-0">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-2px]' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 active:scale-95 shrink-0 ${isCartOpen ? 'bg-secondary text-white' : 'bg-primary text-white shadow-lg shadow-primary/20 animate-pulse'}`}
                        >
                            <ShoppingCart size={16} />
                            {isCartOpen ? 'Hide Cart' : 'Show Cart'}
                            {cart.length > 0 && <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">{cart.length}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar glass-card p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-text-muted italic">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                            {filteredProducts.map(product => (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ y: product.stock > 0 ? -4 : 0 }}
                                    onClick={() => {
                                        console.log('⚡ Adding Product to Cart:', product.name, product._id);
                                        if (product.stock <= 0) return alert("Out of stock!");
                                        if (PRODUCE_CATEGORIES.includes(product.category)) {
                                            setWeighingProduct(product);
                                            setIsWeightModalOpen(true);
                                        } else {
                                            addToCart(product);
                                        }
                                    }}
                                    className={`glass-card p-5 cursor-pointer transition-all border-2 ${product.stock > 0 ? 'border-transparent hover:border-primary/30 hover:shadow-lg' : 'opacity-50 grayscale cursor-not-allowed border-transparent'}`}
                                >
                                    <div className="aspect-square bg-background/50 rounded-2xl mb-4 flex items-center justify-center text-3xl">
                                        {product.category === 'Vegetables' ? '🥦' : '📦'}
                                    </div>
                                    <h3 className="font-black text-text leading-tight uppercase text-xs truncate mb-1">{product.name}</h3>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{product.category}</p>
                                            <p className="text-primary font-black text-sm font-mono mt-1">LKR {product.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-text-muted">{product.stock} PCS</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart (Toggleable) */}
            <AnimatePresence>
                {isCartOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-[420px] flex flex-col gap-6 h-full shrink-0"
                    >
                        <div className="flex-1 glass-card p-6 flex flex-col overflow-hidden relative">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart size={24} className="text-primary" />
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Active Cart</h2>
                                </div>
                                <button onClick={clearCart} className="p-3 text-text-muted hover:text-red-500 rounded-2xl"><Trash2 size={20}/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-0">
                                <AnimatePresence initial={false}>
                                    {cart.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
                                            <ShoppingCart size={64} className="mb-4" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">Cart is currently empty</p>
                                        </div>
                                    ) : cart.map((item) => (
                                        <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 rounded-[1.5rem] bg-background/40 border border-white/5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-sm font-black text-text leading-tight uppercase truncate">{item.name}</p>
                                                </div>
                                                <p className="text-sm font-black text-primary font-mono">LKR {(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-background/50 rounded-xl p-1 border border-white/5">
                                                    <button onClick={() => updateQuantity(item._id, item.quantity - (PRODUCE_CATEGORIES.includes(item.category) ? 0.1 : 1))} className="p-1.5"><Minus size={14}/></button>
                                                    <span className="w-14 text-center text-xs font-black font-mono">{PRODUCE_CATEGORIES.includes(item.category) ? item.quantity.toFixed(3) : item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, item.quantity + (PRODUCE_CATEGORIES.includes(item.category) ? 0.1 : 1))} className="p-1.5"><Plus size={14}/></button>
                                                </div>
                                                <button onClick={() => removeFromCart(item._id)} className="p-2 text-text-muted hover:text-red-500"><Trash2 size={16}/></button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 shrink-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-text-muted">Subtotal</span>
                                    <span className="font-black font-mono">LKR {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-sm font-black uppercase">Grand Total</span>
                                    <span className="text-2xl font-black text-gradient font-mono tracking-tighter">LKR {tax.grandTotal.toLocaleString()}</span>
                                </div>
                                <button disabled={cart.length === 0} onClick={() => setIsCheckoutOpen(true)} className="w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] bg-gradient-to-br from-primary to-emerald-600 text-white shadow-2xl active:scale-95 disabled:opacity-30">
                                    Secure Checkout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CheckoutModal
                isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cart={cart} discount={discount} tax={tax}
                cashierName={user?.name || 'Cashier'} settings={settings} onSaleComplete={handleCompleteSale} onClear={() => { clearCart(); setDiscount(0); }}
            />

            <WeightInputModal
                isOpen={isWeightModalOpen} onClose={() => { setIsWeightModalOpen(false); setWeighingProduct(null); }}
                product={weighingProduct} onConfirm={(w) => {
                    if (weighingProduct) {
                        addToCart(weighingProduct, w);
                    }
                }}
            />
        </div>
    );
};

export default RetailPOS;
