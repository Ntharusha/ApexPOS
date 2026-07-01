import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Tag, Zap, UtensilsCrossed, X } from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from '../components/pos/CheckoutModal';
import api from '../api/axios';

const RetailPOS = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, user, currentShift, posMode, activeTable, setActiveTable } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [discount, setDiscount] = useState<number>(0);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    
    // Advanced Item Options
    const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    
    const [isCartOpen, setIsCartOpen] = useState(cart.length > 0);
    const previousCartLength = useRef(cart.length);

    const PRODUCE_CATEGORIES = ['Vegetables', 'Fruits', 'Meat', 'Fish', 'Produce'];
    const { isOnline, offlineProducts, offlineCategories } = useStore();

    // Auto-hide/open cart UX
    useEffect(() => {
        if (cart.length > 0 && previousCartLength.current === 0) {
            setIsCartOpen(true); // Auto-open when first item is added
        } else if (cart.length === 0) {
            setIsCartOpen(false); // Auto-hide when cart becomes empty
        }
        previousCartLength.current = cart.length;
    }, [cart.length]);

    useEffect(() => {
        if (isOnline) {
            api.get<any[]>(`/categories?mode=${posMode}`)
                .then(data => setCategories(['All', ...data.map(c => c.name)]))
                .catch(() => setCategories(['All', ...offlineCategories.map((c: any) => c.name)]));

            api.get<Product[]>(`/products?mode=${posMode}`)
                .then(data => { setProducts(data); setLoading(false); })
                .catch(() => { setProducts(offlineProducts); setLoading(false); });

            api.get<any>('/settings').then(data => setSettings(data));
        } else {
            setCategories(['All', ...offlineCategories.map((c: any) => c.name)]);
            setProducts(offlineProducts);
            setLoading(false);
        }
    }, [isOnline, offlineProducts, offlineCategories, posMode]);

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
        const matchesMode = product.business_type === posMode;
        return matchesSearch && matchesCategory && matchesMode;
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
            business_type: posMode,
        };

        try {
            // If there's an active restaurant table, sync items to that order first
            if (posMode === 'restaurant' && activeTable) {
                const orderId = activeTable.currentOrder?._id || activeTable.currentOrder;
                if (orderId) {
                    await api.patch(`/hospitality/orders/${orderId}/items`, {
                        items: cart.map(item => ({
                            productId: item._id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        }))
                    });
                    await api.post(`/hospitality/orders/${orderId}/pay`);
                }
            }

            const res = await api.post<any>('/sales', saleData);
            
            // Clear active table after successful checkout in restaurant mode
            if (activeTable) setActiveTable(null);
            
            return res._id;
        } catch (error) {
            console.error("Sale failed", error);
            return `QUEUED-${Date.now()}`;
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-4 mt-2 relative overflow-hidden">
            {/* Active Table Banner for Restaurant Mode */}
            {posMode === 'restaurant' && activeTable && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-primary text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/20 animate-bounce">
                    <UtensilsCrossed size={16} />
                    <span className="font-black uppercase tracking-widest text-xs">Serving Table {activeTable.tableNumber}</span>
                    <button onClick={() => setActiveTable(null)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {filteredProducts.map(product => (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ y: product.stock > 0 ? -4 : 0 }}
                                    onClick={() => {
                                        if (product.stock <= 0) return alert("Out of stock!");
                                        
                                        // Check if this product needs extra options (IMEI, Weight, Notes)
                                        const needsIMEI = posMode === 'mobile' && (product.category === 'Smartphones' || product.category === 'Tablets');
                                        const needsWeight = (product as any).unit_type === 'kg' || ['Vegetables', 'Fruits'].includes(product.category);
                                        const needsNotes = posMode === 'restaurant';

                                        if (needsIMEI || needsWeight || needsNotes) {
                                            setSelectedProductForOptions(product);
                                            setIsOptionsModalOpen(true);
                                        } else {
                                            addToCart(product);
                                        }
                                    }}
                                    className={`glass-card p-4 flex flex-col justify-between cursor-pointer transition-all border border-white/5 ${product.stock > 0 ? 'hover:border-primary/40 hover:bg-white/5 shadow-md' : 'opacity-50 grayscale cursor-not-allowed'}`}
                                >
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <h3 className="font-black text-text leading-tight uppercase text-xs line-clamp-2">{product.name}</h3>
                                        <span className="text-2xl leading-none bg-background/50 p-2 rounded-xl">{product.category === 'Vegetables' ? '🥦' : '📦'}</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-white/10">
                                        <div>
                                            <p className="text-primary font-black text-sm font-mono tracking-tighter">LKR {product.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-background/50 px-2 py-1 rounded-lg">{product.stock} PCS</p>
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
                        className="w-[300px] lg:w-[360px] xl:w-[420px] flex flex-col gap-4 h-full shrink-0"
                    >
                        <div className="flex-1 glass-card p-5 flex flex-col overflow-hidden relative">
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
                                                    <button onClick={() => updateQuantity(item._id, Number(item.quantity) - (PRODUCE_CATEGORIES.includes(item.category) ? 0.1 : 1))} className="p-1.5"><Minus size={14}/></button>
                                                    <span className="w-14 text-center text-xs font-black font-mono">{PRODUCE_CATEGORIES.includes(item.category) ? Number(item.quantity).toFixed(3) : Number(item.quantity)}</span>
                                                    <button onClick={() => updateQuantity(item._id, Number(item.quantity) + (PRODUCE_CATEGORIES.includes(item.category) ? 0.1 : 1))} className="p-1.5"><Plus size={14}/></button>
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


            {/* Advanced Item Options Modal */}
            <ItemOptionsModal
                isOpen={isOptionsModalOpen}
                onClose={() => setIsOptionsModalOpen(false)}
                product={selectedProductForOptions}
                onConfirm={(metadata) => {
                    if (selectedProductForOptions) {
                        const quantity = metadata.weight || 1;
                        addToCart({
                            ...selectedProductForOptions,
                            serialNumber: metadata.imei,
                            weight: metadata.weight,
                            notes: metadata.notes
                        }, quantity);
                    }
                    setIsOptionsModalOpen(false);
                }}
                mode={posMode || 'grocery'}
            />
        </div>
    );
};

// --- Item Options Modal Component ---
const ItemOptionsModal = ({ isOpen, onClose, product, onConfirm, mode }: any) => {
    const [imei, setImei] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setImei('');
            setWeight('');
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const needsIMEI = mode === 'mobile' && (product.category === 'Smartphones' || product.category === 'Tablets');
    const needsWeight = product.unit_type === 'kg' || ['Vegetables', 'Fruits'].includes(product.category);
    const needsNotes = mode === 'restaurant';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl p-8"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-white">{product.name}</h3>
                        <p className="text-primary font-bold text-sm">Add Item Options</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {needsIMEI && (
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">IMEI / Serial Number</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Scan or enter IMEI..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary focus:outline-none transition-all"
                                value={imei}
                                onChange={(e) => setImei(e.target.value)}
                            />
                        </div>
                    )}

                    {needsWeight && (
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Weight (KG)</label>
                            <div className="flex gap-3">
                                <input
                                    autoFocus={!needsIMEI}
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-2xl focus:border-primary focus:outline-none transition-all font-mono"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                                <div className="bg-primary/20 text-primary px-6 flex items-center justify-center rounded-2xl font-black text-xl">KG</div>
                            </div>
                        </div>
                    )}

                    {needsNotes && (
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Cooking Instructions</label>
                            <textarea
                                placeholder="Extra spicy, no onions, etc..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-primary focus:outline-none transition-all h-24 resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => onConfirm({ imei, weight: parseFloat(weight), notes })}
                        className="w-full bg-primary text-white py-5 rounded-3xl font-black text-lg hover:opacity-90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                        Add to Cart <Plus size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default RetailPOS;
