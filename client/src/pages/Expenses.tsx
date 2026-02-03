import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([
        { id: 1, type: 'Electricity Bill', amount: 15000, date: '2025-02-01' },
        { id: 2, type: 'Shop Rent', amount: 45000, date: '2025-02-01' },
        { id: 3, type: 'Tea/Snacks', amount: 1500, date: '2025-02-02' },
    ]);

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Expense Tracker
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-400 mb-2">Total Expenses (Feb)</h3>
                        <h2 className="text-4xl font-bold text-red-400">LKR {totalExpenses.toLocaleString()}</h2>
                    </div>
                    <button className="mt-6 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl hover:bg-red-500/20 transition-all font-bold">
                        <Plus size={20} /> Add New Expense
                    </button>
                </div>

                <div className="glass-card p-6 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-200 mb-4">Recent Expenses</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {expenses.map(exp => (
                            <div key={exp.id} className="flex justify-between items-center p-3 rounded-lg bg-surface/50 border border-white/5">
                                <div>
                                    <p className="font-medium">{exp.type}</p>
                                    <p className="text-xs text-gray-500">{exp.date}</p>
                                </div>
                                <p className="font-bold text-red-400">- {exp.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
