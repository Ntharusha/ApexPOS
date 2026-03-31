import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    _id: string;
    name: string;
    name_si?: string;
    name_ta?: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
    barcode?: string;
    tax_category?: 'STANDARD' | 'ZERO_RATED' | 'EXEMPT';
}

export interface CartItem extends Product {
    quantity: number;
}

interface AppState {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    user: { id?: string; name: string; role: string; branch_id?: string } | null;
    token: string | null;
    notifications: number;
    setNotifications: (count: number) => void;
    fetchNotifications: () => Promise<void>;

    isAuthenticated: boolean;
    login: (user: { id?: string; name: string; role: string; branch_id?: string }, token?: string) => void;
    logout: () => void;

    currentShift: { _id: string; status: 'Open' | 'Closed'; openingFloat: number } | null;
    setShift: (shift: any) => void;

    cart: CartItem[];

    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Sync Engine
    pendingSales: any[];
    queueSale: (sale: any) => void;
    clearPendingSales: () => void;
    isOnline: boolean;
    setOnlineStatus: (status: boolean) => void;

    // Offline Data
    offlineProducts: Product[];
    offlineCategories: any[];
    syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
    lastSync: string | null;
    syncOfflineData: () => Promise<void>;
    setSyncStatus: (status: 'synced' | 'syncing' | 'offline' | 'error') => void;
}


export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            user: null,
            token: null,
            isAuthenticated: false,
            notifications: 0,
            currentShift: null,

            setNotifications: (count) => set({ notifications: count }),

            fetchNotifications: async () => {
                try {
                    const res = await fetch('http://localhost:5000/api/notifications');
                    const data = await res.json();
                    const unreadCount = data.filter((n: any) => !n.isRead).length;
                    set({ notifications: unreadCount });
                } catch (error) {
                    console.error('Failed to fetch notifications', error);
                }
            },

            login: (user, token) => set({ user, token: token || null, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false, currentShift: null }),
            setShift: (shift) => set({ currentShift: shift }),

            cart: [],

            addToCart: (product, quantity = 1) => set((state) => {
                const existingItem = state.cart.find((item) => item._id === product._id);
                if (existingItem) {
                    return {
                        cart: state.cart.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    };
                }
                return { cart: [...state.cart, { ...product, quantity }] };
            }),
            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter((item) => item._id !== productId)
            })),
            updateQuantity: (productId, quantity) => set((state) => ({
                cart: state.cart.map((item) =>
                    item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
                )
            })),
            clearCart: () => set({ cart: [] }),

            pendingSales: [],
            isOnline: navigator.onLine,
            setOnlineStatus: (isOnline) => set({ isOnline }),
            queueSale: (sale) => set((state) => ({
                pendingSales: [...state.pendingSales, { ...sale, offlineId: Date.now() }]
            })),
            clearPendingSales: () => set({ pendingSales: [] }),

            // Offline implementation
            offlineProducts: [],
            offlineCategories: [],
            syncStatus: 'synced',
            lastSync: null,

            syncOfflineData: async () => {
                const state = get();
                if (!state.isOnline) return;

                set({ syncStatus: 'syncing' });
                try {
                    // Fetch products and categories in parallel
                    const [prodRes, catRes] = await Promise.all([
                        fetch('http://localhost:5000/api/products'),
                        fetch('http://localhost:5000/api/categories')
                    ]);

                    const products = await prodRes.json();
                    const categories = await catRes.json();

                    // Initialize AlaSQL local tables
                    if ((window as any).alasql) {
                        const alasql = (window as any).alasql;

                        // Products Table
                        alasql('CREATE TABLE IF NOT EXISTS products');
                        alasql('TRUNCATE TABLE products');
                        alasql('INSERT INTO products SELECT * FROM ?', [products]);

                        // Categories Table
                        alasql('CREATE TABLE IF NOT EXISTS categories');
                        alasql('TRUNCATE TABLE categories');
                        alasql('INSERT INTO categories SELECT * FROM ?', [categories]);

                        console.log('✅ Local SQL Tables Updated (AlaSQL)');
                    }

                    set({
                        offlineProducts: products,
                        offlineCategories: categories,
                        syncStatus: 'synced',
                        lastSync: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Offline sync failed', error);
                    set({ syncStatus: 'error' });
                }
            },

            setSyncStatus: (syncStatus) => set({ syncStatus })
        }),

        {
            name: 'apex-pos-storage',
            partialize: (state) => ({
                cart: state.cart,
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                theme: state.theme,
                currentShift: state.currentShift,
                pendingSales: state.pendingSales,
                offlineProducts: state.offlineProducts,
                offlineCategories: state.offlineCategories,
                syncStatus: state.syncStatus,
                lastSync: state.lastSync
            }),

        }
    )
);
