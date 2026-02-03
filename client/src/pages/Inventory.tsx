import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        // Ideally backend should have delete endpoint, mimicking visual delete for now
        setProducts(products.filter(p => p._id !== id));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 relative h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Inventory Management
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/80 text-background px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* Search Bar */}
            <div className="glass-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by product name or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary/50 text-white"
                    />
                </div>
            </div>

            {/* Product Table */}
            <div className="glass-card flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-surface z-10">
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4">Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Barcode</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading inventory...</td></tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium">{product.name}</td>
                                    <td className="p-4"><span className="bg-white/5 px-2 py-1 rounded text-xs">{product.category}</span></td>
                                    <td className="p-4 font-mono text-primary">LKR {product.price.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`font-bold ${product.stock < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{product.barcode || '-'}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id!)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                                <h2 className="text-xl font-bold text-white">Add New Product</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Price (LKR)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Cost Price (LKR)</label>
                                        <input
                                            type="number"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Stock Qty</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Barcode (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary/50 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-colors"
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
