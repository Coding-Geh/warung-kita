export type UUID = string;

export type UserRole = 'admin' | 'cashier';

export interface User {
	id: UUID;
	username: string;
	role: UserRole;
}

export interface Category {
	id: UUID;
	name: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Product {
	id: UUID;
	name: string;
	description?: string;
	price: number;
	stock: number;
	discount: number;
	isActive: boolean;
	categoryId?: UUID;
	category?: Category;
	createdAt: string;
	updatedAt: string;
}

export interface SaleItem {
	id: UUID;
	productId: UUID;
	productName: string;
	unitPrice: number;
	discount: number;
	quantity: number;
	lineTotal: number;
	createdAt: string;
	updatedAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'qris';
export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
	id: UUID;
	totalAmount: number;
	discountAmount: number;
	finalAmount: number;
	paymentMethod: PaymentMethod;
	status: SaleStatus;
	notes?: string;
	items: SaleItem[];
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
}

export interface ApiResponse<T> {
	success: boolean;
	data: T;
}
