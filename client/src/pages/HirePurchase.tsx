import React from 'react';
import { CreditCard, Calendar, UserCheck } from 'lucide-react';

const hpAccounts = [
    { id: 'HP-100', customer: 'Saman Silva', product: 'Samsung S24', amount: 420000, paid: 120000, nextDue: '2025-02-10', status: 'Active' },
    { id: 'HP-101', customer: 'Nimali Perera', product: 'iPhone 13', amount: 280000, paid: 280000, nextDue: '-', status: 'Completed' },
];

const HirePurchase = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Hire Purchase Ledger
            </h1>

            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm bg-surface/30">
                            <th className="p-4">Account ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Total Amount</th>
                            <th className="p-4">Paid</th>
                            <th className="p-4">Balance</th>
                            <th className="p-4">Next Due</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {hpAccounts.map(acc => {
                            const balance = acc.amount - acc.paid;
                            const progress = (acc.paid / acc.amount) * 100;

                            return (
                                <tr key={acc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-primary">{acc.id}</td>
                                    <td className="p-4">{acc.customer}</td>
                                    <td className="p-4">{acc.product}</td>
                                    <td className="p-4">LKR {acc.amount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div>LKR {acc.paid.toLocaleString()}</div>
                                        <div className="w-20 h-1 bg-surface rounded-full mt-1">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-red-400">LKR {balance.toLocaleString()}</td>
                                    <td className="p-4">{acc.nextDue}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${acc.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {acc.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-primary hover:text-white underline text-xs">Collect</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HirePurchase;
