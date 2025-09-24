import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../store/auth';
import { useUiStore, applyTheme, t } from '../store/ui';
import POS from './POS';
import { Sales } from './Sales';
import { ProductsPage } from './ProductsPage';
import { Dashboard } from './Dashboard';
import Login from './Login';
import { NotFound } from './NotFound';
import { Navigation } from './Navigation';

function RequireAuth({ children }: { children: React.ReactNode }) {
	const token = useAuthStore((state) => state.token);
	return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppContent() {
	const location = useLocation();
	const token = useAuthStore((state) => state.token);
	const theme = useUiStore((s) => s.theme);
	const setTheme = useUiStore((s) => s.setTheme);
	const locale = useUiStore((s) => s.locale);
	const setLocale = useUiStore((s) => s.setLocale);

	if (typeof window !== 'undefined') applyTheme(theme);

	const isLoginPage = location.pathname === '/login';

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
			{/* Header - Only show if not on login page */}
			{!isLoginPage && (
				<header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between h-16">
							{/* Logo & Title */}
							<div className="flex items-center space-x-3">
								<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
									<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('app.title')}</h1>
							</div>

							{/* Controls - Only show if authenticated */}
							{token && (
								<div className="flex items-center space-x-3">
									{/* Language Selector */}
									<div className="relative">
										<select
											value={locale}
											onChange={(e) => setLocale(e.target.value as any)}
											className="appearance-none bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
										>
											<option value="id">🇮🇩 ID</option>
											<option value="en">🇺🇸 EN</option>
										</select>
										<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
											<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</div>

									{/* Theme Toggle */}
									<div className="relative">
										<select
											value={theme}
											onChange={(e) => setTheme(e.target.value as any)}
											className="appearance-none bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
										>
											<option value="system">🌐 System</option>
											<option value="light">☀️ Light</option>
											<option value="dark">🌙 Dark</option>
										</select>
										<div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
											<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</header>
			)}

			{/* Navigation - Only show if authenticated and not on login page */}
			{token && !isLoginPage && <Navigation />}

			{/* Main Content */}
			<main className="flex-1">
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/"
						element={
							<RequireAuth>
								<Dashboard />
							</RequireAuth>
						}
					/>
					<Route
						path="/pos"
						element={
							<RequireAuth>
								<POS />
							</RequireAuth>
						}
					/>
					<Route
						path="/sales"
						element={
							<RequireAuth>
								<Sales />
							</RequireAuth>
						}
					/>
					<Route
						path="/products"
						element={
							<RequireAuth>
								<ProductsPage />
							</RequireAuth>
						}
					/>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
		</div>
	);
}

export default function App() {
	return (
		<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<AppContent />
			
			{/* Toast Notifications */}
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 4000,
					style: {
						background: '#1f2937',
						color: '#f9fafb',
						borderRadius: '8px',
						padding: '12px 16px',
						fontSize: '14px',
						fontWeight: '500',
					},
					success: {
						duration: 3000,
						iconTheme: {
							primary: '#10b981',
							secondary: '#ffffff',
						},
						style: {
							background: '#065f46',
							color: '#ffffff',
						},
					},
					error: {
						duration: 5000,
						iconTheme: {
							primary: '#ef4444',
							secondary: '#ffffff',
						},
						style: {
							background: '#991b1b',
							color: '#ffffff',
						},
					},
				}}
			/>
		</Router>
	);
}
