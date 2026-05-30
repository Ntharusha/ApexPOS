import { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import api from '../../api/axios';

const SyncEngine = () => {
    const { isOnline, setOnlineStatus, pendingSales, clearPendingSales, syncOfflineData } = useStore();

    useEffect(() => {
        const handleOnline = () => {
            console.log('System back online. Flushing queue...');
            setOnlineStatus(true);
            flushQueue();
            syncOfflineData();
        };

        const handleOffline = () => {
            console.log('System offline.');
            setOnlineStatus(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync if online
        if (navigator.onLine) {
            syncOfflineData();
            flushQueue();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const flushQueue = async () => {
        const { pendingSales, setSyncStatus } = useStore.getState();
        if (pendingSales.length === 0) return;

        setSyncStatus('syncing');

        for (const sale of pendingSales) {
            try {
                await api.post('/sales', sale);
            } catch (error) {
                console.error(`Failed to sync sale ${sale.offlineId}`, error);
                setSyncStatus('error');
                return;
            }
        }

        clearPendingSales();
        await syncOfflineData();
    };

    return null; // This component has no UI, it just manages logic
};

export default SyncEngine;
