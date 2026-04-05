import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Tag, Zap, AlertCircle, UserCircle, X } from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from '../components/pos/CheckoutModal';
import CustomerCRMPanel from '../components/pos/CustomerCRMPanel';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const RetailPOS = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, theme, user, currentShift, token } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<any>(null);


    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [discount, setDiscount] = useState<number>(0);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCRMOpen, setIsCRMOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);



    const { isOnline, offlineProducts, offlineCategories } = useStore();

    useEffect(() => {
        if (isOnline) {
            api.get<any[]>('/categories')
                .then(data => setCategories(['All', ...data.map(c => c.name)]))
                .catch(err => {
                    console.error("Failed to fetch categories", err);
                    setCategories(['All', ...offlineCategories.map((c: any) => c.name)]);
                });

            api.get<Product[]>('/products')
                .then(data => { setProducts(data); setLoading(false); })
                .catch(err => {
                    console.error("Failed to fetch products", err);
                    setProducts(offlineProducts);
                    setLoading(false);
                });

            api.get<any>('/settings')
                .then(data => setSettings(data))
                .catch(err => console.error("Failed to fetch settings", err));
        } else {
            // Use offline data
            setCategories(['All', ...offlineCategories.map((c: any) => c.name)]);
            setProducts(offlineProducts);
            setLoading(false);
        }
    }, [isOnline, offlineProducts, offlineCategories]);


    // ─── Tax Calculations (Dynamic) ──────────────────────────────────────────
    const activeVatRate = settings?.vatEnabled ? (settings?.vatRate ?? 0.18) : 0;
    const activeSsclRate = settings?.ssclEnabled ? (settings?.ssclRate ?? 0.025) : 0;
    const ssclRatio = settings?.ssclRetailRatio ?? 0.5;

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const vatAmount = cart.reduce((vat, item) => {
        if ((item.tax_category || 'STANDARD') === 'STANDARD') {
            return vat + (item.price * item.quantity * activeVatRate);
        }
        return vat;
    }, 0);
    const ssclBase = (subtotal - discount) * ssclRatio;
    const ssclAmount = settings?.ssclEnabled ? (ssclBase * activeSsclRate) : 0;
    const grandTotal = Math.max(0, subtotal + vatAmount + ssclAmount - discount);


    const tax = {
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discount),
        vatAmount: Number(vatAmount.toFixed(2)),
        ssclAmount: Number(ssclAmount.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2)),
    };

    // ─── Barcode Scanner Listener ─────────────────────────────────────────────
    useEffect(() => {
        let buffer = '';
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            const now = Date.now();

            // Scanners usually type very fast. If it's been a while, reset the buffer.
            if (now - lastKeyTime > 80) {
                buffer = '';
            }

            lastKeyTime = now;

            // If it's alphanumeric, add to buffer
            if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                buffer += e.key;
            }

            // Scanners usually end with "Enter"
            if (e.key === 'Enter' && buffer.length > 2) {
                const scannedProduct = products.find(p => p.barcode === buffer);
                if (scannedProduct) {
                    addToCart(scannedProduct);
                    buffer = '';
                    // Prevent form submission or other default Enter behaviors
                    e.preventDefault();
                } else {
                    buffer = '';
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [products, addToCart]);

    const displayProducts = isOnline ? products : offlineProducts;

    const filteredProducts = displayProducts.filter(product => {
        const pName = product.name || '';
        const pBarcode = product.barcode || '';
        const matchesSearch =
            pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pBarcode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });


    // ─── Complete Sale (called by CheckoutModal) ───────────────────────────────
    const handleCompleteSale = async (payments: { method: string; amount: number; reference?: string }[]): Promise<string | null> => {
        if (user?.role === 'cashier' && !currentShift) {
            alert('Error: You must START A SHIFT before processing sales. Use the user menu in the header to start your shift.');
            return null;
        }
        const { isOnline, queueSale } = useStore.getState();

        const saleData = {
            items: cart.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                tax_category: item.tax_category || 'STANDARD',
            })),
            discount,
            payments: payments.map(p => ({ method: p.method, amount: Number(p.amount), reference: p.reference })),
            cashierName: user?.name || 'Cashier',
            branchId: user?.branch_id || 'HQ',
            customerId: selectedCustomer?._id || undefined,
            date: new Date().toISOString(),
        };

        if (!isOnline) {
            queueSale(saleData);
            return `OFFLINE-${Date.now()}`;
        }

        try {
            const data = await api.post<any>('/sales', saleData);
            return data._id || 'SALE-OK';
        } catch (error: any) {
            console.warn("Network failed, queuing sale offline.", error);
            queueSale(saleData);
            return `OFFLINE-${Date.now()}`;
        }

    };

    if (user?.role === 'cashier' && !currentShift) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] w-full gap-5">
                <div className="text-red-500/50 mb-2">
                    <AlertCircle size={80} />
                </div>
                <h1 className="text-4xl font-black text-text">Shift Not Started</h1>
                <p className="text-text-muted text-lg max-w-md text-center">
                    You cannot access the Retail POS until you have opened a shift.
                    Please use the system menu to start your shift.
                </p>
                <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all mt-4">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6">
            {/* ── Left: Product Grid ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-5">
                {/* Search & Filter Bar */}
                <div className="glass-card p-4 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or scan barcode..."
                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/10 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text placeholder-text-muted transition-all`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-[500px] custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition-all border font-bold text-sm ${selectedCategory === cat
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-text/5 text-text-muted border-transparent hover:bg-text/10 hover:text-text'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-text-muted italic">Loading products...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-text-muted opacity-40">
                            <Search size={64} strokeWidth={1.5} />
                            <p className="font-bold">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                            {filteredProducts.map(product => (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ y: product.stock > 0 ? -4 : 0 }}
                                    whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                                    onClick={() => {
                                        if (product.stock > 0) addToCart(product);
                                        else alert("Item is Out of Stock!");
                                    }}
                                    className={`glass-card p-5 cursor-pointer transition-all relative overflow-hidden group border-2 ${product.stock > 0
                                        ? 'border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
                                        : 'opacity-50 grayscale cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    {/* Tax badge */}
                                    {product.tax_category && product.tax_category !== 'STANDARD' && (
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${product.tax_category === 'ZERO_RATED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {product.tax_category === 'ZERO_RATED' ? 'Zero Rated' : 'Exempt'}
                                        </div>
                                    )}
                                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${product.stock > 0
                                        ? (theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-surface/80 text-gray-300')
                                        : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock}` : 'Out'}
                                    </div>
                                    <div className={`h-28 mb-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} rounded-2xl flex items-center justify-center text-5xl transition-transform group-hover:scale-110`}>
                                        {product.stock > 0 ? '📦' : '🚫'}
                                    </div>
                                    <h3 className="font-bold text-text truncate mb-1 text-sm">{product.name}</h3>
                                    <p className="text-primary font-black text-lg font-mono">LKR {product.price.toLocaleString()}</p>
                                    {product.tax_category === 'STANDARD' && (
                                        <p className="text-[9px] text-text-muted mt-0.5">+VAT+SSCL</p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right: Cart Panel ─────────────────────────────────────────── */}
            <div className={`w-[420px] glass-card flex flex-col h-full border-l border-text/10 overflow-hidden shadow-2xl`}>
                <div className="p-5 border-b border-text/10 flex items-center justify-between bg-text/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <ShoppingCart size={22} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="font-black text-text lg:text-lg tracking-tight leading-none">Current Order</h2>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>

                {/* Customer CRM Badge */}
                <div className={`px-4 py-3 border-b border-text/10 shrink-0 ${selectedCustomer ? (theme === 'light' ? 'bg-violet-50' : 'bg-violet-500/5') : ''}`}>
                    {selectedCustomer ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                                {selectedCustomer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-text truncate">{selectedCustomer.name}</p>
                                <p className="text-[10px] text-violet-500 font-bold">{selectedCustomer.loyaltyPoints || 0} loyalty pts</p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="p-1.5 rounded-lg hover:bg-text/10 text-text-muted hover:text-red-400 transition-all">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCRMOpen(true)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border border-dashed ${theme === 'light' ? 'border-slate-300 hover:border-violet-400 hover:bg-violet-50' : 'border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5'} transition-all group`}
                        >
                            <UserCircle size={20} className="text-text-muted group-hover:text-violet-500 transition-colors" />
                            <span className="text-xs font-bold text-text-muted group-hover:text-violet-500 transition-colors">Link Customer Profile</span>
                        </button>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4 opacity-40 pt-20">
                                <ShoppingCart size={64} strokeWidth={1.5} />
                                <p className="font-bold">No items in cart</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} p-4 rounded-2xl flex gap-3 border border-transparent hover:border-text/5 transition-all group`}
                                >
                                    <div className={`w-12 h-12 ${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                                        📦
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-text truncate text-sm leading-tight">{item.name}</h4>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-primary font-black text-sm font-mono">
                                                {(item.price * item.quantity).toLocaleString()}
                                            </span>
                                            {(item.tax_category || 'STANDARD') === 'STANDARD' && (
                                                <span className="text-[9px] text-amber-500 font-bold">+tax</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className={`flex items-center ${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-xl overflow-hidden border border-text/10 shadow-sm`}>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="p-1.5 hover:bg-text/5 text-text-muted hover:text-text transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-black text-text font-mono text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="p-1.5 hover:bg-text/5 text-text-muted hover:text-text transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer: Tax Summary & Checkout */}
                <div className="p-5 bg-text/5 border-t border-text/10 space-y-4 shrink-0">
                    {/* Discount Row */}
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-text-muted font-bold">
                            <Tag size={14} className="text-emerald-500" />
                            Discount (LKR)
                        </div>
                        <input
                            type="number"
                            value={discount === 0 ? '' : discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-24 text-right bg-emerald-500/10 border-none rounded-lg px-2 py-1 text-emerald-500 font-mono font-black focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    {/* Tax Breakdown Preview */}
                    {cart.length > 0 && (
                        <div className={`${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-2xl p-4 space-y-2`}>
                            <div className="flex justify-between text-xs text-text-muted">
                                <span>Subtotal</span>
                                <span className="font-mono">LKR {tax.subtotal.toLocaleString()}</span>
                            </div>
                            {tax.vatAmount > 0 && (
                                <div className="flex justify-between text-xs text-amber-500">
                                    <span>VAT ({((settings?.vatRate ?? 0.18) * 100).toFixed(1)}%)</span>
                                    <span className="font-mono">+ LKR {tax.vatAmount.toLocaleString()}</span>
                                </div>
                            )}
                            {tax.ssclAmount > 0 && (
                                <div className="flex justify-between text-xs text-orange-500">
                                    <span>SSCL ({((settings?.ssclRate ?? 0.025) * 100).toFixed(1)}%)</span>
                                    <span className="font-mono">+ LKR {tax.ssclAmount.toLocaleString()}</span>
                                </div>
                            )}

                            {tax.discount > 0 && (
                                <div className="flex justify-between text-xs text-emerald-500">
                                    <span>Discount</span>
                                    <span className="font-mono">– LKR {tax.discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-text/10">
                                <span className="text-text font-black">Grand Total</span>
                                <span className="text-primary font-black text-xl font-mono">LKR {tax.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Checkout Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { if (cart.length > 0) setIsCheckoutOpen(true); }}
                        disabled={cart.length === 0}
                        className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:opacity-90 shadow-xl shadow-primary/25 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Zap size={22} />
                        <span className="text-lg">Proceed to Checkout</span>
                    </motion.button>
                </div>
            </div>

            {/* ── Checkout Modal ─────────────────────────────────────────────── */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                discount={discount}
                tax={tax}
                cashierName={user?.name || 'Cashier'}
                settings={settings}
                onSaleComplete={handleCompleteSale}
                onClear={() => { clearCart(); setDiscount(0); setSelectedCustomer(null); }}
            />

            {/* ── Customer CRM Panel ──────────────────────────────────────── */}
            <CustomerCRMPanel
                isOpen={isCRMOpen}
                onClose={() => setIsCRMOpen(false)}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={(customer) => {
                    setSelectedCustomer(customer);
                    if (customer) setIsCRMOpen(false);
                }}
                onAddRecommendation={(productId, name, price) => {
                    // Try to find the product in loaded products for full data
                    const product = products.find(p => p._id === productId);
                    if (product) {
                        addToCart(product);
                    } else {
                        // Fallback: add with minimal data
                        addToCart({
                            _id: productId,
                            name,
                            price,
                            category: '',
                            stock: 999,
                        });
                    }
                }}
            />


        </div>
    );
};

export default RetailPOS;
