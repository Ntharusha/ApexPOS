import React from 'react';
import { Search, PenTool, CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Repair {
    _id: string;
    customerName: string;
    deviceModel: string;
    issueDescription: string;
    status: string;
    technicianNotes?: string;
    createdAt?: string;
}

const RepairManagement = () => {
    const [repairs, setRepairs] = React.useState<Repair[]>([]);
    const [loading, setLoading] = React.useState(true);
    const theme = useStore(state => state.theme);

    React.useEffect(() => {
        fetch('http://localhost:5000/api/repairs')
            .then(res => res.json())
            .then(data => {
                setRepairs(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const statusCards = [
        { label: 'Pending', count: 5, icon: Clock, color: 'blue' },
        { label: 'In Progress', count: 3, icon: PenTool, color: 'amber' },
        { label: 'Ready', count: 12, icon: CheckCircle, color: 'emerald' },
        { label: 'Delayed', count: 2, icon: AlertTriangle, color: 'red' },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Completed':
            case 'Ready':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'In Progress':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Delayed':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            default:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">
                Repair Management
            </h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statusCards.map((card) => (
                    <div key={card.label} className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl bg-${card.color}-500 shadow-lg shadow-${card.color}-500/20 text-white`}>
                                <card.icon size={26} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-text leading-none">{card.count}</h3>
                                <p className="text-xs font-bold text-text-muted mt-2 uppercase tracking-widest">{card.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Kanban / List Board */}
            <div className="glass-card overflow-hidden flex flex-col">
                <div className="p-6 border-b border-text/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-text/5">
                    <h3 className="text-xl font-black text-text tracking-tight uppercase">Active Repair Jobs</h3>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search Job ID / IMEI..."
                            className={`w-full ${theme === 'light' ? 'bg-white' : 'bg-surface/50'} border border-text/10 rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-text placeholder-text-muted transition-all`}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`text-text-muted text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'light' ? 'bg-slate-50' : ''}`}>
                                <th className="p-5">Job ID</th>
                                <th className="p-5">Device Model</th>
                                <th className="p-5">Customer</th>
                                <th className="p-5">Issue</th>
                                <th className="p-5">Technician</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-text/5">
                            {loading ? (
                                <tr><td colSpan={7} className="p-10 text-center text-text-muted italic">Loading repairs...</td></tr>
                            ) : repairs.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-text-muted italic">No active repairs found</td></tr>
                            ) : (
                                repairs.map((job) => (
                                    <tr key={job._id} className="hover:bg-text/5 transition-colors group">
                                        <td className="p-5 font-mono text-primary font-bold text-xs">{job._id.substring(0, 8).toUpperCase()}</td>
                                        <td className="p-5 font-bold text-text">{job.deviceModel}</td>
                                        <td className="p-5 font-medium text-text">{job.customerName}</td>
                                        <td className="p-5 text-text-muted text-sm line-clamp-1 max-w-[200px]">{job.issueDescription}</td>
                                        <td className="p-5 text-text-muted font-bold text-xs uppercase tracking-wide">Unassigned</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-[10px] uppercase transition-all">
                                                Manage <ChevronRight size={14} />
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

export default RepairManagement;
