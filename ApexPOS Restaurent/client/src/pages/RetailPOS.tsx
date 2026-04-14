import React, { useState, useEffect } from 'react';
import { 
    Search, ShoppingCart, Trash2, Plus, Minus, Tag, Zap, 
    AlertCircle, UserCircle, X, UtensilsCrossed, ChefHat, 
    ChevronLeft, Printer 
} from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from '../components/pos/CheckoutModal';
import CustomerCRMPanel from '../components/pos/CustomerCRMPanel';
import api from '../api/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const RetailPOS = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we opened POS from Table Management
    const tableContext = location.state?.table;
    const [activeTable, setActiveTable] = useState<any>(tableContext || null);

    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, setCart, theme, user, currentShift } = useStore();
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
    const [isKitchenSending, setIsKitchenSending] = useState(false);

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
            setCategories(['All', ...offlineCategories.map((c: any) => c.name)]);
            setProducts(offlineProducts);
            setLoading(false);
        }
    }, [isOnline, offlineProducts, offlineCategories]);
    
    // ─── Hospitality Cart Hydration ───────────────────────────────────────────
    useEffect(() => {
        if (tableContext?.currentOrder?.items) {
            const hydratedItems = tableContext.currentOrder.items.map((item: any) => ({
                _id: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                category: 'Hospitality', // Placeholder
                stock: 999, // Hospitality items assumed available if in order
                tax_category: item.tax_category || 'STANDARD',
                courseType: item.course
            }));
            setCart(hydratedItems);
            
            // Auto open checkout if requested
            if (location.state?.autoOpenCheckout) {
                setIsCheckoutOpen(true);
            }
        } else if (tableContext) {
            // New order for table, ensure cart is clear
            clearCart();
        }
    }, [tableContext, setCart, clearCart, location.state]);


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
            if (now - lastKeyTime > 80) buffer = '';
            lastKeyTime = now;

            if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                buffer += e.key;
            }

            if (e.key === 'Enter' && buffer.length > 2) {
                const scannedProduct = products.find(p => p.barcode === buffer);
                if (scannedProduct) {
                    addToCart(scannedProduct);
                    buffer = '';
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
            alert('Error: You must START A SHIFT before processing sales.');
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

        if (activeTable) {
            // Hospitality Mode: Finalize via hospitality controller
            try {
                const orderId = activeTable.currentOrder?._id;
                if (orderId) {
                    await api.post(`/hospitality/orders/${orderId}/pay`, { payments, saleData });
                    return `HOSP-${orderId}`;
                }
            } catch (err) {
                console.error("Failed to close hospitality order", err);
                return null;
            }
        }

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

    const handleSendToKitchen = async () => {
        if (!activeTable) return;
        setIsKitchenSending(true);
        try {
            const orderPayload = {
                tableId: activeTable._id,
                items: cart.map(i => ({
                    productId: i._id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    course: (i as any).courseType || 'Other',
                })),
                cashierName: user?.name || 'Cashier',
                orderType: 'Dine-In'
            };

            if (activeTable.currentOrder) {
                await api.patch(`/hospitality/orders/${activeTable.currentOrder._id}/items`, { items: orderPayload.items });
            } else {
                await api.post('/hospitality/orders', orderPayload);
            }
            
            alert(`Order sent to kitchen for Table ${activeTable.tableNumber}`);
            navigate('/hospitality'); 
        } catch (err) {
            console.error("Kitchen firing failed", err);
            alert("Failed to send order to kitchen.");
        } finally {
            setIsKitchenSending(false);
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
                    You cannot access the POS until you have opened a shift.
                </p>
                <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all mt-4">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6">
            <div className="flex-1 flex flex-col gap-5">
                <div className="glass-card p-4 flex gap-4 items-center">
                    {activeTable && (
                        <button 
                            onClick={() => navigate('/hospitality')}
                            className="p-3 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all border border-amber-500/20 flex items-center gap-2 group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <UtensilsCrossed size={20} />
                            <span className="font-black text-sm uppercase">Table {activeTable.tableNumber}</span>
                        </button>
                    )}
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
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar shrink-0 px-2">
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

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-text-muted italic">Loading products...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-text-muted opacity-40">
                            <Search size={64} strokeWidth={1.5} />
                            <p className="font-bold">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-10">
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
                                    <div className="flex gap-1 mt-1">
                                         {product.dietaryTags?.slice(0,1).map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-500">
                                                {tag}
                                            </span>
                                        ))}
                                         {product.courseType && (
                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-blue-500/20 text-blue-500">
                                                {product.courseType}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={`w-[420px] glass-card flex flex-col h-full border-l border-text/10 overflow-hidden shadow-2xl`}>
                <div className="p-5 border-b border-text/10 flex items-center justify-between bg-text/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <ShoppingCart size={22} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="font-black text-text lg:text-lg tracking-tight leading-none">
                                {activeTable ? `Table ${activeTable.tableNumber}` : 'Current Order'}
                            </h2>
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

                <div className={`px-4 py-3 border-b border-text/10 shrink-0 ${selectedCustomer ? (theme === 'light' ? 'bg-violet-50' : 'bg-violet-500/5') : ''}`}>
                    {selectedCustomer ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                                {selectedCustomer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-text truncate">{selectedCustomer.name}</p>
                                <p className="text-[10px] text-violet-500 font-bold">{selectedCustomer.loyaltyPoints || 0} pts</p>
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
                            <span className="text-xs font-bold text-text-muted group-hover:text-violet-500 transition-colors">Customer Profile</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4 opacity-40 pt-20">
                                <ShoppingCart size={64} strokeWidth={1.5} />
                                <p className="font-bold">Cart is empty</p>
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
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-text truncate text-sm leading-tight">{item.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-primary font-black text-sm font-mono">
                                                {(item.price * item.quantity).toLocaleString()}
                                            </span>
                                            {item.courseType && (
                                                <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                                    {item.courseType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className={`flex items-center ${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-xl border border-text/10`}>
                                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 px-2 hover:bg-text/5 text-text-muted">-</button>
                                            <span className="w-6 text-center font-black text-text font-mono text-xs">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 px-2 hover:bg-text/5 text-text-muted">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item._id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-5 bg-text/5 border-t border-text/10 space-y-4 shrink-0">
                    {cart.length > 0 && (
                        <div className={`${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-2xl p-4 space-y-2`}>
                            <div className="flex justify-between items-center text-xs font-bold text-text-muted">
                                <span>Grand Total</span>
                                <span className="text-primary text-xl font-black font-mono">LKR {tax.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {activeTable && (
                            <button
                                onClick={() => { if (cart.length > 0) setIsCheckoutOpen(true); }}
                                className="col-span-2 bg-white/5 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10 mb-2"
                            >
                                <Printer size={18} className="text-blue-400" />
                                <span className="text-[10px] uppercase tracking-widest">Print Pro-forma / Bill</span>
                            </button>
                        )}
                        {activeTable && (
                            <button
                                onClick={handleSendToKitchen}
                                disabled={cart.length === 0 || isKitchenSending}
                                className="flex-1 bg-amber-500 text-white font-black py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:opacity-90 shadow-xl shadow-amber-500/20 disabled:opacity-40"
                            >
                                {isKitchenSending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChefHat size={20} />}
                                <span className="text-[10px] uppercase tracking-widest">Kitchen fire</span>
                            </button>
                        )}
                        <button
                            onClick={() => { if (cart.length > 0) setIsCheckoutOpen(true); }}
                            disabled={cart.length === 0}
                            className={`${activeTable ? '' : 'col-span-2'} bg-primary text-white font-black py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:opacity-90 shadow-xl shadow-primary/25 disabled:opacity-40 transition-all`}
                        >
                            <Zap size={20} />
                            <span className="text-[10px] uppercase tracking-widest">Checkout</span>
                        </button>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                discount={discount}
                tax={tax}
                cashierName={user?.name || 'Cashier'}
                settings={settings}
                onSaleComplete={handleCompleteSale}
                onClear={() => { clearCart(); setDiscount(0); setSelectedCustomer(null); if(activeTable) navigate('/hospitality'); }}
                tableNumber={activeTable?.tableNumber}
                orderType="Dine-In"
            />

            <CustomerCRMPanel
                isOpen={isCRMOpen}
                onClose={() => setIsCRMOpen(false)}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={(customer) => {
                    setSelectedCustomer(customer);
                    if (customer) setIsCRMOpen(false);
                }}
                onAddRecommendation={(productId, name, price) => {
                    const product = products.find(p => p._id === productId);
                    if (product) addToCart(product);
                }}
            />
        </div>
    );
};

export default RetailPOS;
