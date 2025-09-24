import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { t } from '../store/ui';
import toast from 'react-hot-toast';
import { Product, PaginatedResponse } from '../types';

type FormState = Partial<Pick<Product, 'name' | 'description' | 'price' | 'stock'>>;

export function ProductsPage() {
	const [data, setData] = useState<PaginatedResponse<Product>>({ items: [], meta: { page: 1, limit: 10, total: 0, pages: 0 } });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<FormState>({ name: '', description: '', price: 0, stock: 0 });
	const [priceInput, setPriceInput] = useState('');
	const [stockInput, setStockInput] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [confirmLoading, setConfirmLoading] = useState(false);

	function load() {
		setLoading(true);
		api.get<PaginatedResponse<Product>>('/products').then(setData).catch((e) => {
			setError(e?.message || t('products.error.load'));
			toast.error(t('products.error.load'));
		}).finally(() => setLoading(false));
	}

	useEffect(() => { load(); }, []);

	async function handleSave() {
		setError(null);
		
		// Parse input values
		const price = priceInput === '' ? 0 : Number(priceInput);
		const stock = stockInput === '' ? 0 : Number(stockInput);
		
		const payload = { ...form, price, stock };
		try {
			if (editingId) {
				await api.put(`/products/${editingId}`, payload);
				toast.success(t('products.success.update'));
			} else {
				await api.post('/products', payload);
				toast.success(t('products.success.create'));
			}
			setForm({ name: '', description: '', price: 0, stock: 0 });
			setPriceInput('');
			setStockInput('');
			setEditingId(null);
			setShowForm(false);
			load();
		} catch (e: any) {
			const msg = e?.message || t('products.error.save');
			setError(msg);
			toast.error(msg);
		}
	}

	async function handleEdit(p: Product) {
		setEditingId(p.id);
		setForm({ name: p.name, description: p.description ?? '', price: p.price, stock: p.stock });
		setPriceInput(p.price.toString());
		setStockInput(p.stock.toString());
		setShowForm(true);
	}

	async function handleDeleteRequest(id: string) {
		setConfirmId(id);
	}

	async function confirmDelete() {
		if (!confirmId) return;
		setConfirmLoading(true);
		try {
			await api.delete(`/products/${confirmId}`);
			toast.success(t('products.success.delete'));
			setConfirmId(null);
			load();
		} catch (e: any) {
			const msg = e?.message || t('products.error.delete');
			setError(msg);
			toast.error(msg);
		} finally {
			setConfirmLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4 lg:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-gray-900">{t('products.title')}</h1>
					<p className="text-gray-600">{t('products.subtitle')}</p>
				</div>

				{/* Mobile Add Button */}
				<div className="lg:hidden mb-4">
					<button
						onClick={() => {
							if (showForm) {
								setShowForm(false);
								setForm({ name: '', description: '', price: 0, stock: 0 });
								setPriceInput('');
								setStockInput('');
							} else {
								setShowForm(true);
							}
						}}
						className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
					>
						{showForm ? t('products.cancel') : t('products.add')}
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Products Table */}
					<section className="lg:col-span-2">
						<div className="bg-white shadow-sm rounded-lg overflow-hidden">
							{/* Table Header */}
							<div className="px-4 py-3 border-b border-gray-200 sm:px-6">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-gray-900">{t('products.list.title')}</h2>
									{loading && (
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
											{t('products.loading')}
										</div>
									)}
								</div>
							</div>

							{/* Error */}
							{error && (
								<div className="px-4 py-3 bg-red-50 border-b border-red-200 sm:px-6">
									<div className="flex">
										<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<div className="ml-3">
											<p className="text-sm text-red-800">{error}</p>
										</div>
									</div>
								</div>
							)}

							{/* Table */}
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												{t('products.table.name')}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												{t('products.table.price')}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												{t('products.table.stock')}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												{t('products.table.actions')}
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{data.items.length === 0 ? (
											<tr>
												<td colSpan={4} className="px-4 py-8 text-center text-gray-500">
													{loading ? t('products.loading') : t('products.empty')}
												</td>
											</tr>
										) : (
											data.items.map((product) => (
												<tr key={product.id} className="hover:bg-gray-50">
													<td className="px-4 py-4 whitespace-nowrap">
														<div>
															<div className="text-sm font-medium text-gray-900">{product.name}</div>
															{product.description && (
																<div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
															)}
														</div>
													</td>
													<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
														{t('common.currency')} {product.price.toLocaleString()}
													</td>
													<td className="px-4 py-4 whitespace-nowrap">
														<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
															product.stock <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
														}`}>
															{product.stock}
														</span>
													</td>
													<td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
														<div className="flex items-center gap-2">
															<button
																onClick={() => handleEdit(product)}
																className="text-blue-600 hover:text-blue-900 transition-colors"
															>
																{t('products.edit')}
															</button>
															<button
																onClick={() => handleDeleteRequest(product.id)}
																className="text-red-600 hover:text-red-900 transition-colors"
															>
																{t('products.delete')}
															</button>
														</div>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</section>

					{/* Form Sidebar */}
					<aside className={`${showForm ? 'block' : 'hidden'} lg:block`}>
						<div className="bg-white rounded-lg border shadow-sm p-4 lg:sticky lg:top-20">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								{editingId ? t('products.form.edit') : t('products.form.add')}
							</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										{t('products.form.name')}
									</label>
									<input
										value={form.name ?? ''}
										onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
										placeholder={t('products.form.namePlaceholder')}
										className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										{t('products.form.description')}
									</label>
									<textarea
										value={form.description ?? ''}
										onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
										placeholder={t('products.form.descriptionPlaceholder')}
										rows={3}
										className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									/>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{t('products.form.price')}
										</label>
										<input
											type="number"
											value={priceInput}
											onChange={(e) => setPriceInput(e.target.value)}
											placeholder="0"
											min="0"
											className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{t('products.form.stock')}
										</label>
										<input
											type="number"
											value={stockInput}
											onChange={(e) => setStockInput(e.target.value)}
											placeholder="0"
											min="0"
											className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={handleSave}
										className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
									>
										{t('products.save')}
									</button>
									{editingId && (
										<button
											onClick={() => {
												setEditingId(null);
												setForm({ name: '', description: '', price: 0, stock: 0 });
												setPriceInput('');
												setStockInput('');
												setShowForm(false);
											}}
											className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
										>
											{t('products.cancel')}
										</button>
									)}
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
			{/* Confirm Delete Modal */}
			{confirmId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50" onClick={() => !confirmLoading && setConfirmId(null)} />
					<div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-5">
						<h4 className="text-lg font-semibold text-gray-900 mb-2">{t('products.delete')}</h4>
						<p className="text-gray-600 mb-4">{t('products.confirm.delete')}</p>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => setConfirmId(null)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
								disabled={confirmLoading}
							>
								{t('products.cancel')}
							</button>
							<button
								onClick={confirmDelete}
								className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
								disabled={confirmLoading}
							>
								{confirmLoading ? t('sales.loading') : t('products.delete')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
