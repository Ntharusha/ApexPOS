import React from 'react';
import { Search, PenTool, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

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

    React.useEffect(() => {
        fetch('http://localhost:5000/api/repairs')
            .then(res => res.json())
            .then(data => {
                setRepairs(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Repair Management
            </h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 flex items-center gap-4 bg-blue-500/10 border-blue-500/30">
                    <div className="p-3 bg-blue-500 rounded-lg text-white"><Clock size={24} /></div>
                    <div><h3 className="text-2xl font-bold">5</h3><p className="text-sm text-gray-400">Pending</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4 bg-yellow-500/10 border-yellow-500/30">
                    <div className="p-3 bg-yellow-500 rounded-lg text-white"><PenTool size={24} /></div>
                    <div><h3 className="text-2xl font-bold">3</h3><p className="text-sm text-gray-400">In Progress</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4 bg-green-500/10 border-green-500/30">
                    <div className="p-3 bg-green-500 rounded-lg text-white"><CheckCircle size={24} /></div>
                    <div><h3 className="text-2xl font-bold">12</h3><p className="text-sm text-gray-400">Ready</p></div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4 bg-red-500/10 border-red-500/30">
                    <div className="p-3 bg-red-500 rounded-lg text-white"><AlertTriangle size={24} /></div>
                    <div><h3 className="text-2xl font-bold">2</h3><p className="text-sm text-gray-400">Delayed</p></div>
                </div>
            </div>

            {/* Kanban / List Board */}
            <div className="glass-card p-6">
                <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold">Active Jobs</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search Job ID / IMEI" className="bg-surface border border-white/10 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-primary/50 text-sm w-64" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                <th className="p-3">Job ID</th>
                                <th className="p-3">Device</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Issue</th>
                                <th className="p-3">Technician</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading repairs...</td></tr> :
                                repairs.map((job) => (
                                    <tr key={job._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono text-primary text-xs">{job._id}</td>
                                        <td className="p-3">{job.deviceModel}</td>
                                        <td className="p-3">{job.customerName}</td>
                                        <td className="p-3">{job.issueDescription}</td>
                                        <td className="p-3 text-gray-400">Unassigned</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${job.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                job.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>{job.status}</span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button className="text-primary hover:text-white text-xs underline">Manage</button>
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

export default RepairManagement;
