import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface Product {
    _id?: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    costPrice?: number;
    barcode?: string;
    image?: string;
}

const Inventory = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useStore(state => state.theme);

    // Form State
    const [formData, setFormData] = useState<Product>({
        name: '',
        price: 0,
        costPrice: 0,
        category: '',
        stock: 0,
        barcode: '',
        image: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchProducts();
                setIsModalOpen(false);
                setFormData({ name: '', price: 0, costPrice: 0, category: '', stock: 0, barcode: '', image: '' });
                alert('Product added successfully!');
            } else {
                const error = await res.json();
                alert(`Failed to add product: ${error.message}`);
            }
        } catch (error) {
            console.error("Error saving product", error);
            alert('Error saving product. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        setProducts(products.filter(p => p._id !== id));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 relative h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text">
                    Inventory Management
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search by product name or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/10 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text placeholder-text-muted transition-all`}
                    />
                </div>
            </div>

            {/* Product Table */}
            <div className="glass-card flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className={`sticky top-0 ${theme === 'light' ? 'bg-slate-50' : 'bg-surface'} z-10`}>
                            <tr className="border-b border-text/10 text-text-muted text-sm font-semibold uppercase tracking-wider">
                                <th className="p-5">Name</th>
                                <th className="p-5">Category</th>
                                <th className="p-5">Price</th>
                                <th className="p-5">Stock</th>
                                <th className="p-5">Barcode</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-text/5">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-text-muted italic">Loading inventory...</td></tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-text/5 transition-colors">
                                    <td className="p-5 font-bold text-text">{product.name}</td>
                                    <td className="p-5">
                                        <span className={`${theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-primary/10 text-primary'} px-3 py-1 rounded-full text-xs font-bold`}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-5 font-mono font-bold text-primary">LKR {product.price.toLocaleString()}</td>
                                    <td className="p-5">
                                        <span className={`font-bold px-3 py-1 rounded-full text-xs ${product.stock < 5 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {product.stock} units
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-text-muted font-mono">{product.barcode || '-'}</td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button className="p-2.5 hover:bg-blue-500/10 rounded-xl text-blue-500 transition-all">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id!)}
                                                className="p-2.5 hover:bg-red-500/10 rounded-xl text-red-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal omitted for brevity, but themed appropriately in implementation */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className={`${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all duration-300`}
                        >
                            <div className="p-6 border-b border-text/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-text">Add New Product</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text hover:bg-text/5 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text ml-1 text-text-muted">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl p-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-text-muted`}
                                        placeholder="Enter product name..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1 text-text-muted">Price (LKR)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl p-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1 text-text-muted">Cost Price (LKR)</label>
                                        <input
                                            type="number"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl p-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1 text-text-muted">Stock Qty</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl p-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1 text-text-muted">Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl p-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1 text-text-muted">Barcode (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-text/5'} border border-text/10 rounded-2xl p-3.5 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                                        placeholder="Scan or enter barcode..."
                                    />
                                </div>

                                <div className="pt-6 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-2xl text-text-muted font-bold hover:bg-text/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 rounded-2xl bg-primary text-white font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                                    >
                                        Save Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
