import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ThemeToggle from '../ThemeToggle';

const Header = () => {
    const { toggleSidebar, notifications } = useStore();

    return (
        <header className="h-16 px-6 glass flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-text transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="relative hidden md:block">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search system..."
                        className="bg-surface/50 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-gray-200 placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                <button className="relative p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-text transition-colors">
                    <Bell size={20} />
                    {notifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#38bdf8]"></span>
                    )}
                </button>

                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-right hidden sm:block">
                        <p className="text-gray-400 text-xs">Tuesday, 03 Feb</p>
                        <p className="font-mono text-primary">06:14 AM</p>
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
