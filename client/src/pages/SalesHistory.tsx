import React from 'react';
import { Search, Calendar, Download, Printer, RotateCcw } from 'lucide-react';

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Sales History
                </h1>
                <div className="flex gap-3">
                    <button className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5">
                        <Calendar size={18} />
                        <span>Select Date</span>
                    </button>
                    <button className="glass px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/5">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Invoice ID or Customer Name..."
                        className="w-full bg-surface/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary/50 text-white"
                    />
                </div>
                <select className="bg-surface/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none">
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Invoice ID</th>
                                <th className="p-4 font-medium">Date & Time</th>
                                <th className="p-4 font-medium">Customer</th>
                                <th className="p-4 font-medium">Items</th>
                                <th className="p-4 font-medium">Total (LKR)</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading history...</td></tr> :
                                sales.map((sale) => (
                                    <tr key={sale._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-primary text-xs">{sale._id}</td>
                                        <td className="p-4">{new Date(sale.date).toLocaleString()}</td>
                                        <td className="p-4">Walk-in Customer</td>
                                        <td className="p-4">{sale.items.length}</td>
                                        <td className="p-4 font-bold">{sale.totalAmount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>
                                                Completed
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Print Receipt">
                                                    <Printer size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
