import { useEffect, useState } from 'react';
import { api, API_BASE } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { t } from '../store/ui';
import toast from 'react-hot-toast';

type SaleItem = { id: number; productName: string; unitPrice: number; quantity: number; lineTotal: number };
type Sale = { id: number; createdAt: string; totalAmount: number; items: SaleItem[] };
type PaginatedResponse<T> = { items: T[]; meta: { page: number; limit: number; total: number; pages: number } };

export function Sales() {
	const [sales, setSales] = useState<PaginatedResponse<Sale>>({ items: [], meta: { page: 1, limit: 10, total: 0, pages: 0 } });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);
	const token = useAuthStore((state) => state.token);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [query, setQuery] = useState('');

	useEffect(() => {
		loadSales();
	}, [page, limit, query]);

	const loadSales = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.set('page', String(page));
			params.set('limit', String(limit));
			if (query.trim()) params.set('q', query.trim());
			const response = await api.get<PaginatedResponse<Sale>>(`/sales?${params.toString()}`);
			setSales(response);
		} catch (e: any) {
			setError(e?.message || t('sales.error.load'));
			toast.error(t('sales.error.load'));
		} finally {
			setLoading(false);
		}
	};

	async function handleExportCsv() {
		setExporting(true);
		try {
			const response = await fetch(`${API_BASE}/sales/export`, {
				headers: { 
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Export error response:', errorText);
				throw new Error(t('sales.error.export'));
			}
			
			const blob = await response.blob();
			
			// Check if blob is empty or invalid
			if (blob.size === 0) {
				throw new Error(t('sales.error.emptyExport'));
			}
			
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
			toast.success(t('sales.success.export'));
		} catch (e: any) {
			console.error('Export error:', e);
			toast.error(e?.message || t('sales.error.export'));
		} finally {
			setExporting(false);
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-4 lg:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-gray-900">{t('sales.title')}</h1>
					<p className="text-gray-600">{t('sales.subtitle')}</p>
				</div>

				{/* Actions */}
				<div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex items-center gap-3 w-full md:w-auto">
						<div className="relative flex-1 md:flex-initial">
							<input
								type="text"
								value={query}
								onChange={(e) => { setPage(1); setQuery(e.target.value); }}
								placeholder={t('sales.search.placeholder')}
								className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							/>
							<span className="pointer-events-none absolute right-3 top-2.5 text-gray-400">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 3.5a7.5 7.5 0 0013.15 13.15z" />
								</svg>
							</span>
						</div>
						{loading && (
							<div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
								{t('sales.loading')}
							</div>
						)}
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<label className="text-sm text-gray-600">{t('sales.pageSize')}</label>
							<select
								value={limit}
								onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
								className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
							>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
						</div>
						<button 
							onClick={handleExportCsv} 
							disabled={exporting || sales.items.length === 0}
							className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{exporting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									{t('sales.exporting')}
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									{t('sales.export')}
								</>
							)}
						</button>
					</div>
				</div>

				{/* Error */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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

				{/* Sales Table */}
				<div className="bg-white shadow-sm rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t('sales.table.date')}
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t('sales.table.total')}
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										{t('sales.table.items')}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{sales.items.length === 0 ? (
									<tr>
										<td colSpan={3} className="px-4 py-8 text-center text-gray-500">
											{loading ? t('sales.loading') : t('sales.empty')}
										</td>
									</tr>
								) : (
									sales.items.map((sale) => (
										<tr key={sale.id} className="hover:bg-gray-50">
											<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(sale.createdAt).toLocaleString()}
											</td>
											<td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{t('common.currency')} {sale.totalAmount.toLocaleString()}
											</td>
											<td className="px-4 py-4 text-sm text-gray-500">
												<div className="space-y-1">
													{sale.items.map((item) => (
														<div key={item.id} className="flex justify-between items-center">
															<span className="truncate">{item.productName}</span>
															<span className="text-gray-400">{t('common.quantity')}</span>
															<span>{item.quantity}</span>
															<span className="text-gray-400">{t('common.separator')}</span>
															<span className="font-medium">{t('common.currency')} {item.lineTotal.toLocaleString()}</span>
														</div>
													))}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination Controls */}
				{sales.meta.total > 0 && (
					<div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
						<div className="text-sm text-gray-500">
							{t('sales.pagination', { total: sales.meta.total, page: sales.meta.page, pages: sales.meta.pages })}
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page <= 1 || loading}
								className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
							>
								Prev
							</button>
							<span className="text-sm text-gray-600">{page} / {sales.meta.pages || 1}</span>
							<button
								onClick={() => setPage((p) => Math.min((sales.meta.pages || 1), p + 1))}
								disabled={page >= (sales.meta.pages || 1) || loading}
								className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
