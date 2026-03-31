import React, { useState } from 'react';
import { Plus, Trash, Tags } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const CategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useStore(state => state.theme);

    const fetchCategories = () => {
        fetch('http://localhost:5000/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setCategories([]);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCategories();
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error("Delete Category Error:", error);
            alert("Error connecting to server.");
        }
    };

    const handleAdd = async () => {
        const name = prompt('Enter category name:');
        if (!name) return;

        try {
            const res = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, icon: 'Tag', description: '' })
            });

            if (res.ok) {
                fetchCategories();
                alert('Category added successfully');
            } else {
                const errorData = await res.json();
                alert(`Failed to add category: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Add Category Error:", error);
            alert("Error connecting to server.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text">
                    Category Management
                </h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white font-black px-6 py-2.5 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                    <Plus size={22} />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-text-muted italic">Loading categories...</div>
                ) : (
                    <>
                        {Array.isArray(categories) && categories.map((cat) => (
                            <motion.div
                                key={cat._id || cat.id}
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 ${theme === 'light' ? 'bg-blue-50' : 'bg-primary/10'} rounded-bl-[60px] transition-all group-hover:scale-150 group-hover:bg-primary/20`}></div>

                                <div className="flex items-center gap-5 z-10 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl ${theme === 'light' ? 'bg-white' : 'bg-surface'} border border-text/10 flex items-center justify-center text-primary shadow-sm transition-transform group-hover:rotate-12`}>
                                        <Tags size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-text leading-tight">{cat.name}</h3>
                                        <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-wider">{cat.count || 0} Items</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all text-sm"
                                    >
                                        <Trash size={16} /> Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add New Placeholder Card */}
                        <button
                            onClick={handleAdd}
                            className={`border-2 border-dashed ${theme === 'light' ? 'border-slate-300' : 'border-white/10'} rounded-3xl flex flex-col items-center justify-center p-8 text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[160px] group`}
                        >
                            <div className="p-3 bg-text/5 rounded-full group-hover:bg-primary/10 transition-colors">
                                <Plus size={40} />
                            </div>
                            <span className="font-black text-sm uppercase tracking-widest mt-4">Create New</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;
