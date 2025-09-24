import { t } from '../store/ui';

export function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full text-center space-y-8">
				{/* 404 Icon */}
				<div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
					<svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>

				{/* Error Content */}
				<div className="space-y-4">
					<h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
					<h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('notFound.title')}</h2>
					<p className="text-gray-600 dark:text-gray-400">{t('notFound.subtitle')}</p>
				</div>

				{/* Back to Home Button */}
				<div>
					<a
						href="/"
						className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
					>
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
						{t('nav.pos')}
					</a>
				</div>
			</div>
		</div>
	);
}
