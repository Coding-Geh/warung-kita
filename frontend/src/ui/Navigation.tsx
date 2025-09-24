import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { t } from '../store/ui';

export function Navigation() {
	const location = useLocation();
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const menuItems = [
		{ path: '/', label: t('nav.dashboard'), icon: '📊' },
		{ path: '/pos', label: t('nav.pos'), icon: '🛒' },
		{ path: '/products', label: t('nav.products'), icon: '📦' },
		{ path: '/sales', label: t('nav.sales'), icon: '📈' },
	];

	return (
		<nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Desktop Navigation */}
					<div className="hidden sm:flex sm:items-center sm:space-x-8">
						{menuItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
									location.pathname === item.path
										? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
										: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
								}`}
							>
								<span className="mr-2 text-lg">{item.icon}</span>
								{item.label}
							</Link>
						))}
					</div>

					{/* User Info & Logout - Desktop */}
					<div className="hidden sm:flex sm:items-center sm:space-x-4">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
								<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
									{user?.username?.charAt(0).toUpperCase()}
								</span>
							</div>
							<div className="text-sm">
								<div className="text-gray-900 dark:text-white font-medium">{user?.username}</div>
								<div className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
							</div>
						</div>
						<button
							onClick={logout}
							className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							{t('nav.logout')}
						</button>
					</div>

					{/* Mobile menu button */}
					<div className="sm:hidden flex items-center">
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
						>
							<span className="sr-only">Open main menu</span>
							{!mobileMenuOpen ? (
								<svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							) : (
								<svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{ mobileMenuOpen && (
				<div className="sm:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
					<div className="pt-2 pb-3 space-y-1">
						{menuItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => setMobileMenuOpen(false)}
								className={`block px-4 py-3 text-base font-medium transition-all duration-200 ${
									location.pathname === item.path
										? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
										: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 border-l-4 border-transparent'
								}`}
							>
								<span className="mr-3 text-lg">{item.icon}</span>
								{item.label}
							</Link>
						))}
					</div>
					
					{/* Mobile User Info & Logout */}
					<div className="pt-4 pb-3 border-t border-gray-200 dark:border-slate-700">
						<div className="px-4 mb-3">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
									<span className="text-sm font-medium text-blue-700 dark:text-blue-300">
										{user?.username?.charAt(0).toUpperCase()}
									</span>
								</div>
								<div>
									<div className="text-base font-medium text-gray-900 dark:text-white">{user?.username}</div>
									<div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
								</div>
							</div>
						</div>
						<button
							onClick={() => {
								logout();
								setMobileMenuOpen(false);
							}}
							className="w-full text-left px-4 py-3 text-base font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
						>
							<svg className="w-5 h-5 mr-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							{t('nav.logout')}
						</button>
					</div>
				</div>
			)}
		</nav>
	);
}
