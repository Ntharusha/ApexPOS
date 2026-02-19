import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import Receipt from '../components/common/Receipt';

const RetailPOS = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, theme } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [discount, setDiscount] = useState<number>(0);

    useEffect(() => {
        // Fetch Categories
        fetch('http://localhost:5000/api/categories')
            .then(res => res.json())
            .then(data => {
                const catNames = ['All', ...data.map((c: any) => c.name)];
                setCategories(catNames);
            })
            .catch(err => console.error("Failed to fetch categories", err));

        // Fetch Products
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products", err);
                setLoading(false);
            });
    }, []);


    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const payableTotal = Math.max(0, cartTotal - discount);

    const [isProcessing, setIsProcessing] = useState(false);

    const componentRef = React.useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    const handleCompleteSale = async (paymentMethod: string) => {
        if (cart.length === 0) return alert("Cart is empty!");

        setIsProcessing(true);
        try {
            const saleData = {
                items: cart.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: payableTotal,
                discount: discount,
                paymentMethod
            };

            const res = await fetch('http://localhost:5000/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            if (res.ok) {
                try {
                    handlePrint();
                } catch (printError) {
                    console.error("Printing failed:", printError);
                    alert("Sale saved, but printing failed. Please check printer settings.");
                }

                clearCart();
                alert("Sale Completed Successfully!");
            } else {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    alert(`Failed to process sale: ${data.message}`);
                } catch (e) {
                    console.error("Server Response:", text);
                    alert(`Server Error (${res.status}): ${text.substring(0, 200)}...`);
                }
            }
        } catch (error: any) {
            console.error("Sale Error", error);
            alert(`Network/Client Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col gap-5">
                {/* Search & Filter Bar */}
                <div className="glass-card p-4 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        <input
                            type="text"
                            placeholder="Search product by name or barcode..."
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
                                        ? 'border-transparent hover:border-primary/20'
                                        : 'opacity-50 grayscale cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${product.stock > 0
                                        ? (theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-surface/80 text-gray-300')
                                        : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                                    </div>
                                    <div className={`h-28 mb-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} rounded-2xl flex items-center justify-center text-5xl transition-transform group-hover:scale-110`}>
                                        {product.stock > 0 ? '📦' : '🚫'}
                                    </div>
                                    <h3 className="font-bold text-text truncate mb-1">{product.name}</h3>
                                    <p className="text-primary font-black text-lg">LKR {product.price.toLocaleString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart Panel */}
            <div className={`w-[420px] glass-card flex flex-col h-full border-l border-text/10 overflow-hidden shadow-2xl`}>
                <div className="p-5 border-b border-text/10 flex items-center justify-between bg-text/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <ShoppingCart size={22} className="text-primary" />
                        </div>
                        <h2 className="font-black text-text lg:text-xl tracking-tight">Current Order</h2>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted gap-4 opacity-40">
                            <ShoppingCart size={64} strokeWidth={1.5} />
                            <p className="font-bold">No items in cart</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item._id} className={`${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} p-4 rounded-2xl flex gap-4 border border-transparent hover:border-text/5 transition-all group animate-in slide-in-from-right-4 duration-300`}>
                                <div className={`w-14 h-14 ${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-xl flex items-center justify-center text-3xl shrink-0 shadow-sm`}>
                                    📦
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="font-bold text-text truncate mb-1">{item.name}</h4>
                                    <div className="text-primary font-black">
                                        LKR {(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end justify-center">
                                    <div className={`flex items-center ${theme === 'light' ? 'bg-white' : 'bg-surface'} rounded-xl overflow-hidden border border-text/10 shadow-sm`}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, item.quantity - 1); }}
                                            className="p-1.5 hover:bg-text/5 text-text-muted hover:text-text transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center font-black text-text font-mono">{item.quantity}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, item.quantity + 1); }}
                                            className="p-1.5 hover:bg-text/5 text-text-muted hover:text-text transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Totals & Checkout */}
                <div className={`p-6 bg-text/5 border-t border-text/10 space-y-6`}>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted font-bold">Subtotal</span>
                            <span className="text-text font-mono font-bold">LKR {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted font-bold">Discount</span>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">- LKR</span>
                                <input
                                    type="number"
                                    value={discount === 0 ? '' : discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    className={`w-24 text-right bg-emerald-500/10 border-none rounded-lg px-2 py-1 text-emerald-500 font-mono font-bold focus:ring-1 focus:ring-emerald-500 outline-none`}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-text/10">
                            <span className="text-text font-black text-xl tracking-tight">Payable</span>
                            <span className="text-primary font-black text-2xl tracking-tight font-mono">LKR {payableTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'Cash', icon: Banknote, label: 'Cash' },
                            { id: 'Card', icon: CreditCard, label: 'Card' },
                            { id: 'Online', icon: Smartphone, label: 'Online' }
                        ].map(method => (
                            <button
                                key={method.id}
                                disabled={isProcessing}
                                onClick={() => handleCompleteSale(method.id)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 font-bold ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-surface border-white/5'} hover:border-primary hover:bg-primary/5 text-text-muted hover:text-primary active:scale-95 group shadow-sm`}
                            >
                                <method.icon size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] uppercase tracking-widest">{method.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handleCompleteSale('Cash')}
                        disabled={isProcessing}
                        className="w-full bg-primary text-white font-black py-5 rounded-2xl hover:opacity-90 shadow-xl shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Printer size={22} />
                        <span className="text-lg">{isProcessing ? 'Processing Order...' : 'Complete & Print'}</span>
                    </button>
                </div>

                {/* Hidden Receipt for Printing */}
                <div className="hidden">
                    <Receipt
                        ref={componentRef}
                        saleId={`INV-${Math.floor(Math.random() * 100000)}`}
                        items={cart}
                        total={payableTotal}
                        discount={discount}
                        date={new Date().toLocaleDateString()}
                    />
                </div>
            </div>
        </div>
    );
};

export default RetailPOS;
