import React from 'react';
import { FileText, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const Reports = () => {
    const theme = useStore(state => state.theme);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text mb-2">
                Analytics & Reports
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text">
                        <TrendingUp className="text-emerald-500" />
                        Profit & Loss
                    </h3>
                    <div className={`h-40 ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/30'} rounded-2xl flex items-center justify-center border border-text/5 mb-4`}>
                        <span className="text-text-muted text-sm italic">Chart Placeholder</span>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-text shadow-sm hover:opacity-90 py-2.5 rounded-xl transition-all text-sm font-medium text-surface">
                        <Download size={16} /> Download PDF
                    </button>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text">
                        <FileText className="text-blue-500" />
                        Daily Closing
                    </h3>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Total Sales</span>
                            <span className="font-mono text-text font-semibold">LKR 145,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Expenses</span>
                            <span className="font-mono text-red-500">- LKR 12,000</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-text/10 pt-3 font-bold">
                            <span className="text-text">Net Cash</span>
                            <span className="text-emerald-600">LKR 133,000</span>
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 border border-text/10 hover:bg-text/5 py-2.5 rounded-xl transition-all text-sm font-medium text-text">
                        <Download size={16} /> Export Excel
                    </button>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text">
                        <AlertCircle className="text-amber-500" />
                        Low Stock Report
                    </h3>
                    <div className="space-y-2 mb-6 max-h-40 overflow-y-auto custom-scrollbar">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`flex justify-between items-center ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} p-2.5 rounded-xl border border-text/5`}>
                                <span className="text-sm text-text">Item Name {i}</span>
                                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                                    {i} left
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 border border-text/10 hover:bg-text/5 py-2.5 rounded-xl transition-all text-sm font-medium text-text">
                        <Download size={16} /> Download CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
