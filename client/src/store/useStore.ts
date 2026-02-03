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
}

export interface CartItem extends Product {
    quantity: number;
}

interface AppState {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    user: { name: string; role: string } | null;
    notifications: number;

    isAuthenticated: boolean;
    login: (user: { name: string; role: string }) => void;
    logout: () => void;

    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            user: null,
            isAuthenticated: false,
            notifications: 3,

            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),

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
        }),
        {
            name: 'apex-pos-storage',
            partialize: (state) => ({ cart: state.cart, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
