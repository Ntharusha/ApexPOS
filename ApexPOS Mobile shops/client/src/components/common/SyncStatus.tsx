import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const SyncStatus = () => {
    const { isOnline, setOnlineStatus, pendingSales, clearPendingSales } = useStore();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

    useEffect(() => {
        const handleOnline = () => setOnlineStatus(true);
        const handleOffline = () => setOnlineStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (isOnline && pendingSales.length > 0 && !isSyncing) {
            syncOfflineData();
        }
    }, [isOnline, pendingSales.length]);

    const syncOfflineData = async () => {
        setIsSyncing(true);
        console.log(`Attempting to sync ${pendingSales.length} offline sales...`);

        let successCount = 0;
        const failedQueue = [];

        for (const sale of pendingSales) {
            try {
                const res = await fetch('http://localhost:5000/api/sales', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sale),
                });
                if (res.ok) {
                    successCount++;
                } else {
                    failedQueue.push(sale);
                }
            } catch (error) {
                failedQueue.push(sale);
            }
        }

        if (successCount > 0) {
            setLastSyncResult(`Synced ${successCount} sales!`);
            setTimeout(() => setLastSyncResult(null), 3000);
        }

        // Ideally we only clear successfully synced items, but for now we reset 
        // and put failed ones back or stop if all failed.
        // Simplified Logic: Clear and re-add failed (if any)
        clearPendingSales();
        if (failedQueue.length > 0) {
            failedQueue.forEach(s => useStore.getState().queueSale(s));
        }

        setIsSyncing(false);
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
            <AnimatePresence mode="wait">
                {isSyncing ? (
                    <motion.div
                        key="syncing"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-primary"
                    >
                        <RefreshCw size={14} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
                    </motion.div>
                ) : lastSyncResult ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-emerald-500"
                    >
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{lastSyncResult}</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-center gap-2 ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}
                    >
                        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isOnline ? (pendingSales.length > 0 ? `${pendingSales.length} Queued` : 'Synced') : 'Offline'}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {pendingSales.length > 0 && isOnline && !isSyncing && (
                <button
                    onClick={syncOfflineData}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-primary transition-all"
                    title="Force Sync"
                >
                    <RefreshCw size={12} />
                </button>
            )}
        </div>
    );
};

export default SyncStatus;
