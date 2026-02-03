import React from 'react';
import { FileText, Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const Reports = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Analytics & Reports
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" />
                        Profit & Loss
                    </h3>
                    <div className="h-40 bg-surface/30 rounded-lg flex items-center justify-center border border-white/5 mb-4">
                        <span className="text-gray-500 text-sm">Chart Placeholder</span>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors text-sm">
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="text-blue-400" />
                        Daily Closing
                    </h3>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Sales</span>
                            <span className="font-mono">LKR 145,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Expenses</span>
                            <span className="font-mono text-red-400">- LKR 12,000</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-white/10 pt-2 font-bold">
                            <span>Net Cash</span>
                            <span className="text-emerald-400">LKR 133,000</span>
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors text-sm">
                        <Download size={16} /> Export Excel
                    </button>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="text-yellow-400" />
                        Low Stock Report
                    </h3>
                    <div className="space-y-2 mb-6 max-h-40 overflow-y-auto custom-scrollbar">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex justify-between items-center bg-surface/50 p-2 rounded">
                                <span className="text-sm">Item Name {i}</span>
                                <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                                    {i} left
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors text-sm">
                        <Download size={16} /> Download CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
