import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const QROrder = () => {
    const { tableId } = useParams();
    const [menu, setMenu] = useState<{ products: any[], categories: any[] }>({ products: [], categories: [] });
    const [session, setSession] = useState<{ table: any, sessionId: string } | null>(null);
    const [cart, setCart] = useState<{ product: any, quantity: number, notes: string }[]>([]);
    const [activeTab, setActiveTab] = useState('menu');
    const [orderStatus, setOrderStatus] = useState<any>(null); // 'Pending', 'Preparing', 'Ready'

    useEffect(() => {
        // Authenticate table and get session
        fetch(`http://localhost:5000/api/qr/table/${tableId}/session`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.sessionId) setSession(data);
            });

        // Get Menu
        fetch('http://localhost:5000/api/qr/menu')
            .then(res => res.json())
            .then(data => setMenu(data));
    }, [tableId]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            if (existing) {
                return prev.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1, notes: '' }];
        });
    };

    const placeOrder = async () => {
        if (!session || cart.length === 0) return;

        const totalAmount = cart.reduce((acc, item) => acc + (item.product.salesPrice * item.quantity), 0);
        const items = cart.map(item => ({
            productId: item.product._id,
            name: item.product.englishName,
            price: item.product.salesPrice,
            quantity: item.quantity,
            notes: item.notes
        }));

        await fetch(`http://localhost:5000/api/qr/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId, sessionId: session.sessionId, items, totalAmount })
        });

        setCart([]);
        setOrderStatus('Pending');
        setActiveTab('status');
    };

    if (!session) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading Table Data...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans pb-24">
            <header className="bg-gray-800 p-4 sticky top-0 z-10 border-b border-gray-700 text-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Table {session.table?.tableNumber}
                </h1>
                <p className="text-sm text-gray-400">Order from your phone</p>
            </header>

            <div className="p-4">
                {activeTab === 'menu' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {menu.products.map(product => (
                            <div key={product._id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center outline outline-1 outline-gray-700">
                                <div>
                                    <h3 className="font-semibold text-lg">{product.englishName}</h3>
                                    <p className="text-orange-400 font-medium">Rs. {product.salesPrice?.toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-transform active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'cart' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Your Cart</h2>
                        {cart.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">Cart is empty</p>
                        ) : (
                            <>
                                {cart.map((item, idx) => (
                                    <div key={idx} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center outline outline-1 outline-gray-700">
                                        <div>
                                            <h3 className="font-semibold">{item.quantity}x {item.product.englishName}</h3>
                                            <p className="text-gray-400 text-sm">Rs. {(item.product.salesPrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-gray-700 mt-6 flex justify-between text-xl font-bold">
                                    <span>Total:</span>
                                    <span className="text-orange-400">
                                        Rs. {cart.reduce((acc, item) => acc + (item.product.salesPrice * item.quantity), 0).toFixed(2)}
                                    </span>
                                </div>
                                <button 
                                    onClick={placeOrder}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl font-bold text-lg mt-6 shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                                >
                                    Confirm & Send to Kitchen
                                </button>
                            </>
                        )}
                    </motion.div>
                )}

                {activeTab === 'status' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
                        <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">👨‍🍳</span>
                        </div>
                        <h2 className="text-2xl font-bold text-orange-400">Order Sent!</h2>
                        <p className="text-gray-400">The kitchen has received your order and is working its magic.</p>
                        <p className="text-lg font-semibold mt-4 bg-gray-800 py-3 rounded-lg border border-gray-700">
                            Current Status: <span className="text-orange-400">{orderStatus}</span>
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-around">
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`flex flex-col items-center ${activeTab === 'menu' ? 'text-orange-400' : 'text-gray-400'}`}
                >
                    <span className="text-xl mb-1">📖</span>
                    <span className="text-xs font-medium">Menu</span>
                </button>
                <button 
                    onClick={() => setActiveTab('cart')}
                    className={`flex flex-col items-center relative ${activeTab === 'cart' ? 'text-orange-400' : 'text-gray-400'}`}
                >
                    <span className="text-xl mb-1">🛒</span>
                    <span className="text-xs font-medium">Cart</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
};

export default QROrder;
