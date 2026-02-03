import React, { useState } from 'react';
import { Plus, Edit2, Trash, Tags } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
const initialCategories = [
    { id: 1, name: 'Phones', count: 45, icon: 'Smartphone' },
    { id: 2, name: 'Accessories', count: 120, icon: 'Headphones' },
    { id: 3, name: 'Parts', count: 30, icon: 'Cpu' },
];

const CategoryManagement = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
        fetchCategories();
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Category Management
                </h1>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-background font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">Loading categories...</div>
                ) : (
                    <>
                        {Array.isArray(categories) && categories.map((cat) => (
                            <motion.div
                                key={cat._id || cat.id}
                                whileHover={{ y: -5 }}
                                className="glass-card p-6 flex items-center justify-between group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-[50px] transition-all group-hover:scale-150 group-hover:bg-primary/20`}></div>

                                <div className="flex items-center gap-4 z-10">
                                    <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-primary">
                                        <Tags size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{cat.name}</h3>
                                        <p className="text-sm text-gray-400">{cat.count} Items</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={18} /></button> */}
                                    <button onClick={() => handleDelete(cat._id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><Trash size={18} /></button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Add New Placeholder Card */}
                        <button onClick={handleAdd} className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-primary hover:border-primary/50 transition-colors min-h-[120px]">
                            <Plus size={32} />
                            <span className="font-medium mt-2">Create New</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryManagement;
