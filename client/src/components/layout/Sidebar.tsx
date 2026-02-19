import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Truck,
    History,
    Tags,
    Wrench,
    Smartphone,
    Users,
    PlusCircle,
    FileText,
    Bell,
    CreditCard,
    DollarSign
} from 'lucide-react';
import AnimatedIcon from '../common/AnimatedIcon';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', animation: 'hover-rotate' as const },
    { path: '/inventory', icon: Package, label: 'Inventory', animation: 'hover-scale' as const },
    { path: '/retail', icon: ShoppingCart, label: 'Retail POS', animation: 'bounce' as const },
    { path: '/delivery', icon: Truck, label: 'Delivery', animation: 'hover-scale' as const },
    { path: '/sales', icon: History, label: 'Sales History', animation: 'hover-rotate' as const },
    { path: '/categories', icon: Tags, label: 'Categories', animation: 'hover-scale' as const },
    { path: '/repairs', icon: Wrench, label: 'Repairs', animation: 'hover-rotate' as const },
    { path: '/reload', icon: Smartphone, label: 'Reload', animation: 'pulse' as const },
    { path: '/registration', icon: Users, label: 'Registration', animation: 'hover-scale' as const },
    { path: '/add-job', icon: PlusCircle, label: 'Add Job', animation: 'hover-rotate' as const },
    { path: '/reports', icon: FileText, label: 'Reports', animation: 'hover-scale' as const },
    { path: '/notifications', icon: Bell, label: 'Notifications', animation: 'pulse' as const },
    { path: '/hp', icon: CreditCard, label: 'Hire Purchase', animation: 'hover-scale' as const },
    { path: '/expenses', icon: DollarSign, label: 'Expenses', animation: 'bounce' as const },
];

const Sidebar = () => {
    const { sidebarOpen, theme } = useStore();

    return (
        <motion.div
            initial={{ width: sidebarOpen ? 240 : 80 }}
            animate={{ width: sidebarOpen ? 240 : 80 }}
            className={`h-screen sticky top-0 left-0 ${theme === 'light' ? 'bg-surface border-r border-slate-200 shadow-xl' : 'bg-surface/30 backdrop-blur-md border-r border-white/10'} z-50 flex flex-col transition-all duration-300`}
        >
            <div className={`h-16 flex items-center justify-center border-b ${theme === 'light' ? 'border-slate-100' : 'border-white/10'}`}>
                <h1 className={`font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate transition-all duration-300 ${!sidebarOpen && 'scale-0'}`}>
                    ApexPOS
                </h1>
                {!sidebarOpen && <span className="text-primary font-bold text-xl">AP</span>}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              relative flex items-center px-4 py-3 mb-1 mx-2 rounded-xl transition-all duration-200 group
              ${isActive
                                ? 'bg-primary/10 text-primary shadow-sm font-semibold'
                                : `text-text-muted hover:bg-text/5 hover:text-text`}
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <AnimatedIcon
                                    icon={item.icon}
                                    animation={item.animation}
                                    active={isActive}
                                    size={20}
                                    className="min-w-[20px]"
                                />
                                <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!sidebarOpen && 'w-0 opacity-0'}`}>
                                    {item.label}
                                </span>

                                {/* Hover Tooltip for collapsed state */}

                                {/* Hover Tooltip for collapsed state */}
                                {!sidebarOpen && (
                                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-text text-surface rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl z-50 transition-opacity">
                                        {item.label}
                                    </div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className={`p-4 border-t ${theme === 'light' ? 'border-slate-100' : 'border-white/10'}`}>
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md">
                        A
                    </div>
                    <div className={`ml-3 overflow-hidden transition-all duration-300 ${!sidebarOpen && 'w-0 opacity-0'}`}>
                        <p className="text-sm font-bold text-text">Admin</p>
                        <p className="text-xs text-text-muted font-medium">Manager</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
