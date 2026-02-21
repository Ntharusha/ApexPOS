import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
    _id: string;
    name: string;
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

    isAuthenticated: boolean;
    login: (user: { id?: string; name: string; role: string; branch_id?: string }, token?: string) => void;
    logout: () => void;

    currentShift: { _id: string; status: 'Open' | 'Closed'; openingFloat: number } | null;
    setShift: (shift: any) => void;

    cart: CartItem[];

    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Sync Engine
    pendingSales: any[];
    queueSale: (sale: any) => void;
    clearPendingSales: () => void;
    isOnline: boolean;
    setOnlineStatus: (status: boolean) => void;
}


export const useStore = create<AppState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            user: null,
            token: null,
            isAuthenticated: false,
            notifications: 3,
            currentShift: null,

            login: (user, token) => set({ user, token: token || null, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false, currentShift: null }),
            setShift: (shift) => set({ currentShift: shift }),

            cart: [],

            addToCart: (product) => set((state) => {
                const existingItem = state.cart.find((item) => item._id === product._id);
                if (existingItem) {
                    return {
                        cart: state.cart.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    };
                }
                return { cart: [...state.cart, { ...product, quantity: 1 }] };
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
                pendingSales: state.pendingSales
            }),

        }
    )
);
