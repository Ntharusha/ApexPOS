import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingCart, Package, Truck, History,
    Tags, Wrench, Smartphone, Users, PlusCircle, FileText,
    Bell, CreditCard, DollarSign, LogOut, ChevronLeft, ChevronRight,
    ShieldCheck, Settings, UtensilsCrossed, Award, RefreshCw, ChefHat,
    AlertTriangle, Activity
} from 'lucide-react';


import AnimatedIcon from '../common/AnimatedIcon';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', animation: 'hover-rotate' as const, group: 'Core', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/retail-pos', icon: ShoppingCart, label: 'Point of Sale', animation: 'hover-scale' as const, group: 'Core', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/loyalty', icon: Award, label: 'Loyalty & Rewards', animation: 'pulse' as const, group: 'Core', modes: ['grocery'] },
    { path: '/smart-inventory', icon: AlertTriangle, label: 'Smart Expiry Tracker', animation: 'pulse' as const, group: 'Core', modes: ['grocery'] },
    
    { path: '/hospitality', icon: UtensilsCrossed, label: 'Restaurant POS', animation: 'hover-scale' as const, group: 'Core', modes: ['restaurant'] },
    { path: '/kds', icon: ChefHat, label: 'Kitchen Display', animation: 'bounce' as const, group: 'Core', modes: ['restaurant'] },
    { path: '/turnaround', icon: Activity, label: 'Table Turnaround', animation: 'pulse' as const, group: 'Core', modes: ['restaurant'] },

    { path: '/inventory', icon: Package, label: 'Inventory', animation: 'hover-scale' as const, group: 'Core', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/categories', icon: Tags, label: 'Categories', animation: 'hover-scale' as const, group: 'Core', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/sales', icon: History, label: 'Sales History', animation: 'hover-rotate' as const, group: 'Core', modes: ['grocery', 'mobile', 'restaurant'] },
    
    { path: '/delivery', icon: Truck, label: 'Delivery', animation: 'hover-scale' as const, group: 'Service', modes: ['grocery', 'restaurant'] },
    { path: '/trade-in', icon: RefreshCw, label: 'Device Trade-In', animation: 'hover-rotate' as const, group: 'Service', modes: ['mobile'] },
    { path: '/liability', icon: ShieldCheck, label: 'Liability Vault', animation: 'hover-scale' as const, group: 'Service', modes: ['mobile'] },
    { path: '/repairs', icon: Wrench, label: 'Repairs', animation: 'hover-rotate' as const, group: 'Service', modes: ['mobile'] },
    { path: '/add-job', icon: PlusCircle, label: 'Add Job', animation: 'hover-rotate' as const, group: 'Service', modes: ['mobile'] },
    { path: '/reload', icon: Smartphone, label: 'Reload', animation: 'pulse' as const, group: 'Service', modes: ['mobile'] },
    { path: '/hp', icon: CreditCard, label: 'Hire Purchase', animation: 'hover-scale' as const, group: 'Finance', modes: ['mobile'] },
    { path: '/expenses', icon: DollarSign, label: 'Expenses', animation: 'bounce' as const, group: 'Finance', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/reports', icon: FileText, label: 'Reports', animation: 'hover-scale' as const, group: 'Finance', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/registration', icon: Users, label: 'Registration', animation: 'hover-scale' as const, group: 'Admin', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/staff', icon: ShieldCheck, label: 'Staff & Auth', animation: 'hover-scale' as const, group: 'Admin', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/notifications', icon: Bell, label: 'Notifications', animation: 'pulse' as const, group: 'Admin', modes: ['grocery', 'mobile', 'restaurant'] },
    { path: '/settings', icon: Settings, label: 'Settings', animation: 'hover-rotate' as const, group: 'Admin', modes: ['grocery', 'mobile', 'restaurant'] },
];


const groupLabels: Record<string, string> = {
    Core: '🏪 Core',
    Service: '🔧 Service',
    Finance: '💰 Finance',
    Admin: '⚙️ Admin',
};

const Sidebar = () => {
    const { sidebarOpen, toggleSidebar, theme, user, logout, posMode, setPosMode } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };
    const handleSwitchMode = () => { setPosMode(null); navigate('/select-mode'); };
    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

    // Group menu items
    const groups = ['Core', 'Service', 'Finance', 'Admin'];

    return (
        <motion.div
            initial={{ width: sidebarOpen ? 248 : 72 }}
            animate={{ width: sidebarOpen ? 248 : 72 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`h-screen sticky top-0 left-0 ${theme === 'light'
                ? 'bg-white border-r border-slate-100 shadow-lg'
                : 'bg-background border-r border-white/5'
                } z-50 flex flex-col`}
        >
            {/* Logo */}
            <div className={`h-16 flex items-center justify-between px-4 border-b ${theme === 'light' ? 'border-slate-100' : 'border-white/8'} shrink-0`}>
                <div className="overflow-hidden flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">
                        AP
                    </div>
                    {sidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="font-black text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap tracking-tighter"
                        >
                            ApexPOS
                        </motion.span>
                    )}
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-text/5 text-text-muted hover:text-text transition-all shrink-0"
                >
                    {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
                {groups.map(group => {
                    const items = menuItems.filter(i => i.group === group && (!posMode || i.modes.includes(posMode)));
                    
                    if (items.length === 0) return null;
                    
                    return (
                        <div key={group} className="mb-2">
                            {sidebarOpen && (
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/50 px-5 py-2">
                                    {groupLabels[group]}
                                </p>
                            )}
                            {items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) => `
                                        relative flex items-center px-3 py-2.5 mb-0.5 mx-2 rounded-xl transition-all duration-150 group
                                        ${isActive
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-text-muted hover:bg-text/5 hover:text-text'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`shrink-0 p-1 rounded-lg transition-colors ${isActive ? 'bg-primary/20' : ''}`}>
                                                <AnimatedIcon
                                                    icon={item.icon}
                                                    animation={item.animation}
                                                    active={isActive}
                                                    size={18}
                                                />
                                            </div>

                                            {sidebarOpen && (
                                                <motion.span
                                                    initial={false}
                                                    className={`ml-2.5 text-sm font-semibold whitespace-nowrap overflow-hidden ${isActive ? 'font-bold text-primary' : ''}`}
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}

                                            {/* Collapsed Tooltip */}
                                            {!sidebarOpen && (
                                                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl z-[100] transition-opacity whitespace-nowrap border border-white/10">
                                                    {item.label}
                                                </div>
                                            )}

                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className={`p-3 border-t ${theme === 'light' ? 'border-slate-100' : 'border-white/8'} shrink-0 flex flex-col gap-2`}>
                <button
                    onClick={handleSwitchMode}
                    className={`flex items-center justify-center gap-2 w-full p-2 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all ${!sidebarOpen && 'hidden'}`}
                >
                    <LayoutDashboard size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Switch Mode</span>
                </button>
                <div className={`flex items-center gap-3 p-3 rounded-2xl ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-all`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xs shadow-lg shrink-0 cursor-pointer" onClick={!sidebarOpen ? handleSwitchMode : undefined} title={!sidebarOpen ? "Switch Mode" : ""}>
                        {initials}
                    </div>
                    {sidebarOpen && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-text truncate leading-tight uppercase tracking-tight">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] truncate">{posMode?.toUpperCase() || user?.role || 'Admin'}</p>
                        </div>
                    )}
                    {sidebarOpen && (
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-2 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all shrink-0"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
