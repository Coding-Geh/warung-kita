import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { t } from '../store/ui';
import toast from 'react-hot-toast';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

interface DashboardStats {
	stats: {
		totalSales: number;
		totalRevenue: number;
		totalProducts: number;
		lowStockProducts: number;
	};
	charts: {
		dailySales: { date: string; sales: number; revenue: number }[];
		topProducts: { name: string; sold: number; revenue: number }[];
		paymentMethods: { method: string; count: number; total: number }[];
	};
}

export function Dashboard() {
	const [stats, setStats] = useState<DashboardStats>({
		stats: {
			totalSales: 0,
			totalRevenue: 0,
			totalProducts: 0,
			lowStockProducts: 0,
		},
		charts: {
			dailySales: [],
			topProducts: [],
			paymentMethods: [],
		},
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		setLoading(true);
		try {
			const response = await api.get<DashboardStats>('/dashboard/stats');
			setStats(response);
		} catch (error: any) {
			console.error('Error loading dashboard stats:', error);
			toast.error(t('dashboard.error.load'));
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-4 lg:p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				</div>
			</div>
		);
	}

	// Chart configurations
	const dailySalesData = {
		labels: stats.charts.dailySales?.map(item => new Date(item.date).toLocaleDateString()) || [],
		datasets: [
			{
				label: t('dashboard.charts.dailySales'),
				data: stats.charts.dailySales?.map(item => item.revenue) || [],
				borderColor: 'rgb(59, 130, 246)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
			},
		],
	};

	const topProductsData = {
		labels: stats.charts.topProducts?.map(item => item.name) || [],
		datasets: [
			{
				label: t('dashboard.charts.topProducts'),
				data: stats.charts.topProducts?.map(item => item.sold) || [],
				backgroundColor: [
					'rgba(59, 130, 246, 0.8)',
					'rgba(16, 185, 129, 0.8)',
					'rgba(245, 158, 11, 0.8)',
					'rgba(239, 68, 68, 0.8)',
					'rgba(139, 92, 246, 0.8)',
				],
			},
		],
	};

	const paymentMethodsData = {
		labels: stats.charts.paymentMethods?.map(item => item.method) || [],
		datasets: [
			{
				data: stats.charts.paymentMethods?.map(item => item.count) || [],
				backgroundColor: [
					'rgba(59, 130, 246, 0.8)',
					'rgba(16, 185, 129, 0.8)',
					'rgba(245, 158, 11, 0.8)',
				],
				borderWidth: 2,
				borderColor: '#ffffff',
			},
		],
	};

	return (
		<div className="min-h-screen bg-gray-50 p-4 lg:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
					<p className="text-gray-600">{t('dashboard.subtitle')}</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-blue-100 rounded-lg">
								<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">{t('dashboard.stats.totalSales')}</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.stats.totalSales}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-green-100 rounded-lg">
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">{t('dashboard.stats.totalRevenue')}</p>
								<p className="text-2xl font-semibold text-gray-900">{t('common.currency')} {stats.stats.totalRevenue.toLocaleString()}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-purple-100 rounded-lg">
								<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">{t('dashboard.stats.totalProducts')}</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.stats.totalProducts}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center">
							<div className="p-2 bg-red-100 rounded-lg">
								<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">{t('dashboard.stats.lowStock')}</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.stats.lowStockProducts}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Daily Sales Line Chart */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.dailySales')}</h3>
						<div className="h-64">
							<Line 
								data={dailySalesData} 
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											display: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
										},
									},
								}}
							/>
						</div>
					</div>

					{/* Top Products Bar Chart */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.topProducts')}</h3>
						<div className="h-64">
							<Bar 
								data={topProductsData} 
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											display: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
										},
									},
								}}
							/>
						</div>
					</div>
				</div>

				{/* Payment Methods Doughnut Chart */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.paymentMethods')}</h3>
					<div className="flex items-center justify-center">
						<div className="w-64 h-64">
							<Doughnut 
								data={paymentMethodsData} 
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'bottom',
										},
									},
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
