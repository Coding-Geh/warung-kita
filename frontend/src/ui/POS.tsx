import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import { Product, PaymentMethod } from '../types';
import toast from 'react-hot-toast';
import { t } from '../store/ui';

export default function POS() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
	const [notes, setNotes] = useState('');
	const [processing, setProcessing] = useState(false);
	const [showCart, setShowCart] = useState(false);
	const [discountError, setDiscountError] = useState('');
	
	const { items, total, discount, finalTotal, addItem, removeItem, updateQuantity, setDiscount, clearCart } = useCartStore();
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		loadProducts();
	}, []);

	const loadProducts = async () => {
		try {
			const response = await api.get('/products') as any;
			setProducts(response.items || response.data?.items || response.data || []);
		} catch (error: any) {
			console.error('Error loading products:', error);
			toast.error(t('pos.error.loadProducts'));
		} finally {
			setLoading(false);
		}
	};

	const handleAddToCart = (product: Product) => {
		if (product.stock <= 0) {
			toast.error(t('pos.error.outOfStock'));
			return;
		}
		try {
			addItem(product);
			toast.success(`${product.name} ${t('pos.addedToCart')}`);
		} catch (error: any) {
			toast.error(error.message || t('pos.error.insufficientStock'));
		}
	};

	const handleDiscountChange = (value: number) => {
		setDiscountError('');
		
		if (value < 0) {
			setDiscountError(t('pos.error.discountNegative'));
			return;
		}
		
		if (value > total) {
			setDiscountError(t('pos.error.discountExceedsTotal'));
			return;
		}
		
		setDiscount(value);
	};

	const handleCheckout = async () => {
		if (items.length === 0) {
			toast.error(t('pos.error.emptyCart'));
			return;
		}

		if (discountError) {
			toast.error(discountError);
			return;
		}

		if (discount > total) {
			toast.error(t('pos.error.discountExceedsTotal'));
			return;
		}

		setProcessing(true);
		try {
			const saleData = {
				items: items.map(item => ({
					productId: item.product.id,
					quantity: item.quantity,
					unitPrice: item.product.price,
					discount: item.product.discount,
				})),
				discountAmount: discount,
				paymentMethod,
				notes: notes.trim() || undefined,
			};

			await api.post('/sales', saleData);
			toast.success(t('pos.success.transaction'));
			clearCart();
			setNotes('');
			setPaymentMethod('cash');
			setDiscountError('');
			
			// Refresh products to update stock after transaction
			await loadProducts();
		} catch (error: any) {
			toast.error(error.response?.data?.message || t('pos.error.transaction'));
		} finally {
			setProcessing(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
			{/* Mobile Cart Toggle - Fixed Position */}
			<div className="lg:hidden fixed bottom-4 right-4 z-50">
				<button
					onClick={() => setShowCart(!showCart)}
					className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
				>
					<div className="relative">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
						</svg>
						{items.length > 0 && (
							<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{items.length}
							</span>
						)}
					</div>
				</button>
			</div>

			{/* Products Section - Scrollable */}
			<div className={`flex-1 overflow-hidden ${showCart ? 'hidden lg:block' : 'block'}`}>
				<div className="h-full flex flex-col">
					{/* Products Header */}
					<div className="flex-shrink-0 p-4 lg:p-6 bg-white border-b">
						<h1 className="text-2xl font-semibold text-gray-900">{t('pos.title')}</h1>
						<p className="text-gray-600">{t('pos.subtitle')}</p>
					</div>
					
					{/* Products Grid - Scrollable */}
					<div className="flex-1 overflow-y-auto p-4 lg:p-6">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
							{products.map((product) => {
								const price = product.price || 0;
								const discount = product.discount || 0;
								const finalPrice = price - discount;
								
								return (
									<div
										key={product.id}
										onClick={() => handleAddToCart(product)}
										className={`bg-white rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
											product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
										}`}
									>
										<div className="p-3 lg:p-4">
											<h3 className="font-medium text-gray-900 truncate text-sm lg:text-base">{product.name}</h3>
											<p className="text-xs lg:text-sm text-gray-600 truncate mt-1">{product.description}</p>
											<div className="mt-2 flex justify-between items-center">
												<span className="text-base lg:text-lg font-semibold text-blue-600">
													{t('common.currency')} {finalPrice.toLocaleString()}
												</span>
												<span className={`text-xs lg:text-sm ${product.stock <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
													{product.stock}
												</span>
											</div>
											{discount > 0 ? (
												<div className="mt-1">
													<span className="text-xs text-gray-400 line-through">
														{t('common.currency')} {price.toLocaleString()}
													</span>
													<span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
														-{discount.toLocaleString()}
													</span>
												</div>
											) : (
												<div className="mt-1 h-3"></div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Cart Section - Fixed Height with Scrollable Content */}
			<div className={`${showCart ? 'block' : 'hidden'} lg:block lg:w-96 bg-white shadow-lg flex flex-col h-screen lg:h-auto`}>
				{/* Cart Header - Fixed */}
				<div className="flex-shrink-0 p-4 lg:p-6 border-b bg-white">
					<div className="flex justify-between items-center">
						<h2 className="text-lg lg:text-xl font-semibold text-gray-900">{t('pos.cart.title')}</h2>
						<button
							onClick={() => setShowCart(false)}
							className="lg:hidden text-gray-400 hover:text-gray-600"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<p className="text-sm text-gray-600">{items.length} {t('pos.cart.items')}</p>
				</div>

				{/* Cart Items - Scrollable */}
				<div className="flex-1 overflow-y-auto p-4 lg:p-6">
					{items.length === 0 ? (
						<div className="text-center text-gray-500 py-8">
							<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
							</svg>
							<p className="mt-2">{t('pos.cart.empty')}</p>
						</div>
					) : (
						<div className="space-y-3">
							{items.map((item) => {
								const price = item.product.price || 0;
								const discount = item.product.discount || 0;
								const finalPrice = price - discount;
								
								return (
									<div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
											<p className="text-sm text-gray-600">
												{t('common.currency')} {finalPrice.toLocaleString()} {t('common.quantity')} {item.quantity}
											</p>
										</div>
										<div className="flex items-center space-x-2">
											<button
												onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
												className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
											>
												-
											</button>
											<span className="w-8 text-center text-sm">{item.quantity}</span>
											<button
												onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
												disabled={item.quantity >= item.product.stock}
												className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center disabled:opacity-50 transition-colors"
											>
												+
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Cart Summary & Actions - Fixed at Bottom */}
				<div className="flex-shrink-0 border-t bg-white p-4 lg:p-6 space-y-4">
					{/* Summary */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600">{t('pos.cart.subtotal')}:</span>
							<span className="font-medium">{t('common.currency')} {total.toLocaleString()}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">{t('pos.cart.discount')}:</span>
							<span className="font-medium text-green-600">-{t('common.currency')} {discount.toLocaleString()}</span>
						</div>
						<div className="border-t pt-2 flex justify-between">
							<span className="text-lg font-semibold">{t('pos.cart.total')}:</span>
							<span className="text-lg font-semibold text-blue-600">{t('common.currency')} {finalTotal.toLocaleString()}</span>
						</div>
					</div>

					{/* Form Fields */}
					<div className="space-y-3">
						{/* Discount Input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t('pos.cart.discount')} (Max: {t('common.currency')} {total.toLocaleString()})
							</label>
							<input
								type="number"
								value={discount || ''}
								onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)}
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
									discountError ? 'border-red-300 bg-red-50' : 'border-gray-300'
								}`}
								placeholder="0"
								min="0"
								max={total}
							/>
							{discountError && (
								<p className="mt-1 text-sm text-red-600">{discountError}</p>
							)}
						</div>

						{/* Payment Method */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">{t('pos.cart.paymentMethod')}</label>
							<select
								value={paymentMethod}
								onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="cash">{t('pos.cart.cash')}</option>
								<option value="card">{t('pos.cart.card')}</option>
								<option value="qris">{t('pos.cart.qris')}</option>
							</select>
						</div>

						{/* Notes */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">{t('pos.cart.notes')}</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
								rows={2}
								placeholder={t('pos.cart.notesPlaceholder')}
							/>
						</div>
					</div>

					{/* Action Buttons - Always Visible */}
					<div className="space-y-2">
						<button
							onClick={handleCheckout}
							disabled={items.length === 0 || processing}
							className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{processing ? t('pos.cart.processing') : t('pos.cart.checkout')}
						</button>
						<button
							onClick={clearCart}
							disabled={items.length === 0}
							className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{t('pos.cart.clear')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
