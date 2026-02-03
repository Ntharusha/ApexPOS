import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useStore } from './store/useStore';
import Inventory from './pages/Inventory';

// Protected Route Component
const ProtectedRoute = () => {
    const isAuthenticated = useStore(state => state.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

import RetailPOS from './pages/RetailPOS';
import CategoryManagement from './pages/CategoryManagement';
import SalesHistory from './pages/SalesHistory';
import Delivery from './pages/Delivery';
import RepairManagement from './pages/RepairManagement';
import AddJob from './pages/AddJob';
import Reload from './pages/Reload';
import Registration from './pages/Registration';
import Reports from './pages/Reports';
import HirePurchase from './pages/HirePurchase';
import Expenses from './pages/Expenses';
import Notifications from './pages/Notifications';

// Placeholder components for other routes
const Placeholder = ({ title }: { title: string }) => (
    <div className="p-10 flex items-center justify-center flex-col glass-card min-h-[400px]">
        <h2 className="text-3xl font-bold text-gray-200 mb-4">{title}</h2>
        <p className="text-gray-400">Component under construction</p>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="retail" element={<RetailPOS />} />
                        <Route path="delivery" element={<Delivery />} />
                        <Route path="sales" element={<SalesHistory />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="repairs" element={<RepairManagement />} />
                        <Route path="reload" element={<Reload />} />
                        <Route path="registration" element={<Registration />} />
                        <Route path="add-job" element={<AddJob />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="hp" element={<HirePurchase />} />
                        <Route path="expenses" element={<Expenses />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
