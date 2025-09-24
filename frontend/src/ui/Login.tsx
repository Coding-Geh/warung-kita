import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import { t } from '../store/ui';
import { useUiStore } from '../store/ui';
import { ThemeToggle } from './components/ThemeToggle';
import toast from 'react-hot-toast';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const login = useAuthStore((state) => state.login);
	const navigate = useNavigate();
	
	// UI Controls
	const theme = useUiStore((s) => s.theme);
	const setTheme = useUiStore((s) => s.setTheme);
	const locale = useUiStore((s) => s.locale);
	const setLocale = useUiStore((s) => s.setLocale);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim() || !password.trim()) {
			toast.error(t('login.error.emptyFields'));
			return;
		}

		setLoading(true);
		try {
			const response = await api.post('/auth/login', { username, password }) as any;
			const { accessToken, refreshToken, user } = response;
			login(accessToken, refreshToken, user);
			toast.success(t('login.success', { username: user.username }));
			navigate('/');
		} catch (error: any) {
			console.error('Login error:', error);
			toast.error(error.message || t('login.error.invalid'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
			{/* Controls - Top Right */}
			<div className="absolute top-4 right-4 flex items-center space-x-3">
				{/* Language Selector */}
				<div className="relative">
					<select
						value={locale}
						onChange={(e) => setLocale(e.target.value as any)}
						className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
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
						className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
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

			<div className="max-w-md w-full space-y-8">
				{/* Header */}
				<div className="text-center">
					<div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('login.title')}</h2>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('login.subtitle')}</p>
				</div>

				{/* Login Form */}
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						{/* Username Field */}
						<div>
							<label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								{t('login.username')}
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<input
									id="username"
									name="username"
									type="text"
									required
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder={t('login.placeholder.username')}
									className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
									disabled={loading}
								/>
							</div>
						</div>

						{/* Password Field */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								{t('login.password')}
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</div>
								<input
									id="password"
									name="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={t('login.placeholder.password')}
									className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200"
									disabled={loading}
								/>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
						>
							{loading ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{t('login.processing')}
								</>
							) : (
								<>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
									</svg>
									{t('login.submit')}
								</>
							)}
						</button>
					</div>

					{/* Demo Credentials */}
					<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">{t('login.demo.title')}</h3>
						<div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
							<div><strong>Admin:</strong> admin / admin123</div>
							<div><strong>Cashier:</strong> kasir / kasir123</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
