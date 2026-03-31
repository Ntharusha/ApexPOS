import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { io } from 'socket.io-client';
import SyncEngine from './SyncEngine';

const Layout = () => {
    const { theme, fetchNotifications } = useStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('notificationUpdate', () => {
            console.log('Notification update received');
            fetchNotifications();
        });

        return () => {
            socket.disconnect();
        };
    }, [fetchNotifications]);

    return (
        <div className="flex bg-background min-h-screen text-text font-sans overflow-hidden transition-colors duration-500 relative">
            <SyncEngine />
            
            {/* Aurora Background Elements */}
            <div className="aurora-bg">
                <div className="aurora-element top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary" />
                <div className="aurora-element bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary" />
                <div className="aurora-element top-[20%] right-[10%] w-[20%] h-[20%] bg-emerald-500/20" />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
