import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface CartItem {
	product: Product;
	quantity: number;
}

interface CartState {
	items: CartItem[];
	total: number;
	discount: number;
	finalTotal: number;
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	setDiscount: (discount: number) => void;
	clearCart: () => void;
	updateTotals: () => void;
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			total: 0,
			discount: 0,
			finalTotal: 0,
			addItem: (product: Product, quantity = 1) => {
				const { items } = get();
				const existingItem = items.find((item) => item.product.id === product.id);
				
				// Check stock availability
				const currentQuantity = existingItem ? existingItem.quantity : 0;
				if (currentQuantity + quantity > product.stock) {
					throw new Error(`Stock tidak mencukupi. Tersedia: ${product.stock}`);
				}
				
				if (existingItem) {
					set({
						items: items.map((item) =>
							item.product.id === product.id
								? { ...item, quantity: item.quantity + quantity }
								: item,
						),
					});
				} else {
					set({ items: [...items, { product, quantity }] });
				}
				get().updateTotals();
			},
			removeItem: (productId: string) => {
				set({ items: get().items.filter((item) => item.product.id !== productId) });
				get().updateTotals();
			},
			updateQuantity: (productId: string, quantity: number) => {
				if (quantity <= 0) {
					get().removeItem(productId);
					return;
				}
				set({
					items: get().items.map((item) =>
						item.product.id === productId ? { ...item, quantity } : item,
					),
				});
				get().updateTotals();
			},
			setDiscount: (discount: number) => {
				set({ discount });
				get().updateTotals();
			},
			clearCart: () => set({ items: [], total: 0, discount: 0, finalTotal: 0 }),
			updateTotals: () => {
				const { items, discount } = get();
				const total = items.reduce((sum, item) => {
					const itemTotal = (item.product.price - item.product.discount) * item.quantity;
					return sum + itemTotal;
				}, 0);
				const finalTotal = Math.max(0, total - discount);
				set({ total, finalTotal });
			},
		}),
		{
			name: 'pos-cart',
		},
	),
);
