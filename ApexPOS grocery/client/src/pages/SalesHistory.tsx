import React from 'react';
import { Search, Calendar, Download, Printer } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Sale {
    _id: string;
    date: string;
    paymentMethod: string;
    totalAmount: number;
    items: any[];
}

const SalesHistory = () => {
    const [sales, setSales] = React.useState<Sale[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { theme } = useStore();

    React.useEffect(() => {
        fetch('http://localhost:5000/api/sales')
            .then(res => res.json())
            .then(data => {
                setSales(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text">
                    Sales History
                </h1>
                <div className="flex gap-4">
                    <button className="glass-card px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-text/5 transition-all font-bold text-sm text-text">
                        <Calendar size={18} className="text-primary" />
                        <span>Filter Date</span>
                    </button>
                    <button className="glass-card px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-text/5 transition-all font-bold text-sm text-text">
                        <Download size={18} className="text-secondary" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Invoice ID or Customer Name..."
                        className={`w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text placeholder-text-muted transition-all`}
                    />
                </div>
                <select className={`w-full md:w-48 ${theme === 'light' ? 'bg-slate-50' : 'bg-surface/50'} border border-text/10 rounded-2xl px-4 py-3 text-text font-bold focus:outline-none transition-all`}>
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b border-text/10 text-text-muted text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-slate-50' : ''}`}>
                                <th className="p-5">Invoice ID</th>
                                <th className="p-5">Date & Time</th>
                                <th className="p-5">Method</th>
                                <th className="p-5">Qty</th>
                                <th className="p-5">Total (LKR)</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-text/5">
                            {loading ? (
                                <tr><td colSpan={7} className="p-10 text-center text-text-muted italic">Loading sales history...</td></tr>
                            ) : sales.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-text-muted italic">No sales recorded yet</td></tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-text/5 transition-colors group">
                                        <td className="p-5 font-mono text-primary font-bold text-xs">#{sale._id.substring(sale._id.length - 8).toUpperCase()}</td>
                                        <td className="p-5 text-text font-medium text-sm">
                                            {new Date(sale.date).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-surface text-gray-400'}`}>
                                                {sale.paymentMethod || 'Cash'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-text-muted font-bold">{sale.items.length}</td>
                                        <td className="p-5 font-black text-text font-mono">LKR {sale.totalAmount.toLocaleString()}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}>
                                                Completed
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button className="p-2.5 hover:bg-primary/10 rounded-xl text-primary transition-all" title="Print Receipt">
                                                <Printer size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
