import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2, CheckSquare } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Notification {
    _id: string;
    title: string;
    description: string;
    type: 'Info' | 'Warning' | 'Alert' | 'Success';
    isRead: boolean;
    createdAt: string;
}

const Notifications = () => {
    const { theme } = useStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifications');
            const data = await res.json();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PATCH' });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`http://localhost:5000/api/notifications/read-all`, { method: 'PATCH' });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    const clearAll = async () => {
        try {
            await fetch(`http://localhost:5000/api/notifications/clear-all`, { method: 'DELETE' });
            fetchNotifications();
        } catch (error) {
            console.error('Error clearing all', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Warning': return AlertTriangle;
            case 'Success': return CheckCircle;
            case 'Alert': return Bell;
            default: return Info;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'Warning': return { color: 'red', bg: 'bg-red-500/10', border: 'border-red-500' };
            case 'Success': return { color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500' };
            case 'Alert': return { color: 'primary', bg: 'bg-primary/10', border: 'border-primary' };
            default: return { color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500' };
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tight uppercase">
                        Notification Center
                    </h1>
                    <p className="text-text-muted text-sm font-bold mt-1">Manage your alerts and system updates</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-text/5 text-text-muted hover:text-text hover:bg-text/10 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <CheckSquare size={16} /> Mark all read
                    </button>
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Trash2 size={16} /> Clear all
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="glass-card p-20 text-center text-text-muted italic">No notifications found</div>
                ) : (
                    notifications.map((notif) => {
                        const style = getColorClass(notif.type);
                        const Icon = getIcon(notif.type);
                        return (
                            <div
                                key={notif._id}
                                className={`glass-card p-6 flex gap-6 items-start border-l-4 transition-all hover:scale-[1.01] ${style.border} hover:bg-text/5 relative`}
                            >
                                <div className={`p-4 rounded-2xl ${style.bg} text-${style.color}-500`}>
                                    <Icon size={26} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-lg text-text leading-tight">{notif.title}</h4>
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{new Date(notif.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-text-muted mt-2 leading-relaxed max-w-2xl">{notif.description}</p>
                                    <div className="flex gap-4 mt-4">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markAsRead(notif._id)}
                                                className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        <button className="text-[10px] font-black uppercase text-text-muted tracking-widest hover:underline">Dismiss</button>
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <div className="h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/50 shrink-0 mt-2"></div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="pt-8 text-center">
                <button className="text-text-muted hover:text-text font-black text-[10px] uppercase tracking-[0.3em] transition-all">
                    Load More Notifications
                </button>
            </div>
        </div>
    );
};

export default Notifications;
