import React, { useState } from 'react';
import {
    BarChart3, Box, TrendingUp, Package,
    Users, ClipboardCheck, Wallet, RefreshCcw,
    UserSquare2, PenTool, PieChart, Truck,
    Scale, FileText, CreditCard, UserCheck,
    Banknote, Container, X, Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportCategory {
    title: string;
    desc: string;
    icon: any;
    color: string;
    emoji: string;
    endpoint: string;
}

const reportCategories: ReportCategory[] = [
    {
        title: "Sales Reports",
        desc: "View detail wise report of sales reports.",
        icon: BarChart3,
        color: "bg-blue-500/10 text-blue-500",
        emoji: "📊",
        endpoint: "/api/reports/sales"
    },
    {
        title: "Stock Reports",
        desc: "View detail wise report of your stock management.",
        icon: Box,
        color: "bg-cyan-500/10 text-cyan-500",
        emoji: "📦",
        endpoint: "/api/reports/stock"
    },
    {
        title: "Profit Reports",
        desc: "View detail wise report of your profit that you earn.",
        icon: TrendingUp,
        color: "bg-emerald-500/10 text-emerald-500",
        emoji: "📈",
        endpoint: "/api/reports/profit-loss"
    },
    {
        title: "Product Reports",
        desc: "View detail wise report of products in your business.",
        icon: Package,
        color: "bg-amber-500/10 text-amber-500",
        emoji: "🍎",
        endpoint: "/api/reports/stock"
    },
    {
        title: "Salary Reports",
        desc: "View detail wise report of your employees salary payments.",
        icon: Users,
        color: "bg-purple-500/10 text-purple-500",
        emoji: "👤",
        endpoint: "/api/reports/salary"
    },
    {
        title: "Attendance Report",
        desc: "View detail wise report of your employees that how they attend.",
        icon: ClipboardCheck,
        color: "bg-orange-500/10 text-orange-500",
        emoji: "📝",
        endpoint: "/api/reports/type/attendance"
    },
    {
        title: "Expenses Reports",
        desc: "View detail wise report of expenses made in your business.",
        icon: Wallet,
        color: "bg-rose-500/10 text-rose-500",
        emoji: "💳",
        endpoint: "/api/reports/expenses"
    },
    {
        title: "Returns Reports",
        desc: "View detail wise report of the return orders of your business.",
        icon: RefreshCcw,
        color: "bg-yellow-500/10 text-yellow-500",
        emoji: "↩️",
        endpoint: "/api/reports/type/returns"
    },
    {
        title: "Sales Person Report",
        desc: "View detail wise report of Sales Person's sales.",
        icon: UserSquare2,
        color: "bg-indigo-500/10 text-indigo-500",
        emoji: "💼",
        endpoint: "/api/reports/type/sales-person"
    },
    {
        title: "Repair Profit Report",
        desc: "View detail wise report of Repair Profits.",
        icon: PenTool,
        color: "bg-pink-500/10 text-pink-500",
        emoji: "🔧",
        endpoint: "/api/reports/repair-profit"
    },
    {
        title: "Sales Type Reports",
        desc: "View detail wise report of sales types.",
        icon: PieChart,
        color: "bg-teal-500/10 text-teal-500",
        emoji: "🎯",
        endpoint: "/api/reports/type/sales-type"
    },
    {
        title: "Supplier Reports",
        desc: "View Supplier wise report of products.",
        icon: Truck,
        color: "bg-orange-600/10 text-orange-600",
        emoji: "🚚",
        endpoint: "/api/reports/suppliers"
    },
    {
        title: "Sales X Supplier Reports",
        desc: "View Supplier wise Sale report.",
        icon: Scale,
        color: "bg-blue-600/10 text-blue-600",
        emoji: "⚖️",
        endpoint: "/api/reports/type/sales-person"
    },
    {
        title: "Sales Credit Reports",
        desc: "View detail wise report of sales reports.",
        icon: FileText,
        color: "bg-cyan-600/10 text-cyan-600",
        emoji: "📄",
        endpoint: "/api/reports/type/sales-credit"
    },
    {
        title: "Cus Credit Reports",
        desc: "View customer wise report of credit reports.",
        icon: CreditCard,
        color: "bg-violet-500/10 text-violet-500",
        emoji: "💳",
        endpoint: "/api/reports/type/cus-credit"
    },
    {
        title: "Sales Ref Reports",
        desc: "View ref-wise sales reports.",
        icon: UserCheck,
        color: "bg-emerald-600/10 text-emerald-600",
        emoji: "🤝",
        endpoint: "/api/reports/type/sales-ref"
    },
    {
        title: "Cus Payment Report",
        desc: "View customer payment reports.",
        icon: Banknote,
        color: "bg-slate-500/10 text-slate-500",
        emoji: "💵",
        endpoint: "/api/reports/type/cus-payment"
    },
    {
        title: "Vehicle Load Report",
        desc: "View customer payment reports.",
        icon: Container,
        color: "bg-sky-500/10 text-sky-500",
        emoji: "🚛",
        endpoint: "/api/reports/vehicle-load"
    }
];

const Reports = () => {
    const theme = useStore(state => state.theme);
    const [selectedReport, setSelectedReport] = useState<ReportCategory | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReportData = async (category: ReportCategory) => {
        setLoading(true);
        setSelectedReport(category);
        try {
            const response = await fetch(`http://localhost:5000${category.endpoint}`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!reportData) return null;

        let columns: string[] = [];
        let rows: any[] = [];

        if (Array.isArray(reportData)) {
            rows = reportData;
            if (rows.length > 0) {
                columns = Object.keys(rows[0]).filter(k => k !== '_id' && k !== '__v' && k !== 'updatedAt');
            }
        } else if (reportData.repairs) {
            rows = reportData.repairs;
            columns = ['customerName', 'deviceModel', 'estimatedCost', 'status'];
        } else if (reportData.totalSales !== undefined) {
            rows = [reportData];
            columns = Object.keys(reportData);
        }

        return (
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-text/10">
                            {columns.map(col => (
                                <th key={col} className="p-4 text-xs font-black text-text-muted uppercase tracking-widest">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="p-10 text-center text-text-muted font-bold">No records found</td></tr>
                        ) : (
                            rows.map((row, i) => (
                                <tr key={i} className="border-b border-text/5 hover:bg-text/5 transition-colors">
                                    {columns.map(col => (
                                        <td key={col} className="p-4 text-sm font-bold text-text">
                                            {typeof row[col] === 'number' ? row[col].toLocaleString() :
                                                (col === 'date' || col === 'createdAt' || col === 'joinDate') ? new Date(row[col]).toLocaleDateString() :
                                                    Array.isArray(row[col]) ? `${row[col].length} items` :
                                                        String(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black text-text uppercase tracking-tight">
                    System Reports
                </h1>
                <p className="text-text-muted font-bold text-sm tracking-widest mt-1">
                    COMPREHENSIVE ANALYTICS & INSIGHTS
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {reportCategories.map((category, index) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        onClick={() => fetchReportData(category)}
                        className="glass-card hover:border-primary/30 transition-all cursor-pointer group flex items-start gap-4 p-5"
                    >
                        <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-text/5 ${theme === 'light' ? 'bg-white' : 'bg-surface'} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                            {category.emoji}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <h3 className="font-black text-text mb-1 leading-tight text-lg group-hover:text-primary transition-colors">
                                {category.title}
                            </h3>
                            <p className="text-xs font-bold text-text-muted leading-relaxed line-clamp-2">
                                {category.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReport(null)}
                            className="absolute inset-0 bg-surface/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-background border border-text/10 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            <div className="p-6 border-b border-text/10 flex items-center justify-between bg-surface/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                                        {selectedReport.emoji}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-text leading-tight">{selectedReport.title}</h2>
                                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{selectedReport.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-3 bg-text/5 hover:bg-text/10 text-text rounded-2xl transition-all">
                                        <Download size={20} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedReport(null)}
                                        className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    renderTable()
                                )}
                            </div>

                            <div className="p-6 border-t border-text/10 bg-surface/30 flex justify-between items-center">
                                <span className="text-xs font-bold text-text-muted">
                                    Showing latest records as of {new Date().toLocaleString()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2">
                                        <Download size={16} /> EXPORT PDF
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;
