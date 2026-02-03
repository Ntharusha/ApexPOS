import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Notifications = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Notifications
            </h1>

            <div className="space-y-4">
                {[
                    { title: "Low Stock Alert", desc: "iPhone 15 Pro Max stock is below 5 units.", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
                    { title: "Repair Completed", desc: "Job #J-1022 is ready for pickup.", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { title: "HP Payment Due", desc: "Saman Silva (HP-100) installment due tomorrow.", icon: Info, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { title: "System Update", desc: "ApexPOS successfully updated to v1.2.", icon: Bell, color: "text-gray-400", bg: "bg-surface" },
                ].map((notif, idx) => (
                    <div key={idx} className={`glass-card p-4 flex gap-4 items-start border-l-4 ${notif.color.replace('text', 'border')} hover:bg-white/5 transition-colors`}>
                        <div className={`p-2 rounded-lg ${notif.bg} ${notif.color}`}>
                            <notif.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-200">{notif.title}</h4>
                            <p className="text-sm text-gray-400">{notif.desc}</p>
                            <span className="text-xs text-gray-600 mt-2 block">2 hours ago</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
