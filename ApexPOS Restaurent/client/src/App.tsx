import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useStore } from './store/useStore';

// Protected Route Component
const ProtectedRoute = () => {
    const isAuthenticated = useStore(state => state.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ─── Restaurant POS Pages ────────────────────────────────────────────────────
import RetailPOS from './pages/RetailPOS';
import Inventory from './pages/Inventory';
import CategoryManagement from './pages/CategoryManagement';
import SalesHistory from './pages/SalesHistory';
import Registration from './pages/Registration';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import Notifications from './pages/Notifications';
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import TableManagement from './pages/TableManagement';
import QROrder from './pages/QROrder';
import KDS from './pages/KDS';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/qrmenu/:tableId" element={<QROrder />} />

                {/* Protected Restaurant POS Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />

                        {/* 🍽️ Operations */}
                        <Route path="retail-pos" element={<RetailPOS />} />
                        <Route path="retail" element={<Navigate to="/retail-pos" replace />} />
                        <Route path="hospitality" element={<TableManagement />} />
                        <Route path="kds" element={<KDS />} />

                        {/* 📋 Management */}
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="sales" element={<SalesHistory />} />

                        {/* 💰 Finance */}
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="reports" element={<Reports />} />

                        {/* ⚙️ Admin */}
                        <Route path="registration" element={<Registration />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
