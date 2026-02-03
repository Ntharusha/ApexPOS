import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, Printer } from 'lucide-react';
import { useStore, Product } from '../store/useStore';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import Receipt from '../components/common/Receipt';

const RetailPOS = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);

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
                totalAmount: cartTotal,
                paymentMethod
            };

            const res = await fetch('http://localhost:5000/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData)
            });

            if (res.ok) {
                // Print Receipt
                try {
                    handlePrint();
                } catch (printError) {
                    console.error("Printing failed:", printError);
                    alert("Sale saved, but printing failed. Please check printer settings.");
                }

                // Clear Cart
                clearCart();
                alert("Sale Completed Successfully!");
            } else {
                const text = await res.text();
                try {
                    const data = JSON.parse(text);
                    alert(`Failed to process sale: ${data.message}`);
                } catch (e) {
                    // If not JSON, show text (likely HTML error or stack trace snippet)
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
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Search & Filter Bar */}
                <div className="glass-card p-4 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search product by name or barcode..."
                            className="w-full bg-surface/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 text-white placeholder-gray-500"
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
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors border border-transparent ${selectedCategory === cat
                                    ? 'bg-primary/20 text-primary border-primary/20 font-medium'
                                    : 'bg-surface/50 text-gray-400 border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                                    whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                                    onClick={() => {
                                        if (product.stock > 0) addToCart(product);
                                        else alert("Item is Out of Stock!");
                                    }}
                                    className={`glass-card p-4 cursor-pointer transition-all relative overflow-hidden group ${product.stock > 0 ? 'hover:border-primary/30' : 'opacity-50 grayscale cursor-not-allowed'
                                        }`}
                                >
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono ${product.stock > 0 ? 'bg-surface/80 text-gray-300' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                                    </div>
                                    <div className="h-24 mb-3 bg-gradient-to-br from-white/5 to-white/0 rounded-lg flex items-center justify-center">
                                        <span className="text-4xl">{product.stock > 0 ? '📦' : '🚫'}</span>
                                    </div>
                                    <h3 className="font-medium text-gray-200 truncate">{product.name}</h3>
                                    <p className="text-primary font-bold mt-1">LKR {product.price.toLocaleString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart Panel */}
            <div className="w-[400px] glass-card flex flex-col h-full border-l border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} className="text-primary" />
                        <h2 className="font-bold text-lg">Current Order</h2>
                    </div>
                    <button
                        onClick={clearCart}
                        className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                        Clear All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item._id} className="bg-white/5 p-3 rounded-lg flex gap-3 group animate-in slide-in-from-right-4 duration-300">
                                <div className="w-12 h-12 bg-surface rounded flex items-center justify-center text-xl shrink-0">
                                    📦
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                    <div className="text-primary text-sm font-bold">
                                        LKR {(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center bg-surface rounded-lg overflow-hidden border border-white/10">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, item.quantity - 1); }}
                                            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, item.quantity + 1); }}
                                            className="p-1 hover:bg-white/10 text-gray-400 hover:text-white"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Totals & Checkout */}
                <div className="p-4 bg-surface/50 border-t border-white/10 space-y-4">
                    <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>LKR {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>-</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/5">
                            <span>Total</span>
                            <span className="text-primary">LKR {cartTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button
                            disabled={isProcessing}
                            onClick={() => handleCompleteSale('Cash')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all gap-1 text-gray-300 hover:text-white"
                        >
                            <Banknote size={20} />
                            <span className="text-xs">Cash</span>
                        </button>
                        <button
                            disabled={isProcessing}
                            onClick={() => handleCompleteSale('Card')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all gap-1 text-gray-300 hover:text-white"
                        >
                            <CreditCard size={20} />
                            <span className="text-xs">Card</span>
                        </button>
                        <button
                            disabled={isProcessing}
                            onClick={() => handleCompleteSale('Online')}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all gap-1 text-gray-300 hover:text-white"
                        >
                            <Smartphone size={20} />
                            <span className="text-xs">Online</span>
                        </button>
                    </div>

                    <button
                        onClick={() => handleCompleteSale('Cash')}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-background font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Printer size={20} />
                        {isProcessing ? 'Processing...' : 'Complete & Print'}
                    </button>
                </div>

                {/* Hidden Receipt for Printing */}
                <div className="hidden">
                    <Receipt
                        ref={componentRef}
                        saleId={`INV-${Math.floor(Math.random() * 10000)}`}
                        items={cart}
                        total={cartTotal}
                        date={new Date().toLocaleDateString()}
                    />
                </div>
            </div>
        </div>
    );
};

export default RetailPOS;
